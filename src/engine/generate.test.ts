import { generate, solve } from './generate';
import { QUILT_PARTIAL } from './mocks/quilt-partial';

describe('generate', () => {
    it('should generate quilt', () => {
        const quilt = generate({ patternName: 'harken', fabrics: 10, rows: 6, cols: 5 });
        expect(Array.isArray(quilt)).toEqual(true);
    });
});

describe('solve', () => {
    it('should solve a partially filled quilt', async () => {
        const solvedQuilt = await solve({ quilt: QUILT_PARTIAL, patternName: 'harken', fabrics: 10 });

        expect(solvedQuilt.quilt).toBeDefined();
    });
});
