import { SVGHandler } from '@flowervolution/frontend/svg-handler';
import { MouseEventHandlerType } from '@flowervolution/frontend/svg-handler/event-handlers/types';

export const addMouseEventHandlers = (svgHandler: SVGHandler): void => {
    svgHandler.element.parentElement.addEventListener('mouseenter', mouseEnterHandler(svgHandler));
    svgHandler.element.parentElement.addEventListener('mouseleave', mouseLeaveHandler(svgHandler));
    svgHandler.element.parentElement.addEventListener('mousedown', mouseDownHandler(svgHandler));
    svgHandler.element.parentElement.addEventListener('mouseup', mouseUpHandler(svgHandler));
    svgHandler.element.parentElement.addEventListener('mousemove', mouseMoveHandler(svgHandler));
};

const mouseEnterHandler = (svgHandler: SVGHandler): MouseEventHandlerType => (event: MouseEvent): void => {
    svgHandler.updateMousePosition(event);
    svgHandler.mouseEventHistory.mouseEnter = event;
    svgHandler.mouseEventHistory.mouseLeave = null;
    svgHandler.mouseEventHistory.mouseDown = null;
    svgHandler.mouseEventHistory.mouseUp = null;
    svgHandler.mouseEventHistory.mouseMove = null;
};

const mouseLeaveHandler = (svgHandler: SVGHandler): MouseEventHandlerType => (event: MouseEvent): void => {
    svgHandler.updateMousePosition(event);
    svgHandler.mouseEventHistory.mouseEnter = null;
    svgHandler.mouseEventHistory.mouseLeave = event;
    svgHandler.mouseEventHistory.mouseDown = null;
    svgHandler.mouseEventHistory.mouseUp = null;
    svgHandler.mouseEventHistory.mouseMove = null;
};

const mouseDownHandler = (svgHandler: SVGHandler): MouseEventHandlerType => (event: MouseEvent): void => {
    svgHandler.updateMousePosition(event);
    svgHandler.mouseEventHistory.mouseDown = event;
    svgHandler.mouseEventHistory.mouseUp = null;
    svgHandler.mouseEventHistory.mouseMove = null;
};

const mouseUpHandler = (svgHandler: SVGHandler): MouseEventHandlerType => (event: MouseEvent): void => {
    svgHandler.updateMousePosition(event);
    svgHandler.mouseEventHistory.mouseDown = null;
    svgHandler.mouseEventHistory.mouseUp = event;
    svgHandler.mouseEventHistory.mouseMove = null;
};

const mouseMoveHandler = (svgHandler: SVGHandler): MouseEventHandlerType => (event: MouseEvent): void => {
    svgHandler.updateMousePosition(event);

    if (svgHandler.mouseEventHistory.mouseDown) {
        const prevMouseEvent: MouseEvent =
            svgHandler.mouseEventHistory.mouseMove || svgHandler.mouseEventHistory.mouseDown;

        if (event.timeStamp - prevMouseEvent.timeStamp > 30) {
            svgHandler.panBy({
                x: event.clientX - prevMouseEvent.clientX,
                y: event.clientY - prevMouseEvent.clientY,
            });
            svgHandler.mouseEventHistory.mouseMove = event;
        }
    }
};
