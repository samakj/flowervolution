import { Term } from '@flowervolution/core/models/equation/term';

/**
 * A class representing an equation built from terms.
 *
 * @property terms - A map of terms to their associated variable.
 * @property multiVariableTermEquations - A map of the variableId to the equation used to calculate it, for use in
 *                                        multivariable terms.
 * @property offset - The offset for the equation as a whole.
 */
export class Equation {
    terms: {[variable: string]: Term[]};
    multiVariableTermEquations: {[multiVariableId: string]: Equation};
    offset: number;

    /**
     * The constructor for the Equation class.
     *
     * @param terms - A map of terms to their associated variable.
     * @param multiVariableTermEquations - A map of the variableId to the equation used to calculate it, for use in
     *                                     multivariable terms.
     * @param offset - The offset for the equation as a whole.
     */
    constructor (
        terms?: {[variable: string]: Term[]},
        multiVariableTermEquations?: {[multiVariableId: string]: Equation},
        offset?: number,
    ) {
        this.terms = terms || {};
        this.multiVariableTermEquations = multiVariableTermEquations || {};
        this.offset = offset || 0;
    }

    /**
     * Generates a string representation of the equation.
     *
     * @returns String representation of the equation.
     */
    toString (): string {
        let s: string = `${this.offset || ''}`;

        Object.entries(this.terms).forEach(
            ([variable, terms]: [string, Term[]]): void => {
                terms.forEach((term: Term) => {
                    s += `${s.length && term.leadingSign() === '+' ? ' + ' : ''}${term.toString(variable)}`;
                });
            },
        );

        return s;
    }

    /**
     * Adds a single variable term to the equation.
     *
     * @param variable - The variable name.
     * @param term - The Term class that represents the term.
     */
    addTerm (variable: string, term: Term): void {
        if (!this.terms.hasOwnProperty(variable)) {
            this.terms[variable] = [];
        }

        this.terms[variable].push(term);
    }

    /**
     * Adds a multivariable term to the equation.
     *
     * @param multiVariableTermEquation - The Equation class representing the multivariable relationship.
     * @param term - The Term class that represents the term.
     */
    addMultivariableTerm (multiVariableTermEquation: Equation, term: Term): void {
        const multiVariableTermId: string = `(${multiVariableTermEquation.toString()})`;

        if (!this.terms.hasOwnProperty(multiVariableTermId)) {
            this.terms[multiVariableTermId] = [];
        }

        this.terms[multiVariableTermId].push(term);
        this.multiVariableTermEquations[multiVariableTermId] = multiVariableTermEquation;
    }

    /**
     * Resolves the equation based on the variables provided.
     *
     * @param variables - A map of the variables to their values.
     *
     * @returns A number if all the required variables are present, a new equation with the given variables resolved.
     */
    resolve (variables: {[variable: string]: number}): Equation | number {
        let result: number = this.offset;
        const termsSet: Set<string> = new Set(Object.keys(this.terms));
        const remainingTerms: {[variable: string]: Term[]} = {};
        const remainingMultiVariableTermEquations: {[multiVariableId: string]: Equation} = {};

        Object.entries(variables).forEach(
            ([variable, value]: [string, number]): void => {
                if (termsSet.has(variable)) {
                    result += this.terms[variable].reduce(
                        (acc: number, term: Term): number => acc + term.resolve(value),
                        0,
                    );
                    termsSet.delete(variable);
                }
            },
        );

        Object.entries(this.multiVariableTermEquations).forEach(
            ([multiVariableTermId, multiVariableTermEquation]: [string, Equation]): void => {
                const termVariable: Equation | number = multiVariableTermEquation.resolve(variables);

                if (termVariable instanceof Equation) {
                    const newMultiVariableTermId: string = `(${termVariable.toString()})`;
                    remainingMultiVariableTermEquations[newMultiVariableTermId] = termVariable;
                    remainingTerms[newMultiVariableTermId] = this.terms[multiVariableTermId];
                    termsSet.delete(multiVariableTermId);
                } else if (termsSet.has(multiVariableTermId)) {
                    result += this.terms[multiVariableTermId].reduce(
                        (acc: number, term: Term): number => acc + term.resolve(termVariable),
                        0,
                    );
                    termsSet.delete(multiVariableTermId);
                }
            },
        );

        if (termsSet.size || Object.keys(remainingMultiVariableTermEquations).length) {
            termsSet.forEach(
                (variable: string) => remainingTerms[variable] = this.terms[variable],
            );

            return new Equation(
                remainingTerms,
                remainingMultiVariableTermEquations,
                result,
            );
        }

        return result;
    }
}
