import { useMemo } from 'react';
import { PATTERNS, Pattern, Quilt } from '../../../engine';

const backgroundColors: Record<number, string> = {
    0: 'DarkGray'
};

const getColorStyle = (value: number) => ({
    backgroundColor: backgroundColors[value]
});

export type QuiltDisplayProps = {
    quilt: Quilt;
    expanded?: boolean;
    pattern: Pattern;
};

export type PatchProps = {
    value: number;
};

export const Patch = ({ value }: PatchProps) => (
    <div className="patch" style={getColorStyle(value)}>
        {value === 0 ? '' : value}
    </div>
);

export const QuiltDisplay = ({ quilt, expanded = true, pattern }: QuiltDisplayProps) => {
    const displayQuilt = useMemo(() => {
        const patternClass = PATTERNS[pattern];

        return expanded ? patternClass.toDisplay(quilt) : quilt;
    }, [quilt, expanded, pattern]);

    return (
        <div className="quilt">
            {displayQuilt.map((row, rIdx) => (
                <div className="quilt-row" key={rIdx}>
                    {row.map((val, cIdx) => (
                        <Patch key={`${rIdx},${cIdx}`} value={val} />
                    ))}
                </div>
            ))}
        </div>
    );
};
