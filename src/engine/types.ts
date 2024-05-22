import { PATTERNS } from './constants';

export type Quilt = number[][];

export type Coord = number[];

export type Pattern = keyof typeof PATTERNS;

export type Inputs = {
    patternName: Pattern;
    fabrics: number;
    rows: number;
    cols: number;
};

export type SolveInputs = {
    quilt: Quilt;
    patternName: Pattern;
    fabrics: number;
};
