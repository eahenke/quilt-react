export class QuiltTimeoutError extends Error {
    constructor() {
        super();
        this.name = 'QuiltTimeoutError';
    }
}

export class CouldNotGenerateQuiltError extends Error {
    constructor() {
        super();
        this.name = 'CouldNotGenerateQuiltError';
    }
}
