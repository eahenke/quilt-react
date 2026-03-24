import { useState } from 'react';
import {
    CouldNotGenerateQuiltError,
    Pattern,
    Quilt,
    QuiltTimeoutError,
    generate,
} from '../../engine';

const ERRORS = {
    COULD_NOT_GEN: 'Could not generate quilt. You may need more fabrics.',
    QUILT_TIMEOUT: 'Timeout. Please try again',
} as const;

export type GenerateQuiltOptions = {
    patternName: Pattern;
    fabrics: number;
    rows: number;
    cols: number;
};

// TODO: control quilt value inside hook?
export function useGenerateQuilt() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const generateQuilt = (options: GenerateQuiltOptions): Promise<Quilt | null> => {
        setError('');
        setLoading(true);
        const { patternName, rows, cols, fabrics } = options;

        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    const newQuilt = generate({
                        patternName,
                        rows,
                        cols,
                        fabrics,
                    });
                    setLoading(false);

                    return resolve(newQuilt.quilt);
                } catch (e) {
                    setLoading(false);
                    if (!(e instanceof Error)) return reject(e);

                    if (e instanceof CouldNotGenerateQuiltError) {
                        setError(ERRORS.COULD_NOT_GEN);
                    } else if (e instanceof QuiltTimeoutError) {
                        setError(ERRORS.QUILT_TIMEOUT);
                    } else {
                        setError(`Unknown error: ${e.message}`);
                    }

                    return resolve(null);
                }
            }, 500);
        });
    };

    return {
        loading,
        error,
        generateQuilt,
    };
}
