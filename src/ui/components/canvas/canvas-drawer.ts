import { Coord } from '../../../engine';

export type CanvasDrawerOptions = {
    width: number;
    height: number;
    cols: number;
    rows: number;
    ctx: CanvasRenderingContext2D;
};

export class CanvasDrawer {
    width: number;
    height: number;
    rows: number;
    cols: number;
    ctx: CanvasRenderingContext2D;

    constructor({ width, height, rows, cols, ctx }: CanvasDrawerOptions) {
        this.width = width;
        this.height = height;
        this.rows = rows;
        this.cols = cols;
        this.ctx = ctx;
    }

    getPatchSize() {
        const pWidth = this.width / this.cols;
        const pHeight = this.height / this.rows;

        return {
            width: pWidth,
            height: pHeight,
        };
    }

    getPatchStartCoord(row: number, col: number) {
        const { width, height } = this.getPatchSize();

        return [col * width, row * height];
    }

    toAbsolutePosition(
        coords: Coord[],
        row: number,
        col: number,
        patchRowUnits: number,
        patchColUnits: number = patchRowUnits
    ) {
        const { width, height } = this.getPatchSize();
        const [startX, startY] = this.getPatchStartCoord(row, col);
        return coords.map(([x, y]) => {
            const relativeX = x * (width / patchColUnits);
            const relativeY = y * (height / patchRowUnits);

            return [startX + relativeX, startY + relativeY];
        });
    }

    drawPolygon(coords: Coord[], fill: string) {
        const [start, ...rest] = coords;
        this.ctx.beginPath();
        this.ctx.moveTo(start[0], start[1]);
        rest.forEach(coord => {
            this.ctx.lineTo(coord[0], coord[1]);
        });
        this.ctx.closePath();

        this.ctx.fillStyle = fill;
        this.ctx.fill();
    }

    labelPolygon(coords: Coord[], label: string) {
        const summedCoords = coords.reduce(
            ([sumX, sumY], [x, y]) => {
                return [sumX + x, sumY + y];
            },
            [0, 0]
        );

        const [avgX, avgY] = summedCoords.map(v => v / coords.length);
        this.ctx.font = 'Arial';
        this.ctx.fillStyle = ' #000';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(label, avgX, avgY);
    }

    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }
}
