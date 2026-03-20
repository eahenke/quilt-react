import { EMPTY } from '../constants';
import { Coord, Quilt } from '../types';
import { isDefined, isSameCoord, mod, range } from '../util';
import { BasePattern } from './base-pattern';

const PATCH_COLUMNS = 6;
const PATCH_ROWS = 1;

type SameSkyPatternOptions = {
    fabrics: number;
};

const POSITIONS = {
    NORTH: 0,
    EAST: 1,
    SOUTH: 2,
    WEST: 3,
    ARROW_UP: 4,
    ARROW_DOWN: 5,
} as const;

type SidePosition =
    | typeof POSITIONS.NORTH
    | typeof POSITIONS.EAST
    | typeof POSITIONS.SOUTH
    | typeof POSITIONS.WEST;

type ArrowPosition = typeof POSITIONS.ARROW_UP | typeof POSITIONS.ARROW_DOWN;

type Position = SidePosition | ArrowPosition;

type Direction =
    | 'NORTH'
    | 'NORTHEAST'
    | 'EAST'
    | 'SOUTHEAST'
    | 'SOUTH'
    | 'SOUTHWEST'
    | 'WEST'
    | 'NORTHWEST';

type CardinalDirection = 'NORTH' | 'EAST' | 'SOUTH' | 'WEST';

const PATCH_DIRECTION_MAP: Record<Direction, [number, number]> = {
    NORTH: [-1 * PATCH_ROWS, 0],
    NORTHEAST: [-1 * PATCH_ROWS, PATCH_COLUMNS],
    EAST: [0, PATCH_COLUMNS],
    SOUTHEAST: [PATCH_ROWS, PATCH_COLUMNS],
    SOUTH: [PATCH_ROWS, 0],
    SOUTHWEST: [PATCH_ROWS, -1 * PATCH_COLUMNS],
    WEST: [0, -1 * PATCH_COLUMNS],
    NORTHWEST: [-1 * PATCH_ROWS, -1 * PATCH_COLUMNS],
} as const;

const POSITION_OPPOSITE_MAP = {
    [POSITIONS.NORTH]: POSITIONS.SOUTH,
    [POSITIONS.SOUTH]: POSITIONS.NORTH,
    [POSITIONS.EAST]: POSITIONS.WEST,
    [POSITIONS.WEST]: POSITIONS.EAST,
    [POSITIONS.ARROW_UP]: POSITIONS.ARROW_DOWN,
    [POSITIONS.ARROW_DOWN]: POSITIONS.ARROW_UP,
};

export class SameSkyPattern implements BasePattern {
    fabrics: number;
    patchCols: number;
    patchRows: number;
    fabricRange: number[];

    static patchCols = PATCH_COLUMNS;
    static patchRows = PATCH_ROWS;

    static toDisplay(quilt: Quilt) {
        return quilt;
    }

    constructor({ fabrics }: SameSkyPatternOptions) {
        this.fabrics = fabrics;
        this.patchCols = PATCH_COLUMNS;
        this.patchRows = PATCH_ROWS;
        this.fabricRange = range(1, fabrics);
    }

    /* Helpers */
    doNotMatch(quilt: Quilt, value: number, coords: Coord[]): boolean {
        return coords.every(([i, j]) => {
            // Off the quilt, don't compare
            if (i < 0 || i >= quilt.length) return true;
            if (j < 0 || j >= quilt[0].length) return true;

            const cell = quilt[i][j];
            // Off the quilt, don't compare
            if (cell === undefined) return true;

            return cell !== value;
        });
    }

    isSidePosition(position: number): position is SidePosition {
        return (
            position === POSITIONS.NORTH ||
            position === POSITIONS.EAST ||
            position === POSITIONS.SOUTH ||
            position === POSITIONS.WEST
        );
    }

    isArrowPosition(position: number): position is ArrowPosition {
        return position === POSITIONS.ARROW_UP || position === POSITIONS.ARROW_DOWN;
    }

    isEvenPatch(coord: Coord) {
        const [row] = coord;
        const quiltCol = this.getQuiltCol(coord);

        return (row + quiltCol) % 2 === 0;
    }

    // Get coordinate relative to patch group
    getCoordinateInPatch([row, col]: Coord) {
        return [mod(row, this.patchRows), mod(col, this.patchCols)];
    }

    // Gets the relative column in the patch, which corresponds to position
    getPosition(coord: Coord): Position {
        return this.getCoordinateInPatch(coord)[1] as Position;
    }

    getOppositePosition(position: Position) {
        return POSITION_OPPOSITE_MAP[position];
    }

    getCardinalDirectionFromPosition(position: number): CardinalDirection | null {
        if (position === 0) return 'NORTH';
        if (position === 1) return 'EAST';
        if (position === 2) return 'SOUTH';
        if (position === 3) return 'WEST';

        return null;
    }

    getQuiltCol(coord: Coord) {
        const [_row, col] = coord;
        return Math.floor(col / this.patchCols);
    }

    // Get the coords of all members in a patch
    getPatchMemberCoords([row, col]: Coord) {
        const [_relativeRow, relativeCol] = this.getCoordinateInPatch([row, col]);

        const startDiff = 0 - relativeCol;
        const endDiff = this.patchCols - relativeCol;

        const coords = [];
        for (let i = col + startDiff; i < col + endDiff; i++) {
            coords.push([row, i]);
        }

        return coords;
    }

    // Get the values of all members in a patch
    getPatchMemberValues(quilt: Quilt, coord: Coord) {
        const patchMemberCoords = this.getPatchMemberCoords(coord);

        return patchMemberCoords.map(([row, col]) => {
            return quilt[row][col];
        });
    }

    getAdjacentPatch(coord: Coord, direction: Direction) {
        const [row, col] = coord;
        const [rowAddend, colAddend] = PATCH_DIRECTION_MAP[direction];
        const adjustedCoord = [row + rowAddend, col + colAddend];

        return this.getPatchMemberCoords(adjustedCoord);
    }

    // Gets the corresponding position in the adjacent patch, but for rotated cardinality
    // (ie, if position is North/South, check the North of the patches east and west)
    getCorrespondingPositionInAdjacentPatches(coord: Coord) {
        // TODO: Maybe more readable using directions and this.getAdjacentPatch
        const position = this.getPosition(coord);
        // Look left and right
        const leftRight: Position[] = [POSITIONS.NORTH, POSITIONS.SOUTH];
        if (leftRight.includes(position)) {
            return [-1, 1].map(mult => [coord[0], coord[1] + mult * PATCH_COLUMNS]);
        }
        // Look up and down
        const upDown: Position[] = [POSITIONS.WEST, POSITIONS.EAST];
        if (upDown.includes(position)) {
            return [-1, 1].map(mult => [coord[0] + mult * PATCH_ROWS, coord[1]]);
        }

        // Arrows are not supported in this context
        return [];
    }

    getAdjacentPatchNeighbor(coord: Coord) {
        const position = this.getPosition(coord);
        if (!this.isSidePosition(position)) {
            return null;
        }
        const neighborPosition = POSITION_OPPOSITE_MAP[position];
        const neighborDirection = this.getCardinalDirectionFromPosition(position);
        if (!neighborDirection) {
            return null;
        }
        const adjacentPatch = this.getAdjacentPatch(coord, neighborDirection);
        const neighborCoords = adjacentPatch[neighborPosition];

        return neighborCoords;
    }

    // Gets the coords of side positions across the diagonal (ie, South and East <-> North and West across the SW diagonal)
    getDiagonalOppositePosition(coord: Coord) {
        const position = this.getPosition(coord);
        const oppositePosition = this.getOppositePosition(position);
        // For even, NW is paired w/ SE. For odd it's the opposite
        const even = this.isEvenPatch(coord);

        let direction: Direction;
        if (even) {
            const directionalPositions: Position[] = [
                POSITIONS.NORTH,
                POSITIONS.WEST,
                POSITIONS.ARROW_UP,
            ];
            direction = directionalPositions.includes(position) ? 'NORTHWEST' : 'SOUTHEAST';
        } else {
            const directionalPositions: Position[] = [
                POSITIONS.NORTH,
                POSITIONS.EAST,
                POSITIONS.ARROW_UP,
            ];
            direction = directionalPositions.includes(position) ? 'NORTHEAST' : 'SOUTHWEST';
        }

        const diagonalPatchMembers = this.getAdjacentPatch(coord, direction);
        const oppositeCoord = diagonalPatchMembers[oppositePosition];

        return oppositeCoord;
    }

    /**
     * For a side position, gets the other side position that is adjacent to the arrow. For even cells,
     * the partners are (North, West) and (South, East). For odd cells it's (North, East) and (South, West)
     */

    getPartneredPosition(coord: Coord) {
        const position = this.getPosition(coord);
        const even = this.isEvenPatch(coord);
        const patchMembers = this.getPatchMemberCoords(coord);

        if (position === POSITIONS.NORTH) {
            return even ? patchMembers[POSITIONS.WEST] : patchMembers[POSITIONS.EAST];
        }

        if (position === POSITIONS.EAST) {
            return even ? patchMembers[POSITIONS.SOUTH] : patchMembers[POSITIONS.NORTH];
        }

        if (position === POSITIONS.SOUTH) {
            return even ? patchMembers[POSITIONS.EAST] : patchMembers[POSITIONS.WEST];
        }

        if (position === POSITIONS.WEST) {
            return even ? patchMembers[POSITIONS.NORTH] : patchMembers[POSITIONS.SOUTH];
        }
    }

    // Get the coords of an arrow touching the side position
    getTouchingArrow(coord: Coord) {
        const even = this.isEvenPatch(coord);
        const patchMemberCoords = this.getPatchMemberCoords(coord);
        const position = this.getPosition(coord);
        if (this.isArrowPosition(position)) {
            return coord;
        }

        if (
            position === POSITIONS.NORTH ||
            (even && position === POSITIONS.WEST) ||
            (!even && position === POSITIONS.EAST)
        ) {
            return patchMemberCoords[POSITIONS.ARROW_UP];
        } else {
            return patchMemberCoords[POSITIONS.ARROW_DOWN];
        }
    }

    getRingArrowDirections(coord: Coord): Direction[] {
        const position = this.getPosition(coord);
        const even = this.isEvenPatch(coord);

        if (position === POSITIONS.ARROW_DOWN) {
            return even ? ['EAST', 'SOUTHEAST', 'SOUTH'] : ['SOUTH', 'NORTHWEST', 'WEST'];
        } else {
            return even ? ['WEST', 'NORTHWEST', 'NORTH'] : ['NORTH', 'NORTHEAST', 'EAST'];
        }
    }

    // Get coords of arrows forming a ring around the same white space
    getRingArrowCoords(coord: Coord) {
        const position = this.getPosition(coord);
        if (!this.isArrowPosition(position)) {
            return [];
        }

        const directions = this.getRingArrowDirections(coord);

        const arrowCoords = directions.map(dir => {
            const patch = this.getAdjacentPatch(coord, dir);
            const patchArrowPosition = dir.includes('NORTH')
                ? POSITIONS.ARROW_DOWN
                : dir.includes('SOUTH')
                  ? POSITIONS.ARROW_UP
                  : position;

            return patch[patchArrowPosition];
        });
        return arrowCoords;
    }

    // Get coordinates of arrow pointing in same direction in both adjacent diagonals
    getDiagonalArrowCoords(coord: Coord) {
        const position = this.getPosition(coord);
        const directions: Direction[] = this.isEvenPatch(coord)
            ? ['NORTHWEST', 'SOUTHEAST']
            : ['NORTHEAST', 'SOUTHWEST'];

        return directions.map(dir => {
            const patch = this.getAdjacentPatch(coord, dir);
            return patch[position];
        });
    }

    // For even patches, ARROW_UP is paried with North/West. For odd, North/East. ARROW_DOWN is the inverse
    getSidePositionsTouchingArrows(coord: Coord) {
        const position = this.getPosition(coord);
        const directionsPairs: Direction[][] = this.isEvenPatch(coord)
            ? [
                  ['NORTH', 'WEST'],
                  ['SOUTH', 'EAST'],
              ]
            : [
                  ['NORTH', 'EAST'],
                  ['SOUTH', 'WEST'],
              ];

        const pairIdx = position === POSITIONS.ARROW_UP ? 0 : 1;

        const patchMemberCoords = this.getPatchMemberCoords(coord);
        return directionsPairs[pairIdx]
            .map(dir => {
                const typeSafeKey = dir as keyof typeof POSITIONS;
                const pos = POSITIONS[typeSafeKey];

                return patchMemberCoords[pos];
            })
            .filter(isDefined);
    }

    /* Rules */

    // 1. Patches must contain 4 unique values. Partnered side positions can match, but no others
    isUniqueInPatch(quilt: Quilt, coord: Coord, value: number) {
        const patchCoords = this.getPatchMemberCoords(coord);
        const partnerPosition = this.getPartneredPosition(coord);

        const nonPartnerMembers = patchCoords.filter(pc =>
            partnerPosition ? !isSameCoord(pc, partnerPosition) : true
        );

        return this.doNotMatch(quilt, value, nonPartnerMembers);
    }

    // 2. Across patches, adjacent cells cannot match
    isDifferentFromNeighbor(quilt: Quilt, coord: Coord, value: number) {
        const neighbor = this.getAdjacentPatchNeighbor(coord);
        if (neighbor === null) return true;

        return this.doNotMatch(quilt, value, [neighbor]);
    }

    // 3. North/South should not match corresponding in left/right.
    // East/West should not match corresponding in up/down
    isDifferentFromAdjacentCorresponding(quilt: Quilt, coord: Coord, value: number) {
        const adjacentCorrespondingCoords = this.getCorrespondingPositionInAdjacentPatches(coord);

        return this.doNotMatch(quilt, value, adjacentCorrespondingCoords);
    }

    // 4. Side positions should not match their corresponding side positions across the diagonal
    isDifferentFromDiagonalOppositePositions(quilt: Quilt, coord: Coord, value: number) {
        const diagonalOppositePosition = this.getDiagonalOppositePosition(coord);

        return this.doNotMatch(quilt, value, [diagonalOppositePosition]);
    }

    // 5. Arrows pointing in same direction towards shared center must not match
    isDifferentFromRingArrows(quilt: Quilt, coord: Coord, value: number) {
        const ringArrowCoords = this.getRingArrowCoords(coord);

        return this.doNotMatch(quilt, value, ringArrowCoords);
    }

    // 6. Arrows cannot match same arrow direction on diagonal patches
    isDifferentFromDiagonalArrows(quilt: Quilt, coord: Coord, value: number) {
        const adjacentDiagonalArrows = this.getDiagonalArrowCoords(coord);

        return this.doNotMatch(quilt, value, adjacentDiagonalArrows);
    }

    // 7. Arrow cannot match the neighbor of an adjacent side piece from the same patch (and vice-versa)
    isDifferentFromAdjacentNeighbor(quilt: Quilt, coord: Coord, value: number) {
        const position = this.getPosition(coord);

        if (this.isArrowPosition(position)) {
            const adjacentSidePositions = this.getSidePositionsTouchingArrows(coord);
            const neighbors = adjacentSidePositions
                .map(sideCoord => {
                    return this.getAdjacentPatchNeighbor(sideCoord);
                })
                .filter(isDefined);

            return this.doNotMatch(quilt, value, neighbors);
        } else {
            const partner = this.getPartneredPosition(coord);
            const neighbors = [coord, partner]
                .filter(isDefined)
                .map(c => this.getAdjacentPatchNeighbor(c))
                .filter(isDefined);

            const arrowsAdjacentToNeighbors = neighbors.map(c => this.getTouchingArrow(c));

            return this.doNotMatch(quilt, value, arrowsAdjacentToNeighbors);
        }
    }

    /* Public */
    public getValidFabric(quilt: Quilt, coord: Coord): number[] {
        const position = this.getPosition(coord);

        // Side pieces next to arrows much match their partner
        if (this.isSidePosition(position)) {
            const partneredCoord = this.getPartneredPosition(coord);
            if (!partneredCoord) {
                return this.fabricRange;
            }

            const [i, j] = partneredCoord;
            const partnerFabric = quilt[i][j];

            return partnerFabric === EMPTY ? this.fabricRange : [partnerFabric];
        }
        return this.fabricRange;
    }

    public canAdd(quilt: Quilt, coord: Coord, value: number) {
        const baseRules = [
            this.isUniqueInPatch,
            this.isDifferentFromDiagonalOppositePositions,
            this.isDifferentFromAdjacentNeighbor,
        ];
        const position = this.getPosition(coord);

        if (this.isArrowPosition(position)) {
            const arrowRules = [
                ...baseRules,
                this.isDifferentFromRingArrows,
                this.isDifferentFromDiagonalArrows,
            ];

            return arrowRules.every(rule => rule.call(this, quilt, coord, value));
        }

        const sidePositionRules = [
            ...baseRules,
            this.isDifferentFromNeighbor,
            this.isDifferentFromAdjacentCorresponding,
        ];

        return sidePositionRules.every(rule => rule.call(this, quilt, coord, value));
    }
}
