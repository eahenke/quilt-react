import { HarkenPattern } from './harken';

describe('Harken pattern', () => {
    describe('getCoordinateInPatch', () => {
        const options = { fabrics: 10 };
        const pattern = new HarkenPattern(options);

        it('should get relative coordinates in patch', () => {
            const input = [
                [0, 0],
                [0, 5],
                [0, 6],
                [0, 29]
            ];
            const expected = [
                [0, 0],
                [0, 5],
                [0, 0],
                [0, 5]
            ];
            const output = input.map(coord => pattern.getCoordinateInPatch(coord));
            expect(output).toEqual(expected);
        });
    });

    describe('getPatchCenter', () => {
        const options = { fabrics: 10 };
        const pattern = new HarkenPattern(options);

        it('should get the coordinates of (0,2) cell of the relative patch', () => {
            const input = [
                [0, 0],
                [0, 5],
                [1, 3],
                [3, 29]
            ];
            const expected = [
                [0, 2],
                [0, 2],
                [0, 2],
                [2, 26]
            ];
            const output = input.map(coord => pattern.getPatchCenter(coord));
            expect(output).toEqual(expected);
        });
    });

    describe('getNonCenterCoords', () => {
        const options = { fabrics: 10 };
        const pattern = new HarkenPattern(options);

        it('should get the non center coordinates of the patch containing the given coord', () => {
            const input = [
                [0, 0],
                [2, 8]
            ];
            const expected = [
                [
                    [0, 0],
                    [0, 1],
                    [0, 4],
                    [0, 5],
                    [1, 0],
                    [1, 1],
                    [1, 4],
                    [1, 5]
                ],
                [
                    [2, 6],
                    [2, 7],
                    [2, 10],
                    [2, 11],
                    [3, 6],
                    [3, 7],
                    [3, 10],
                    [3, 11]
                ]
            ];
            const output = input.map(coord => pattern.getNonCenterCoords(coord));
            expect(output).toEqual(expected);
        });
    });

    describe('getRingCoords', () => {
        const options = { fabrics: 10 };
        const pattern = new HarkenPattern(options);

        it('should get the mirror coordinates around the center of a patch', () => {
            const input = [
                [0, 0],
                [0, 1],
                [0, 5],
                [0, 4]
            ];
            const expected = [
                [
                    [0, 5],
                    [1, 0],
                    [1, 5]
                ],
                [
                    [0, 4],
                    [1, 1],
                    [1, 4]
                ],
                [
                    [0, 0],
                    [1, 5],
                    [1, 0]
                ],
                [
                    [0, 1],
                    [1, 4],
                    [1, 1]
                ]
            ];
            const output = input.map(coord => pattern.getRingCoords(coord));
            expect(output).toEqual(expected);
        });
    });

    describe('getRingCoords', () => {
        const options = { fabrics: 10 };
        const pattern = new HarkenPattern(options);

        it('should get the mirror coordinates around the center of a patch', () => {
            const input = [[0, 0]];
            const expected = [
                [
                    [-2, 0],
                    [0, 6],
                    [2, 0],
                    [0, -6]
                ]
            ];
            const output = input.map(coord => pattern.getRelativeInAdjacentPatches(coord));
            expect(output).toEqual(expected);
        });
    });

    describe('getInnerPatchRingCoords', () => {
        const options = { fabrics: 10 };
        const pattern = new HarkenPattern(options);
        it('should get the mirror coordinates across the inner patch', () => {
            const input = [
                [1, 4],
                [2, 7]
            ];
            const expected = [
                [
                    [1, 7],
                    [2, 4],
                    [2, 7]
                ],
                [
                    [2, 4],
                    [1, 7],
                    [1, 4]
                ]
            ];
            const output = input.map(coord => pattern.getInnerPatchRingCoords(coord));
            expect(output).toEqual(expected);
        });

        it('should not get the mirror coordinates for outer or center coords', () => {
            const input = [
                [1, 0],
                [2, 3],
                [2, 5],
                [1, 2]
            ];
            const expected = [[], [], [], []];
            const output = input.map(coord => pattern.getInnerPatchRingCoords(coord));
            expect(output).toEqual(expected);
        });
    });
});
