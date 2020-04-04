import { SVGHandler } from '@flowervolution/svg-handler';
import { WheelEventHandlerType } from '@flowervolution/svg-handler/event-handlers/types';

export const addWheelEventHandlers = (svgHandler: SVGHandler): void => {
    svgHandler.element.parentElement.addEventListener('wheel', wheelHandler(svgHandler));
};

const wheelHandler = (svgHandler: SVGHandler): WheelEventHandlerType => (event: WheelEvent): void => {
    svgHandler.scaleBy(event.deltaY / 100, svgHandler.mousePosition);
};
