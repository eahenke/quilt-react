import { EMPTY } from '../constants';
import { Coord, Quilt } from '../types';
import { isDefined, isSameCoord, mod, range } from '../util';
import { BasePattern } from './base-pattern';

const PATCH_COLUMNS = 6;

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
    NORTH: [-1, 0],
    NORTHEAST: [-1, PATCH_COLUMNS],
    EAST: [0, PATCH_COLUMNS],
    SOUTHEAST: [1, PATCH_COLUMNS],
    SOUTH: [1, 0],
    SOUTHWEST: [1, -1 * PATCH_COLUMNS],
    WEST: [0, -1 * PATCH_COLUMNS],
    NORTHWEST: [-1, -1 * PATCH_COLUMNS],
} as const;

const PATCH_POSITION_ADJACENCY_MAP = {
    [POSITIONS.NORTH]: POSITIONS.SOUTH,
    [POSITIONS.SOUTH]: POSITIONS.NORTH,
    [POSITIONS.EAST]: POSITIONS.WEST,
    [POSITIONS.WEST]: POSITIONS.EAST,
};

export class SameSkyPattern implements BasePattern {
    fabrics: number;
    patchCols: number;
    patchRows: number;
    // centerCols: Set<number>;
    fabricRange: number[];

    static patchCols = 6;
    static patchRows = 2;

    constructor({ fabrics }: SameSkyPatternOptions) {
        this.fabrics = fabrics;
        this.patchCols = 6;
        this.patchRows = 1;
        // TODO: need this?
        // this.centerCols = new Set([2, 3]);
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
    getPosition(coord: Coord) {
        return this.getCoordinateInPatch(coord)[1];
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

    getCardinalDirectionFromPosition(position: number): CardinalDirection | null {
        if (position === 0) return 'NORTH';
        if (position === 1) return 'EAST';
        if (position === 2) return 'SOUTH';
        if (position === 3) return 'WEST';

        return null;
    }

    getAdjacentPatchNeighbor(coord: Coord) {
        const position = this.getPosition(coord);
        if (!this.isSidePosition(position)) {
            return null;
        }
        const neighborPosition = PATCH_POSITION_ADJACENCY_MAP[position];
        const neighborDirection = this.getCardinalDirectionFromPosition(position);
        if (!neighborDirection) {
            return null;
        }
        const adjacentPatch = this.getAdjacentPatch(coord, neighborDirection);
        const neighborCoords = adjacentPatch[neighborPosition];

        return neighborCoords;
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
    getSidePositionsAdjacentToArrows(coord: Coord) {
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

    // 3. Arrows pointing in same direction towards shared center must not match
    isDifferentFromAdjacentArrows(quilt: Quilt, coord: Coord, value: number) {
        const ringArrowCoords = this.getRingArrowCoords(coord);

        return this.doNotMatch(quilt, value, ringArrowCoords);
    }

    // 4. Arrows cannot match same arrow direction on diagonal patches
    isDifferentFromDiagonalArrows(quilt: Quilt, coord: Coord, value: number) {
        const adjacentDiagonalArrows = this.getDiagonalArrowCoords(coord);

        return this.doNotMatch(quilt, value, adjacentDiagonalArrows);
    }

    // 5. Arrow cannot match the neighbor of an adjacent side piece from the same pathc
    isDifferentFromAdjacentNeighbor(quilt: Quilt, coord: Coord, value: number) {
        const adjacentSidePositions = this.getSidePositionsAdjacentToArrows(coord);
        const neighbors = adjacentSidePositions
            .map(sideCoord => {
                return this.getAdjacentPatchNeighbor(sideCoord);
            })
            .filter(isDefined);

        return this.doNotMatch(quilt, value, neighbors);
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
        // const strictRules = [this.isDifferentFromInnerPatchRings, this.isDifferentFromDiagonal];
        const baseRules = [this.isUniqueInPatch];
        const position = this.getPosition(coord);

        if (this.isArrowPosition(position)) {
            const arrowRules = [
                ...baseRules,
                this.isDifferentFromAdjacentArrows,
                this.isDifferentFromDiagonalArrows,
                this.isDifferentFromAdjacentNeighbor,
            ];

            return arrowRules.every(rule => rule.call(this, quilt, coord, value));
        }

        const sidePositionRules = [...baseRules, this.isDifferentFromNeighbor];

        return sidePositionRules.every(rule => rule.call(this, quilt, coord, value));
    }
}
