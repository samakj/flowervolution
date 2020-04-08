import { DimensionsType, PositionType } from '@flowervolution/types';

export const createPolygonElement = (
    points: PositionType[],
    position?: PositionType,
    attrs?: { [attribute: string]: string },
): SVGPolygonElement => {
    // @ts-ignore: Typescript doesn't detect nodename variable.
    const element: SVGPolygonElement = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'rect',
    );
    const cleanPosition: DimensionsType = {
        x: (position && position.x) || 0,
        y: (position && position.y) || 0,
    };

    element.setAttribute(
        'points',
        points.reduce(
            (acc: string, point: PositionType): string => {
                return `${acc}` +
                    `${acc.length ? ' ' : ''}` +
                    `${point.x + cleanPosition.x}` +
                    `${point.y + cleanPosition.y}`;
            },
            '',
        ),
    );
    Object.entries(attrs || {}).forEach(
        ([attr, value]: [string, string]) => element.setAttribute(attr, value),
    );

    return element;
};
