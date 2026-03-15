import { BACKGROUND, EMPTY } from '../engine';

export type ValueOf<T> = T[keyof T];

export type Colors = Record<string, string> & {
    [BACKGROUND]: string;
    [EMPTY]: string;
};
