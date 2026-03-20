import { Quilt } from '../../../../../engine';
import { CanvasDrawer } from '../../../canvas/canvas-drawer';

export abstract class PatternDrawer {
    protected constructor(canvas: CanvasDrawer, colorMap: Record<string, string>) {}
    abstract draw(row: number, col: number, quilt: Quilt): void;
}
