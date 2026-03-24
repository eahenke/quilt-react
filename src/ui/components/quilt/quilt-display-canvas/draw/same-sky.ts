import { Quilt } from '../../../../../engine';
import { SameSkyPattern } from '../../../../../engine/patterns/same-sky';
import { flipDiagonal, flipHorizontal, invert, shiftY } from '../../../../../engine/utils/matrix';
import { CanvasDrawer } from '../../../canvas/canvas-drawer';
import { DrawOptions, PatternDrawer } from './types';

export class SameSkyDrawer implements PatternDrawer {
    canvas: CanvasDrawer;
    patchUnits: number;
    colorMap: Record<string, string>;

    constructor(canvas: CanvasDrawer, colorMap: Record<string, string>) {
        // For purposes of drawing, each patch is a 5x5 grid
        this.patchUnits = 5;
        this.canvas = canvas;
        this.colorMap = colorMap;
    }

    private drawPatch = (row: number, col: number, quilt: Quilt, options: DrawOptions) => {
        const even = (row + col) % 2 === 0;

        const baseNorthCoords = [
            [1, 0],
            [3, 0],
            [4, 1],
            [2, 1],
        ];
        const baseArrowUpCoords = [
            [1, 1],
            [2, 1],
            [3, 2],
            [2, 2],
            [2, 3],
            [1, 2],
        ];

        const northCoords = even
            ? baseNorthCoords
            : flipHorizontal(baseNorthCoords, this.patchUnits);
        const southCoords = shiftY(northCoords, this.patchUnits - 1);
        const westCoords = invert(northCoords);
        const eastCoords = invert(southCoords);
        const arrowUpCoords = even
            ? baseArrowUpCoords
            : flipHorizontal(baseArrowUpCoords, this.patchUnits);
        const arrowDownCoords = flipDiagonal(arrowUpCoords, this.patchUnits);

        const polys = [
            northCoords,
            eastCoords,
            southCoords,
            westCoords,
            arrowUpCoords,
            arrowDownCoords,
        ];

        polys.forEach((poly, idx) => {
            const val = quilt[row][SameSkyPattern.patchCols * col + idx];

            const fill = options.viewType === 'COLOR' ? this.colorMap[val] : '#000';
            const absoluteCoords = this.canvas.toAbsolutePosition(poly, row, col, this.patchUnits);

            this.canvas.drawPolygon(absoluteCoords, fill);
            // TODO: consider adding to drawPolygon w/ an option for less passes

            if (options.viewType === 'NUMBER') {
                this.canvas.labelPolygon(absoluteCoords, val.toString());
            }
        });
    };

    public draw = (rows: number, cols: number, quilt: Quilt, options: DrawOptions) => {
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                this.drawPatch(i, j, quilt, options);
            }
        }
    };
}
