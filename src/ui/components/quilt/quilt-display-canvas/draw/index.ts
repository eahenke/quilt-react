import { Pattern } from '../../../../../engine';
import { CanvasDrawer } from '../../../canvas/canvas-drawer';
import { SameSkyDrawer } from './same-sky';
import { PatternDrawer } from './types';

export const createPatternDrawer = (
    pattern: Pattern,
    canvasDrawer: CanvasDrawer,
    colorMap: Record<string, string>
): PatternDrawer => {
    switch (pattern) {
        case 'sameSky': {
            return new SameSkyDrawer(canvasDrawer, colorMap);
        }
        default: {
            throw new Error(`Pattern '${pattern}' drawer not implemented`);
        }
    }
};
