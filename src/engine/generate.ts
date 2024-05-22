import { EMPTY, PATTERNS } from './constants';
import { CouldNotGenerateQuiltError, QuiltTimeoutError } from './errors';
import { HarkenPattern } from './patterns/harken';
import { Coord, Inputs, Quilt, SolveInputs } from './types';
import { generateEmptyQuilt, shuffle } from './util';

const ABORT_COUNT = 2_000_000;

const getNextEmpty = (quilt: Quilt): Coord | null => {
    for (let i = 0; i < quilt.length; i++) {
        for (let j = 0; j < quilt[0].length; j++) {
            if (quilt[i][j] === EMPTY) return [i, j];
        }
    }

    return null;
};

function fillQuilt(quilt: Quilt, pattern: HarkenPattern) {
    let counter = 0;

    function recur() {
        const nextCell = getNextEmpty(quilt);

        if (!nextCell) return quilt;

        const possibleFabrics = pattern.getValidFabric(quilt, nextCell);
        if (!possibleFabrics) {
            return false;
        }

        const shuffledFabrics = shuffle(possibleFabrics);

        for (const fabric of shuffledFabrics) {
            counter++;

            if (counter >= ABORT_COUNT) throw new QuiltTimeoutError();

            if (pattern.canAdd(quilt, nextCell, fabric)) {
                quilt[nextCell[0]][nextCell[1]] = fabric;

                if (recur()) {
                    return quilt;
                }
                quilt[nextCell[0]][nextCell[1]] = EMPTY;
            }
        }

        return false;
    }

    const filledQuilt = recur();

    return {
        quilt: filledQuilt || null,
        counter
    };
}

export const solve = ({ patternName, fabrics, quilt }: SolveInputs) => {
    // TODO: copy array better
    const clone = JSON.parse(JSON.stringify(quilt));
    const pattern = new PATTERNS[patternName]({ fabrics });

    const filled = fillQuilt(clone, pattern);

    if (!filled.quilt) throw new CouldNotGenerateQuiltError();

    return filled;
};

export function generate({ patternName, fabrics, rows, cols }: Inputs) {
    const counter = 0;
    const pattern = new PATTERNS[patternName]({ fabrics });
    const quilt = generateEmptyQuilt(rows * pattern.patchRows, cols * pattern.patchCols);

    const filled = fillQuilt(quilt, pattern);

    if (!filled.quilt) throw new CouldNotGenerateQuiltError();

    return {
        quilt: filled.quilt,
        count: counter
    };
}
