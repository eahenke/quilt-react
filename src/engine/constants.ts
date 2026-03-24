import { HarkenPattern } from './patterns/harken';
import { SameSkyPattern } from './patterns/same-sky';

export const EMPTY = 0;
export const BACKGROUND = -1;

export const PATTERNS = {
    harken: HarkenPattern,
    sameSky: SameSkyPattern,
} as const;
