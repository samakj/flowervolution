import { Equation } from '@flowervolution/core/equation';
import { Term } from '@flowervolution/core/equation/term';
import { SeededRandomNumberGenerator } from '@flowervolution/core/seeded-random-number-generator';
import { PositionType } from '@flowervolution/types';
import { Grid2d } from '@flowervolution/core/grid-2d';

/**
 * Rounds a number to a specified number of decimal places.
 *
 * @param n - The number to round.
 * @param dp - The amount of decimal places to round to.
 *
 * @returns The rounded number.
 */
const roundToDp = (n: number, dp: number): number => Math.round(n * 10 ** dp) / 10 ** dp;

/**
 * Generates a single term for the term summation.
 *
 * @param srng - The seeded random number generator to use.
 * @param noTerms - The total number of terms in the summation.
 * @param baseMultiplier - The base multiplier to use within the sin function.
 * @param baseMultiplierVariance - The amount to randomly vary the base multiplier by to reduce harmony.
 * @param constantDecimalPlaces - The number of decimal places to cap the constants at. Default = 3.
 *
 * @returns The term to use in the summation.
 */
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

/**
 * Generates a terrain equation in 1 dimension.
 *
 * @param srng - The seeded random number generator to use.
 * @param noTerms - The number of terms to use in the summation.
 * @param spread - The length over which the frequencies should be spread.
 * @param variable - The name of the variable. Default = 'x'.
 * @param baseMultiplierVarianceFactor - The amount to randomly vary the base multiplier by to reduce harmony.
 *                                       Default = 0.1.
 * @param constantDecimalPlaces - The number of decimal places to cap the constants at. Default = 3.
 *
 * @returns The terrain equation.
 */
export const generate1dTerrainEquation = (
    srng: SeededRandomNumberGenerator,
    noTerms: number,
    spread: number,
    variable?: string,
    baseMultiplierVarianceFactor?: number,
    constantDecimalPlaces: number = 3,
): Equation => {
    const terrainEquation: Equation = new Equation();
    const stepSize: number = roundToDp(2 * Math.PI / spread, constantDecimalPlaces);

    for (let stepNo: number = 1; stepNo < noTerms + 1; stepNo += 1) {
        terrainEquation.addTerm(
            variable || 'x',
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

/**
 * Generates a terrain equation in 2 dimensions.
 *
 * @param srng - The seeded random number generator to use.
 * @param noTerms - The number of terms to use in the summation.
 * @param spread - The length over which the frequencies should be spread.
 * @param variables - The name of the two variable. Default = ['x', 'y'].
 * @param baseMultiplierVarianceFactor - The amount to randomly vary the base multiplier by to reduce harmony.
 *                                       Default = 0.1.
 * @param constantDecimalPlaces - The number of decimal places to cap the constants at. Default = 3.
 *
 * @returns The terrain equation.
 */
export const generate2dTerrainEquation = (
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
