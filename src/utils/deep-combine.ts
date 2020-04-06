import { KeyedObject } from '@flowervolution/types';

export const isArray = (value: any): boolean => value && typeof value === 'object' && value.constructor === Array;
export const isObject = (value: any): boolean => value && typeof value === 'object' && value.constructor === Object;

export const deepObjectCombine = <A extends KeyedObject, B extends KeyedObject>(a: A, b: B): A & B => {
    const c: A & B = Object.assign({}, b, a);

    Object.keys(a).forEach((key: string): void => {
        if (a.hasOwnProperty(key) && b.hasOwnProperty(key)) {
            if (isArray(a[key]) && isArray(b[key])) {
                // @ts-ignore: Doesn't like string indexing for some reason (?)
                c[key] = [...b[key], ...a[key]];
            }
            if (isObject(a[key]) && isObject(b[key])) {
                // @ts-ignore: Doesn't like string indexing for some reason (?)
                c[key] = deepObjectCombine(a[key], b[key]);
            }
        }
    });

    return c;
};
