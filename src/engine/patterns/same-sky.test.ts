import { SameSkyPattern } from './same-sky';

describe('Same sky pattern', () => {
    describe('getCoordinateInPatch', () => {
        const options = { fabrics: 10 };
        const pattern = new SameSkyPattern(options);

        it('should get relative coordinates in patch', () => {
            const input = [
                [0, 0],
                [0, 5],
                [0, 6],
                [0, 29],
            ];
            const expected = [
                [0, 0],
                [0, 5],
                [0, 0],
                [0, 5],
            ];
            const output = input.map(coord => pattern.getCoordinateInPatch(coord));
            expect(output).toEqual(expected);
        });
    });

    describe('getPatchMemberCoords', () => {
        const options = { fabrics: 10 };
        const pattern = new SameSkyPattern(options);

        it('should get relative coordinates in patch', () => {
            const input = [
                [0, 1],
                [1, 15],
            ];
            const expected = [
                [
                    [0, 0],
                    [0, 1],
                    [0, 2],
                    [0, 3],
                    [0, 4],
                    [0, 5],
                ],
                [
                    [1, 12],
                    [1, 13],
                    [1, 14],
                    [1, 15],
                    [1, 16],
                    [1, 17],
                ],
            ];
            const output = input.map(coord => pattern.getPatchMemberCoords(coord));
            expect(output).toEqual(expected);
        });
    });

    describe('getAdjacentPatchNeighbor', () => {
        const options = { fabrics: 10 };
        const pattern = new SameSkyPattern(options);

        it('should get the coordinates across patches adjacent to a given coordinate', () => {
            const input = [
                // North, 1st patch
                [0, 0],
                // East, 2nd path over
                [0, 7],
                // South, 3rd patch down
                [3, 2],
                // West, 2nd patch over
                [0, 9],
            ];

            const expected = [
                // South, (off quilt)
                [-1, 2],
                // West, 3rd patch over
                [0, 15],
                // North, 4th patch down
                [4, 0],
                // East, 1st patch
                [0, 1],
            ];

            const output = input.map(coord => pattern.getAdjacentPatchNeighbor(coord));

            expect(output).toEqual(expected);
        });
    });

    describe('getRingArrowCoords', () => {
        const options = { fabrics: 10 };
        const pattern = new SameSkyPattern(options);

        it('should get the coordinates for corresponding arrows in adjacent patches', () => {
            const input = [
                // Arrow down, 1st patch (SE)
                [0, 5],
                // Arrow up, 1st row down, 3rd patch over (NW)
                [1, 22],
            ];
            const expected = [
                // 1st test case
                [
                    // SW
                    [0, 11],
                    // NW
                    [1, 10],
                    //NE
                    [1, 4],
                ],
                // 2nd test case
                [
                    // NE
                    [1, 16],
                    // SE
                    [0, 17],
                    //SW
                    [0, 23],
                ],
            ];

            const output = input.map(coord => pattern.getRingArrowCoords(coord));

            expect(output).toEqual(expected);
        });
    });

    describe('getDiagonalArrowCoords', () => {
        const options = { fabrics: 10 };
        const pattern = new SameSkyPattern(options);

        it('should get the coordinates for co-directional arrows in adjacent diagonal patches', () => {
            const input = [
                // Arrow down, 1st patch (SE)
                [0, 5],
                // Arrow up, 1st row down, 3rd patch over (NW)
                [1, 22],
            ];
            const expected = [
                // 1st test case
                [
                    // SE (off quilt)
                    [-1, -1],
                    // SE (one down, one over)
                    [1, 11],
                ],
                // 2nd test case
                [
                    // NW
                    [0, 16],
                    // NW
                    [2, 28],
                ],
            ];

            const output = input.map(coord => pattern.getDiagonalArrowCoords(coord));
            expect(output).toEqual(expected);
        });
    });
});

describe('getSidePositionsAdjacentToArrows', () => {
    const options = { fabrics: 10 };
    const pattern = new SameSkyPattern(options);

    it('should get the coordinates for adjacent side patches', () => {
        const input = [
            // Arrow up, 1st patch (NW) (even)
            [0, 4],
            // Arrow down, 1st patch (SE) (even)
            [0, 5],
            // Arrow up, 1st row down, 2nd patch over (NE) (odd)
            [1, 16],
            // Arrow down, 1st row down, 2nd patch over (SW) (odd)
            [1, 17],
        ];
        const expected = [
            // 1st test case
            [
                // North, west
                [0, 0],
                [0, 3],
            ],
            // 2nd test case
            [
                // South, east
                [0, 2],
                [0, 1],
            ],
            // 3rd test case
            [
                // South, east
                [1, 12],
                [1, 13],
            ],
            // 4th test case
            [
                // South, east
                [1, 14],
                [1, 15],
            ],
        ];

        const output = input.map(coord => pattern.getSidePositionsAdjacentToArrows(coord));
        expect(output).toEqual(expected);
    });
});
