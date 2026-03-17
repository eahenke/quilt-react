import { Coord, Quilt } from '../types';

// TODO: Make this a real class with common patch operations and extend from
export abstract class BasePattern {
    public abstract canAdd(quilt: Quilt, coord: Coord, fabric: number): boolean;
    public abstract getValidFabric(quilt: Quilt, coord: Coord): number[];
}
