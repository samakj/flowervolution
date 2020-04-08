/**
 * Class to generate repeatable random numbers from an initial seed.
 *
 * @property initialSeed - The number initially used to seed the generator.
 * @property currentSeed - The current seed value.
 * @property modulus - The modulus LCG random number generation.
 * @property multiplier - The multiplier LCG random number generation.
 * @property increment - The increment LCG random number generation.
 */
export class SeededRandomNumberGenerator {
    initialSeed: number;
    currentSeed: number;

    modulus: number;
    multiplier: number;
    increment: number;

    /**
     * This constructor for the SeededRandomNumberGenerator class.
     *
     * @param seed - The initial seed for the LCG random number generation. Will be generated if null.
     * @param modulus - The modulus LCG random number generation. Default = 2 ^ 32.
     * @param multiplier - The multiplier LCG random number generation. Default = 1664525.
     * @param increment - The increment LCG random number generation. Default = 1013904223.
     */
    constructor(seed?: number, modulus?: number, multiplier?: number, increment?: number) {
        this.modulus = modulus || 2 ** 32;
        this.multiplier = multiplier || 1664525;
        this.increment = increment || 1013904223;

        this.initialSeed =
            SeededRandomNumberGenerator.cleanSeed(seed, this.modulus) ||
            SeededRandomNumberGenerator.generateSeed(this.modulus);
        this.incrementSeed();
    }

    /**
     * Ensures seed is a positive integer between 0 and the modulus.
     *
     * @param seed - The seed to be cleaned.
     * @param modulus - The modulus for limiting.
     *
     * @returns Null if seed or modulus in falsey, cleaned seed otherwise.
     */
    static cleanSeed(seed?: number, modulus?: number): number {
        if ((!seed && seed !== 0) || !modulus) {
            return null;
        }

        return Math.abs(Math.floor(seed) % modulus);
    }

    /**
     * Generates an initial seed using Math.random
     *
     * @param modulus - The modulus for limiting
     *
     * @returns A seed to be used in the SeededRandomNumberGenerator
     */
    static generateSeed(modulus: number): number {
        return SeededRandomNumberGenerator.cleanSeed(Math.random() * modulus, modulus);
    }

    /**
     * Increments the seed using LCG random number generation.
     *
     * @returns The new seed value.
     */
    incrementSeed(): number {
        this.currentSeed =
            (this.multiplier * (this.currentSeed || this.initialSeed) + this.increment) %
            this.modulus;
        return this.currentSeed;
    }

    /**
     * Generates a random float greater than or equal to 0 and less than 1 using a newly generated seed.
     *
     * @returns A random float between 0 and 1.
     */
    randomFloat(): number {
        return this.incrementSeed() / this.modulus;
    }

    /**
     * Generates a random integer, either 0 or 1, using a newly generated seed.
     *
     * @returns Either 0 or 1.
     */
    randomInteger(): number {
        return this.randomIntegerBetween(0, 2);
    }

    /**
     * Generates a random float greater than or equal to lower bound and less than upper bound using a
     * newly generated seed.
     *
     * @returns A random float between 0 and 1.
     */
    randomFloatBetween(lowerBound: number, upperBound: number): number {
        return upperBound - lowerBound
            ? lowerBound + (upperBound - lowerBound) * this.randomFloat()
            : lowerBound;
    }

    /**
     * Generates a random integer greater than or equal to lower bound and less than upper bound using a
     * newly generated seed.
     *
     * @param lowerBound - The lower bound of the random integer to be generated.
     * @param upperBound - The upper bound of the random integer to be generated.
     *
     * @returns A random integer between the lower and upper bound
     */
    randomIntegerBetween(lowerBound: number, upperBound: number): number {
        return upperBound - lowerBound
            ? lowerBound + Math.floor((upperBound - lowerBound) * this.randomFloat())
            : lowerBound;
    }

    /**
     * Picks a random item from a list using a newly generated seed.
     *
     * @param list - The list to select an item from.
     *
     * @returns null if the list is empty, a random item from the list otherwise.
     */
    randomChoice<T>(list: T[]): T {
        return list.length ? list[this.randomIntegerBetween(0, list.length)] : null;
    }

    /**
     * Shuffles list based on generated seeds.
     *
     * @param list - The list to shuffle.
     *
     * @returns The shuffled list.
     */
    randomShuffle<T>(list: T[]): T[] {
        const remainingList: T[] = [...list];
        const shuffledList: T[] = [];

        while (remainingList.length) {
            shuffledList.push(
                remainingList.splice(this.randomIntegerBetween(0, remainingList.length), 1)[0],
            );
        }

        return shuffledList;
    }
}
