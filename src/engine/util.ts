import { Quilt } from './types';
import { EMPTY } from './constants';

// utils
export function mod(a: number, n: number): number {
    return a - n * Math.floor(a / n);
}

export const range = (start: number, stop: number, step = 1): number[] =>
    Array.from({ length: (stop - start) / step + 1 }, (_value, index) => start + index * step);

export const randomItem = (items: number[]) => items[Math.floor(Math.random() * items.length)];

export const shuffle = (items: number[]) => {
    const newItems = [...items];
    for (let i = newItems.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = items[i];
        items[i] = items[j];
        items[j] = temp;
    }

    return newItems;
};

export function generateEmptyQuilt(rows: number, cols: number, fill = EMPTY) {
    const quilt: Quilt = [];
    for (let i = 0; i < rows; i++) {
        quilt[i] = [];
        for (let j = 0; j < cols; j++) {
            quilt[i][j] = fill;
        }
    }

    return quilt;
}
