import { Quilt } from '../../../../../engine';
import { CanvasDrawer } from '../../../canvas/canvas-drawer';

export type DrawOptions = {
    viewType: 'COLOR' | 'NUMBER';
};

export abstract class PatternDrawer {
    canvas: CanvasDrawer;
    colorMap: Record<string, string>;

    protected constructor(canvas: CanvasDrawer, colorMap: Record<string, string>) {
        this.canvas = canvas;
        this.colorMap = colorMap;
    }
    abstract draw(row: number, col: number, quilt: Quilt, options?: DrawOptions): void;
}
