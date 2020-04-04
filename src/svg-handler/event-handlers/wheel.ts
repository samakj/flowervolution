import { SVGHandler } from '@flowervolution/svg-handler';

export const addWheelEventHandlers = (svgHandler: SVGHandler): void => {
    svgHandler.element.parentElement.addEventListener('wheel', wheelHandler(svgHandler));
};

const wheelHandler = (svgHandler: SVGHandler) => (event: WheelEvent): void => {
    svgHandler.scaleBy(event.deltaY / 100, svgHandler.mousePosition);
};
