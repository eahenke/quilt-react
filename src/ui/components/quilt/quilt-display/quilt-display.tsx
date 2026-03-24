import { Pattern } from '../../../../engine';
import { QuiltDisplayCanvas } from '../quilt-display-canvas';
import { QuiltDisplayGrid } from '../quilt-display-grid';
import { QuiltDisplayProps } from '../types';

const PATTERN_TO_COMPONENT: Record<Pattern, React.ComponentType<QuiltDisplayProps>> = {
    harken: QuiltDisplayGrid,
    sameSky: QuiltDisplayCanvas,
};

export const QuiltDisplay = (quiltDisplayProps: QuiltDisplayProps) => {
    const Component = PATTERN_TO_COMPONENT[quiltDisplayProps.pattern];
    if (!Component) {
        return <div>Pattern Display not implemented</div>;
    }

    return <Component {...quiltDisplayProps} />;
};
