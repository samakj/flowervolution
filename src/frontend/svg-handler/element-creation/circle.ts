import { PositionType } from '@flowervolution/types';

export const createCircleElement = (
    center: PositionType,
    radius: number,
    attrs?: { [attribute: string]: string },
): SVGCircleElement => {
    // @ts-ignore: Typescript doesn't detect nodename variable.
    const element: SVGCircleElement = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'circle',
    );

    element.setAttribute('cx', center.x.toString());
    element.setAttribute('cy', center.y.toString());
    element.setAttribute('r', radius.toString());
    Object.entries(attrs || {}).forEach(
        ([attr, value]: [string, string]) => element.setAttribute(attr, value),
    );

    return element;
};
