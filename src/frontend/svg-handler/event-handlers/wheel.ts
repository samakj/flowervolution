import { SVGHandler } from '@flowervolution/frontend/svg-handler';
import { WheelEventHandlerType } from '@flowervolution/frontend/svg-handler/event-handlers/types';

export const addWheelEventHandlers = (svgHandler: SVGHandler): void => {
    svgHandler.element.parentElement.addEventListener('wheel', wheelHandler(svgHandler));
};

const wheelHandler = (svgHandler: SVGHandler): WheelEventHandlerType => (event: WheelEvent): void => {
    svgHandler.scaleTo(svgHandler.scale + event.deltaY / 100, svgHandler.mousePosition);
};
