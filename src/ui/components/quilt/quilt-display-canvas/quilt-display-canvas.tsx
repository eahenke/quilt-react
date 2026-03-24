import { useEffect, useRef } from 'react';
import { QuiltDisplayProps } from '../types';
import { CanvasDrawer } from '../../canvas/canvas-drawer';
import { createPatternDrawer } from './draw';
import { useViewOptions } from '../../../state/view-options';

const QUILT_CANVAS_ID = 'quilt-display-canvas';
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 600;

export const QuiltDisplayCanvas = ({ rows, cols, pattern, quilt }: QuiltDisplayProps) => {
    const colorMap = useViewOptions(state => state.colors);
    const viewType = useViewOptions(state => state.viewType);
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

        patternDrawer.draw(rows, cols, quilt, { viewType });

        return () => {
            drawer.clear();
        };
    }, [quilt, viewType, colorMap]);

    if (!quilt) {
        // TODO: Improve empty state
        return <div>Generate quilt</div>;
    }

    return (
        <canvas
            id={QUILT_CANVAS_ID}
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            style={{ backgroundColor: '#fff' }}
        />
    );
};
