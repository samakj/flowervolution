export const createPathElement = (
    commands: string[],
    attrs?: { [attribute: string]: string },
): SVGPolygonElement => {
    // @ts-ignore: Typescript doesn't detect nodename variable.
    const element: SVGPolygonElement = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'rect',
    );

    element.setAttribute('d', commands.join(' '));
    Object.entries(attrs || {}).forEach(
        ([attr, value]: [string, string]) => element.setAttribute(attr, value),
    );

    return element;
};
