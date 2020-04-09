import { PositionType } from '@flowervolution/types';

const iterateFrom = (a: number, b: number, callback: (n: number) => void): void => {
    const dir: number = Math.sign(b - a);
    for (let n: number = a; dir > 0 ? n <= b : n >= b; n += dir) {
        callback(n);
    }
};

const bresenhamIncr = (
    x: number,
    y: number,
    yDir: number,
    grad: number,
    gradError: number,
): { y: number, gradError: number } => {
    let newGradError: number = gradError + Math.abs(grad);
    let newY: number = y;

    if (gradError >= 0.5) {
        newY += yDir;
        newGradError -= 1;
    }

    return { y: newY, gradError: newGradError };
};

export const bresenhamLine = (a: PositionType, b: PositionType): PositionType[] => {
    const points: PositionType[] = [];

    const xDir: number = a.x < b.x ? 1 : -1;
    const yDir: number = a.y < b.y ? 1 : -1;

    if (a.x === b.x && a.y === b.y) {
        points.push({ x: a.x, y: a.y });
    } else if (a.x === b.x) {
        iterateFrom(a.y, b.y, (y: number): void => { points.push({ y, x: a.x }); });
    } else if (a.y === b.y) {
        iterateFrom(a.x, b.x, (x: number): void => { points.push({ x, y: a.y }); });
    } else {
        const grad: number = (b.y - a.y) / (b.x - a.x);
        let gradError: number = 0;

        if (Math.abs(grad) <= 1) {
            let y: number = a.y;
            iterateFrom(
                a.x,
                b.x,
                (x: number): void => {
                    points.push({ x, y });
                    ({ y, gradError } = bresenhamIncr(x, y, yDir, Math.abs(grad), gradError));
                },
            );
        } else if (Math.abs(grad) > 1) {
            let x: number = a.x;
            iterateFrom(
                a.y,
                b.y,
                (y: number): void => {
                    points.push({ x, y });
                    ({ gradError, y: x } = bresenhamIncr(y, x, xDir, Math.abs(1 / grad), gradError));
                },
            );
        } else {
            throw Error('grad = 0 got past initial checks in Bresenham line generation.');
        }
    }

    return points;
};
