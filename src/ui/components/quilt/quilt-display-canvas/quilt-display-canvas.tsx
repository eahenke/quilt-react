import { useEffect, useRef } from 'react';
import { QuiltDisplayProps } from '../types';
import { CanvasDrawer } from '../../canvas/canvas-drawer';
import { createPatternDrawer } from './draw';
import { useViewOptions } from '../../../state/view-options';
import { BACKGROUND } from '../../../../engine';

const QUILT_CANVAS_ID = 'quilt-display-canvas';
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 600;

export const QuiltDisplayCanvas = ({ rows, cols, pattern, quilt }: QuiltDisplayProps) => {
    const colorMap = useViewOptions(state => state.colors);
    const view = useViewOptions(state => state.view);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        if (!canvasRef.current || !quilt) {
            return;
        }

        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) {
            return;
        }

        const drawer = new CanvasDrawer({
            width: CANVAS_WIDTH,
            height: CANVAS_HEIGHT,
            rows,
            cols,
            ctx,
        });

        const patternDrawer = createPatternDrawer(pattern, drawer, colorMap);

        patternDrawer.draw(rows, cols, quilt, {
            showColors: view.colors,
            showLabels: view.numbers,
        });

        return () => {
            drawer.clear();
        };
    }, [quilt, view.colors, view.numbers, colorMap]);

    return (
        <canvas
            id={QUILT_CANVAS_ID}
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            style={{ backgroundColor: colorMap[BACKGROUND] || '#fff' }}
        />
    );
};
