import { EMPTY, BACKGROUND } from '../constants';
import { Coord, Quilt } from '../types';
import { generateEmptyQuilt, mod, range } from '../util';

const isEven = (n: number) => n % 2 === 0;

type HarkernPatternArgs = {
    fabrics: number;
};

export class HarkenPattern {
    fabrics: number;
    patchCols: number;
    patchRows: number;
    centerCols: Set<number>;
    fabricRange: number[];

    static patchCols = 6;
    static patchRows = 2;
    static expandedRows = 6;
    static expandedCols = 6;

    // TODO: fix magic numbers
    // Add in the white space, represent as either 0 or -1 or null
    static toDisplay(quilt: Quilt) {
        const mappings = [
            [
                [0, 0],
                [1, 1],
                [2, 2],
                [2, 3],
                [1, 4],
                [0, 5]
            ],
            [
                [5, 0],
                [4, 1],
                [3, 2],
                [3, 3],
                [4, 4],
                [5, 5]
            ]
        ];

        const rowModifier = this.expandedRows / this.patchRows;
        const colModifier = this.expandedCols / this.patchCols;
        const expandedQuilt = generateEmptyQuilt(quilt.length * rowModifier, quilt[0].length * colModifier, BACKGROUND);

        for (let row = 0; row < quilt.length; row++) {
            for (let col = 0; col < quilt[0].length; col++) {
                const relativeRow = mod(row, 2);
                const relativeCol = mod(col, 6);

                const patchRowModifier = Math.floor(row / 2) * this.expandedCols;
                const patchColModifier = Math.floor(col / 6) * this.expandedCols;

                const relativePosition = mappings[relativeRow][relativeCol];
                const mappedRow = relativePosition[0] + patchRowModifier;
                const mappedCol = relativePosition[1] + patchColModifier;

                expandedQuilt[mappedRow][mappedCol] = quilt[row][col];
            }
        }

        return expandedQuilt;
    }

    constructor({ fabrics }: HarkernPatternArgs) {
        this.fabrics = fabrics;
        this.patchCols = 6;
        // Expanded to 6, empty space ignored
        this.patchRows = 2;
        this.centerCols = new Set([2, 3]);
        this.fabricRange = range(1, fabrics);
    }

    getRelativeCenterCoord(): Coord {
        return [0, Math.floor((this.patchCols - 1) / 2)];
    }

    getFromRelative([row, col]: Coord, [targetRow, targetCol]: Coord) {
        const [relativeRow, relativeCol] = this.getCoordinateInPatch([row, col]);
        const colDiff = targetCol - relativeCol;
        const rowDiff = targetRow - relativeRow;

        return [row + rowDiff, col + colDiff];
    }

    // Coordinate manipulation - these could be static
    // And also are a whole-quilt strategy, not a Patch[][] strategy
    getCoordinateInPatch([row, col]: Coord) {
        return [mod(row, this.patchRows), mod(col, this.patchCols)];
    }

    // Get the NW cell of the center 4
    getPatchCenter([row, col]: Coord): Coord {
        return this.getFromRelative([row, col], this.getRelativeCenterCoord());
    }

    getNonCenterCoords(coord: Coord): Coord[] {
        const rowRange = range(0, this.patchRows - 1);
        const nonCenterCols = range(0, this.patchCols - 1).filter(n => !this.centerCols.has(n));
        const nonCenterCoords = rowRange.map(row => nonCenterCols.map(col => [row, col])).flat();
        const centerCoord = this.getPatchCenter(coord);

        return nonCenterCoords.map(c => this.getFromRelative(centerCoord, c));
    }

    getAdjacentCoords([row, col]: Coord): Coord[] {
        const up = [row - 1, col];
        const right = [row, col + 1];
        const down = [row + 1, col];
        const left = [row, col - 1];

        return [up, right, down, left];
    }

    getDiagonalCoords([row, col]: Coord): Coord[] {
        const nw = [row - 1, col - 1];
        const ne = [row - 1, col + 1];
        const se = [row + 1, col + 1];
        const sw = [row + 1, col - 1];

        return [nw, ne, se, sw];
    }

    getRingCoords(coord: Coord): Coord[] {
        const [relativeRow, relativeCol] = this.getCoordinateInPatch(coord);

        const mirrorCol = this.patchCols - 1 - relativeCol;
        const mirrorRow = this.patchRows - 1 - relativeRow;

        const relativeMirrors = [
            [relativeRow, mirrorCol],
            [mirrorRow, relativeCol],
            [mirrorRow, mirrorCol]
        ];
        const mirrors = relativeMirrors.map(relMirror => this.getFromRelative(coord, relMirror));

        return mirrors;
    }

    // TODO: improve the formula here with better, more scalable math
    // Need util to get mirror col (4->1, 1->4) and mirror row (0->2,1->3,2->0,3->2)
    getInnerPatchRingCoords(coord: Coord): Coord[] {
        const [row, col] = coord;

        const [_relativeRow, relativeCol] = this.getCoordinateInPatch(coord);

        if (relativeCol !== 1 && relativeCol !== 4) return [];

        const rowDistance = 1;
        const colDistance = this.centerCols.size + 1;

        const mirrorRow = isEven(row) ? row - rowDistance : row + rowDistance;
        const mirrowCol = isEven(col) ? col + colDistance : col - colDistance;

        return [
            [row, mirrowCol],
            [mirrorRow, col],
            [mirrorRow, mirrowCol]
        ];
    }

    getAdjacentPatchCenters(coord: Coord) {
        const [centerRow, centerCol] = this.getPatchCenter(coord);
        const up = [centerRow - this.patchRows, centerCol];
        const right = [centerRow, centerCol + this.patchCols];
        const down = [centerRow + this.patchRows, centerCol];
        const left = [centerRow, centerCol - this.patchCols];

        return [up, right, down, left];
    }

    getDiagonalPatchCenters(coord: Coord) {
        const [centerRow, centerCol] = this.getPatchCenter(coord);
        const nw = [centerRow - this.patchRows, centerCol - this.patchCols];
        const ne = [centerRow - this.patchRows, centerCol + this.patchCols];
        const se = [centerRow + this.patchRows, centerCol + this.patchCols];
        const sw = [centerRow + this.patchRows, centerCol - this.patchCols];

        return [nw, ne, se, sw];
    }

    getRelativeInAdjacentPatches(coord: Coord): Coord[] {
        const adjacentPatchCenters = this.getAdjacentPatchCenters(coord);
        const [relativeRow, relativeCol] = this.getCoordinateInPatch(coord);
        const adjacents = adjacentPatchCenters.map(center => this.getFromRelative(center, [relativeRow, relativeCol]));

        return adjacents;
    }

    isCenter(coord: Coord): boolean {
        const [_relativeRow, relativeCol] = this.getCoordinateInPatch(coord);

        return this.centerCols.has(relativeCol);
    }

    // Utilities
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

    // Rules
    // TODO: make a isDifferent(coords)(quilt, coord, value) helper

    isDifferentFromCenter(quilt: Quilt, coord: Coord, value: number) {
        const [ci, cj] = this.getPatchCenter(coord);

        return value !== quilt[ci][cj];
    }

    // TODO: less important rule, add some rule ranking system?
    isDifferentFromDiagonal(quilt: Quilt, coord: Coord, value: number): boolean {
        const diagonals = this.getDiagonalCoords(coord);

        return this.doNotMatch(quilt, value, diagonals);
    }

    isDifferentFromDiagonalCenter(quilt: Quilt, coord: Coord, value: number): boolean {
        const diagCenters = this.getDiagonalPatchCenters(coord);

        return this.doNotMatch(quilt, value, diagCenters);
    }

    isDifferentFromRings(quilt: Quilt, coord: Coord, value: number): boolean {
        const rings = this.getRingCoords(coord);

        return this.doNotMatch(quilt, value, rings);
    }

    isDifferentFromInnerPatchRings(quilt: Quilt, coord: Coord, value: number): boolean {
        const innerRing = this.getInnerPatchRingCoords(coord);

        return this.doNotMatch(quilt, value, innerRing);
    }

    isDifferentFromAdjacent(quilt: Quilt, coord: Coord, value: number): boolean {
        const adjacents = this.getAdjacentCoords(coord);

        return this.doNotMatch(quilt, value, adjacents);
    }

    isDifferentFromRelativePositionInAdjacentPatches(quilt: Quilt, coord: Coord, value: number): boolean {
        const relativeAdjacents = this.getRelativeInAdjacentPatches(coord);

        return this.doNotMatch(quilt, value, relativeAdjacents);
    }

    // TODO: better name
    isDifferentFromOuter(quilt: Quilt, coord: Coord, value: number): boolean {
        const outer = this.getNonCenterCoords(coord);

        return this.doNotMatch(quilt, value, outer);
    }

    // Main methods
    getValidFabric(quilt: Quilt, coord: Coord): number[] {
        if (this.isCenter(coord)) {
            const [ci, cj] = this.getPatchCenter(coord);

            const centerFabric = quilt[ci][cj];

            return centerFabric === EMPTY ? this.fabricRange : [centerFabric];
        }
        // TODO: non center pieces, improve this

        return this.fabricRange;
    }

    canAdd(quilt: Quilt, coord: Coord, value: number) {
        const strictRules = [this.isDifferentFromInnerPatchRings, this.isDifferentFromDiagonal];
        const baseRules = [this.isDifferentFromRelativePositionInAdjacentPatches];

        if (!this.isCenter(coord)) {
            const nonCenterRules = [
                ...baseRules,
                this.isDifferentFromAdjacent,
                this.isDifferentFromCenter,
                this.isDifferentFromRings,
                ...strictRules
            ];

            return nonCenterRules.every(rule => rule.call(this, quilt, coord, value));
        }

        const centerRules = [...baseRules, this.isDifferentFromOuter, this.isDifferentFromDiagonalCenter];

        return centerRules.every(rule => rule.call(this, quilt, coord, value));
    }

    isValid(): boolean {
        // TODO:

        return true;
    }
}
