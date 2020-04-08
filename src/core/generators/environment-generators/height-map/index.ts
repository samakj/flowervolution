import { Equation } from '@flowervolution/core/models/equation';
import { Term } from '@flowervolution/core/models/equation/term';
import { SeededRandomNumberGenerator } from '@flowervolution/core/generators/seeded-random-number-generator';
import { roundToDp } from '@flowervolution/utils/round';
import { Grid2d } from '@flowervolution/core/data-structures/grid-2d';
import { PositionType } from '@flowervolution/types';

const generateTerm = (
    srng: SeededRandomNumberGenerator,
    noTerms: number,
    baseMultiplier: number,
    baseMultiplierVariance: number,
    constantDecimalPlaces: number = 3,
): Term => new Term(
    null,
    roundToDp(1 / noTerms, constantDecimalPlaces),
    Math.sin,
    null,
    roundToDp(baseMultiplier + baseMultiplierVariance * srng.randomFloatBetween(-1, 1), constantDecimalPlaces),
    roundToDp(srng.randomFloat() * Math.PI, constantDecimalPlaces),
);

export const generate2dHeightMapEquation = (
    srng: SeededRandomNumberGenerator,
    noTerms: number,
    spread: number,
    variables?: [string, string],
    baseMultiplierVarianceFactor?: number,
    constantDecimalPlaces: number = 3,
): Equation => {
    // @ts-ignore: Doesn't recognise the slice and initial values.
    const ensuredVariables: [string, string] = Array.from(new Set([...(variables || []), 'x', 'y'])).slice(0, 2);
    const terrainEquation: Equation = new Equation();
    const stepSize: number = roundToDp(2 * Math.PI / spread, constantDecimalPlaces);

    for (let stepNo: number = 1; stepNo < noTerms + 1; stepNo += 1) {
        const variableEquation: Equation = new Equation();
        const ratio: number = srng.randomFloat();

        variableEquation.addTerm(
            ensuredVariables[0],
            new Term(
                null,
                null,
                null,
                null,
                roundToDp(ratio * Math.PI / 2, constantDecimalPlaces),
            ),
        );
        variableEquation.addTerm(
            ensuredVariables[1],
            new Term(
                null,
                null,
                null,
                null,
                roundToDp((1 - ratio) * Math.PI / 2, constantDecimalPlaces),
            ),
        );

        terrainEquation.addMultivariableTerm(
            variableEquation,
            generateTerm(
                srng,
                noTerms,
                stepNo * stepSize,
                stepSize * (baseMultiplierVarianceFactor || 0.1),
                constantDecimalPlaces,
            ),
        );
    }

    return terrainEquation;
};

export const applyHeightMapEquationToGrid2d = (
    equation: Equation,
    grid: Grid2d<{[key: string]: any}>,
    initialOffset?: PositionType,
): Grid2d<{[key: string]: any}> => {
    const offset: PositionType = {
        x: initialOffset && initialOffset.x || 0,
        y: initialOffset && initialOffset.y || 0,
    };
    let maxCellHeight: number = null;
    let minCellHeight: number = null;

    // Get value for cell.
    for (const cell of grid.cells) {
        const cellHeight: number | Equation = equation.resolve(
            {
                x: cell.position.x + offset.x,
                y: cell.position.y + offset.y,
            },
        );

        if (typeof cellHeight !== 'number') {
            throw EvalError('Something went wrong in resolving the height equation.');
        }

        if (!maxCellHeight || cellHeight > maxCellHeight) maxCellHeight = cellHeight;
        if (!minCellHeight || cellHeight < minCellHeight) minCellHeight = cellHeight;

        cell.value.height = cellHeight;
    }

    // Normalise cell heights between 0 and 1.
    for (const cell of grid.cells) {
        cell.value.height = (cell.value.height - minCellHeight) / (maxCellHeight - minCellHeight);
    }

    return grid;
};
