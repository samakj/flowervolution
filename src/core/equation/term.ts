const defaultFunction = (value: number): number => value;

/**
 * A class representing the terms of an equation.
 *
 * e.g: A * C(D * x ^ E + F) ^ B
 *
 * @property funcExponent - (A) The exponent to be applied outside the function.
 * @property funcMultiplier - (B) The multiplier to be applied outside the function.
 * @property func - (C) The function to be applied to the internal terms.
 * @property exponent - (D) The exponent to be applied inside the function.
 * @property multiplier - (E) The multiplier to be applied inside the function.
 * @property offset - (F) The offset to be added inside the function.
 */
export class Term {
    funcExponent: Term | number;
    funcMultiplier: Term | number;
    func: CallableFunction;
    exponent: Term | number;
    multiplier: Term | number;
    offset: Term | number;

    /**
     * The constructor for the term class.
     *
     * e.g: A * C(D * x ^ E + F) ^ B
     *
     * @param funcExponent - (A) The exponent to be applied outside the function.
     * @param funcMultiplier - (B) The multiplier to be applied outside the function.
     * @param func - (C) The function to be applied to the internal terms.
     * @param exponent - (D) The exponent to be applied inside the function.
     * @param multiplier - (E) The multiplier to be applied inside the function.
     * @param offset - (F) The offset to be added inside the function.
     */
    constructor (
        funcExponent?: number,
        funcMultiplier?: number,
        func?: CallableFunction,
        exponent?: number,
        multiplier?: number,
        offset?: number,
    ) {
        this.funcExponent = funcExponent || 1;
        this.funcMultiplier = funcMultiplier || 1;
        this.func = func || defaultFunction;
        this.exponent = exponent || 1;
        this.multiplier = multiplier || 1;
        this.offset = offset || 0;
    }

    /**
     * Generates a string representation of the term.
     *
     * @param variable - The variable name to be used. Default = 'x'.
     *
     * @returns String representation of the term.
     */
    toString (variable: string = 'x'): string {
        let s: string = `${Term.multiplierToString(this.funcMultiplier)}` +
            `${this.func.name !== 'defaultFunction' ? this.func.name : ''}` +
            `${
                this.func.name !== 'defaultFunction' ||
                this.funcExponent !== 1 ||
                this.funcMultiplier !== 1 ?
                    `(` :
                    ''
            }` +
            `${Term.multiplierToString(this.multiplier)}` +
            `${variable}` +
            `${Term.exponentToString(this.exponent)}` +
            `${Term.offsetToString(this.offset)}` +
            `${
                this.func.name !== 'defaultFunction' ||
                this.funcExponent !== 1 ||
                this.funcMultiplier !== 1 ?
                    `)` :
                    ''
            }` +
            `${Term.exponentToString(this.funcExponent)}`;

        if (s[0] === '-') {
            s = s.replace('-', ' - ');
        }

        return s;
    }

    /**
     * Generates a string representation of an exponent.
     *
     * @param n - The exponent term or number.
     * @param variable - The variable name to be used. Default =  'x'.
     *
     * @returns The string representation of the exponent.
     */
    static exponentToString (n: Term | number, variable: string = 'x'): string {
        if (n instanceof Term) return `^(${n.toString(variable)})`;
        if (n === 1) return '';
        return `^${n.toString()}`;
    }

    /**
     * Generates a string representation of a multiplier.
     *
     * @param n - The multiplier term or number.
     * @param variable - The variable name to be used. Default =  'x'.
     *
     * @returns The string representation of the multiplier.
     */
    static multiplierToString (n: Term | number, variable: string = 'x'): string {
        if (n instanceof Term) return `${n.toString(variable)} * `;
        if (n === -1) return '-';
        if (n === 1) return '';
        return n.toString();
    }

    /**
     * Generates a string representation of an offset.
     *
     * @param n - The offset term or number.
     * @param variable - The variable name to be used. Default =  'x'.
     *
     * @returns The string representation of the offset.
     */
    static offsetToString (n: Term | number, variable: string = 'x'): string {
        if (n instanceof Term) {
            return `${n.leadingSign() === '+' ? ' + ' : '-'}${n.toString(variable)}`;
        }
        if (n === 0) return '';
        if (n < 0) return ` - ${Math.abs(n)}`;
        return ` + ${n}`;
    }

    /**
     * Gets the leading multiplier.
     *
     * @returns The leading multiplier.
     */
    leadingMultiplier (): number {
        return this.func.name !== 'defaultFunction' ||
        this.funcExponent !== 1 ||
        this.funcMultiplier !== 1 ?
            (this.funcMultiplier instanceof Term ? this.funcMultiplier.leadingMultiplier() : this.funcMultiplier) :
            (this.multiplier instanceof Term ? this.multiplier.leadingMultiplier() : this.multiplier);
    }

    /**
     * Gets the leading sign.
     *
     * @returns The leading sign.
     */
    leadingSign (): string {
        return this.leadingMultiplier() < 0 ? '-' : '+';
    }

    /**
     * Resolves a subterm based on if its a Term or a number.
     *
     * @param subterm - The subterm to resolve.
     * @param x - The value to use to resolve the subterm.
     *
     * @returns The resolved value of the subterm.
     */
    static resolveSubTerm (subterm: Term | number, x: number): number {
        return subterm instanceof Term ? subterm.resolve(x) : subterm;
    }

    /**
     * Resolves the term.
     *
     * @param x - The value to use to resolve the term.
     *
     * @returns The resolved value of the term.
     */
    resolve (x: number): number {
        return Term.resolveSubTerm(this.funcMultiplier, x) *
            this.func(
                Term.resolveSubTerm(this.multiplier, x) *
                x **
                Term.resolveSubTerm(this.exponent, x) +
                Term.resolveSubTerm(this.offset, x) ,
            ) **
            Term.resolveSubTerm(this.funcExponent, x) ;
    }
}
