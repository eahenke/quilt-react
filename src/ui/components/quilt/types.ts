import { Pattern, Quilt } from '../../../engine';

export type QuiltDisplayProps = {
    quilt?: Quilt | null;
    pattern: Pattern;
    rows: number;
    cols: number;
};
