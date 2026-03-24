import { Coord } from '../types';

export const shiftX = (coords: Coord[], right: number) => {
    return coords.map(([x, y]) => {
        return [x + right, y];
    });
};

export const shiftY = (coords: Coord[], down: number) => {
    return coords.map(([x, y]) => {
        return [x, y + down];
    });
};

export const flipDiagonal = (coords: Coord[], size: number) => {
    return coords.map(([x, y]) => {
        return [size - x, size - y];
    });
};

export const flipHorizontal = (coords: Coord[], size: number) => {
    return coords.map(([x, y]) => {
        return [size - x, y];
    });
};

export const flipVertical = (coords: Coord[], size: number) => {
    return coords.map(([x, y]) => {
        return [x, size - y];
    });
};

export const invert = (coords: Coord[]) => {
    return coords.map(([x, y]) => [y, x]);
};
