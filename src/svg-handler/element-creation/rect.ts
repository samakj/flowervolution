import { DimensionsType, PositionType } from '@flowervolution/types';

export const createRectElement = (
    position: PositionType,
    dimensions: DimensionsType,
    cornerRadii?: DimensionsType,
    attrs?: { [attribute: string]: string },
): SVGRectElement => {
    // @ts-ignore: Typescript doesn't detect nodename variable.
    const element: SVGRectElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    const cleanCornerRadii: DimensionsType = {
        x: (cornerRadii && cornerRadii.x) || 0,
        y: (cornerRadii && cornerRadii.y) || 0,
    };

    element.setAttribute('x', position.x.toString());
    element.setAttribute('y', position.y.toString());
    element.setAttribute('height', dimensions.x.toString());
    element.setAttribute('width', dimensions.y.toString());
    element.setAttribute('rx', cleanCornerRadii.x.toString());
    element.setAttribute('ry', cleanCornerRadii.y.toString());
    Object.entries(attrs || {}).forEach(([attr, value]) => element.setAttribute(attr, value));

    return element;
};
