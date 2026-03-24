import { useMemo } from 'react';
import cx from 'classnames';
import { EMPTY, PATTERNS, BACKGROUND } from '../../../../engine';
import { generateEmptyQuilt } from '../../../../engine/util';
import { useViewOptions } from '../../../state/view-options';

import './quilt-display-grid.css';
import { QuiltDisplayProps } from '../types';

const getColorStyle = (color?: string) => (color ? { backgroundColor: color } : {});

export type QuiltDisplayGridProps = QuiltDisplayProps & {
    expanded?: boolean;
};

export type PatchProps = {
    value: number;
    color?: string;
};

export const Patch = ({ value, color }: PatchProps) => {
    const view = useViewOptions(state => state.view);
    const isBackground = value === BACKGROUND;
    const isEmpty = value === EMPTY;
    const isColorView = !!view.colors || isBackground;
    const isNumbersView = !!view.numbers;

    return (
        <div className="patch" style={isColorView ? getColorStyle(color) : {}}>
            <span className={cx({ empty: isBackground })}>
                {isBackground || isEmpty || !isNumbersView ? '' : value}
            </span>
        </div>
    );
};

export const QuiltDisplayGrid = ({
    quilt,
    expanded = true,
    pattern,
    rows,
    cols,
}: QuiltDisplayGridProps) => {
    const colors = useViewOptions(state => state.colors);
    const displayQuilt = useMemo(() => {
        const patternClass = PATTERNS[pattern];
        const baseQuilt =
            quilt ||
            generateEmptyQuilt(rows * patternClass.patchRows, cols * patternClass.patchCols);

        return expanded ? patternClass.toDisplay(baseQuilt) : baseQuilt;
    }, [quilt, expanded, pattern, rows, cols]);

    return (
        <div className="quilt-wrapper">
            <div className="quilt">
                {displayQuilt.map((row, rIdx) => (
                    <div className="quilt-row" key={rIdx}>
                        {row.map((val, cIdx) => (
                            <Patch color={colors[val]} key={`${rIdx},${cIdx}`} value={val} />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};
