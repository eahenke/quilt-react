import { useMemo } from 'react';
import cx from 'classnames';
import { EMPTY, EXPANDED_SPACE, PATTERNS, Pattern, Quilt } from '../../../engine';
import { generateEmptyQuilt } from '../../../engine/util';
import './quilt.css';

const backgroundColors: Record<number, string> = {
    [EXPANDED_SPACE]: 'DarkGray'
};

const getColorStyle = (value: number) => ({
    backgroundColor: backgroundColors[value]
});

export type QuiltDisplayProps = {
    quilt?: Quilt | null;
    expanded?: boolean;
    pattern: Pattern;
    rows: number;
    cols: number;
};

export type PatchProps = {
    value: number;
};

export const Patch = ({ value }: PatchProps) => {
    const expandedSpace = value === EXPANDED_SPACE;
    const emptySpace = value === EMPTY;

    return (
        <div className="patch" style={getColorStyle(value)}>
            <span className={cx({ empty: expandedSpace })}>{expandedSpace || emptySpace ? '' : value}</span>
        </div>
    );
};

export const QuiltDisplay = ({ quilt, expanded = true, pattern, rows, cols }: QuiltDisplayProps) => {
    const displayQuilt = useMemo(() => {
        const patternClass = PATTERNS[pattern];
        const baseQuilt = quilt || generateEmptyQuilt(rows * patternClass.patchRows, cols * patternClass.patchCols);

        return expanded ? patternClass.toDisplay(baseQuilt) : baseQuilt;
    }, [quilt, expanded, pattern, rows, cols]);

    return (
        <div className="quilt-wrapper">
            <div className="quilt">
                {displayQuilt.map((row, rIdx) => (
                    <div className="quilt-row" key={rIdx}>
                        {row.map((val, cIdx) => (
                            <Patch key={`${rIdx},${cIdx}`} value={val} />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};
