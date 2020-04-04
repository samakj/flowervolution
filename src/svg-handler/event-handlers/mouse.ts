import { SVGHandler } from '@flowervolution/svg-handler';

export const addMouseEventHandlers = (svgHandler: SVGHandler): void => {
    svgHandler.element.parentElement.addEventListener('mouseenter', mouseEnterHandler(svgHandler));
    svgHandler.element.parentElement.addEventListener('mouseleave', mouseLeaveHandler(svgHandler));
    svgHandler.element.parentElement.addEventListener('mousedown', mouseDownHandler(svgHandler));
    svgHandler.element.parentElement.addEventListener('mouseup', mouseUpHandler(svgHandler));
    svgHandler.element.parentElement.addEventListener('mousemove', mouseMoveHandler(svgHandler));
};

const mouseEnterHandler = (svgHandler: SVGHandler) => (event: MouseEvent): void => {
    svgHandler.updateMousePosition(event);
    svgHandler.mouseEventHistory.mouseEnter = event;
    svgHandler.mouseEventHistory.mouseLeave = null;
    svgHandler.mouseEventHistory.mouseDown = null;
    svgHandler.mouseEventHistory.mouseUp = null;
    svgHandler.mouseEventHistory.mouseMove = null;
};

const mouseLeaveHandler = (svgHandler: SVGHandler) => (event: MouseEvent): void => {
    svgHandler.updateMousePosition(event);
    svgHandler.mouseEventHistory.mouseEnter = null;
    svgHandler.mouseEventHistory.mouseLeave = event;
    svgHandler.mouseEventHistory.mouseDown = null;
    svgHandler.mouseEventHistory.mouseUp = null;
    svgHandler.mouseEventHistory.mouseMove = null;
};

const mouseDownHandler = (svgHandler: SVGHandler) => (event: MouseEvent): void => {
    svgHandler.updateMousePosition(event);
    svgHandler.mouseEventHistory.mouseDown = event;
    svgHandler.mouseEventHistory.mouseUp = null;
    svgHandler.mouseEventHistory.mouseMove = null;
};

const mouseUpHandler = (svgHandler: SVGHandler) => (event: MouseEvent): void => {
    svgHandler.updateMousePosition(event);
    svgHandler.mouseEventHistory.mouseDown = null;
    svgHandler.mouseEventHistory.mouseUp = event;
    svgHandler.mouseEventHistory.mouseMove = null;
};

const mouseMoveHandler = (svgHandler: SVGHandler) => (event: MouseEvent): void => {
    svgHandler.updateMousePosition(event);

    if (svgHandler.mouseEventHistory.mouseDown) {
        const prevMouseEvent = svgHandler.mouseEventHistory.mouseMove || svgHandler.mouseEventHistory.mouseDown;

        svgHandler.panBy({
            x: event.clientX - prevMouseEvent.clientX,
            y: event.clientY - prevMouseEvent.clientY,
        });
    }

    svgHandler.mouseEventHistory.mouseMove = event;
};
