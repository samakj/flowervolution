import { SVGHandler } from '@flowervolution/svg-handler';
import { TouchEventHandlerType } from '@flowervolution/svg-handler/event-handlers/types';

export const addTouchEventHandlers = (svgHandler: SVGHandler): void => {
    svgHandler.element.parentElement.addEventListener('touchstart', touchStartHandler(svgHandler));
    svgHandler.element.parentElement.addEventListener('touchend', touchEndHandler(svgHandler));
    svgHandler.element.parentElement.addEventListener('touchmove', touchMoveHandler(svgHandler));
    svgHandler.element.parentElement.addEventListener(
        'touchcancel',
        touchCancelHandler(svgHandler),
    );
};

const touchStartHandler = (svgHandler: SVGHandler): TouchEventHandlerType => (event: TouchEvent): void => {
    svgHandler.touchEventHistory.touchStart = event;
    svgHandler.touchEventHistory.touchEnd = null;
    svgHandler.touchEventHistory.touchMove = null;
    svgHandler.touchEventHistory.touchCancel = null;
};

const touchEndHandler = (svgHandler: SVGHandler): TouchEventHandlerType => (event: TouchEvent): void => {
    svgHandler.touchEventHistory.touchStart = null;
    svgHandler.touchEventHistory.touchEnd = event;
    svgHandler.touchEventHistory.touchMove = null;
    svgHandler.touchEventHistory.touchCancel = null;
};

const touchMoveHandler = (svgHandler: SVGHandler): TouchEventHandlerType => (event: TouchEvent): void => {
    svgHandler.updateMousePosition(event.touches[0]);

    if (!!svgHandler.touchEventHistory.touchStart) {
        const lastTouchEvent: TouchEvent =
            svgHandler.touchEventHistory.touchMove || svgHandler.touchEventHistory.touchStart;

        if (event.timeStamp - lastTouchEvent.timeStamp > 30) {
            if (event.touches[0].identifier === lastTouchEvent.touches[0].identifier) {
                svgHandler.panBy({
                    x: event.touches[0].clientX - lastTouchEvent.touches[0].clientX,
                    y: event.touches[0].clientY - lastTouchEvent.touches[0].clientY,
                });
            }
            if (
                event.touches.length > 1 &&
                lastTouchEvent.touches.length > 1 &&
                event.touches[0].identifier === lastTouchEvent.touches[0].identifier &&
                event.touches[1].identifier === lastTouchEvent.touches[1].identifier
            ) {
                svgHandler.scaleBy(
                    Math.hypot(
                        event.touches[1].clientX - event.touches[0].clientX,
                        event.touches[1].clientY - event.touches[0].clientY,
                    ),
                    {
                        x: (event.touches[1].clientX + event.touches[0].clientX) / 2,
                        y: (event.touches[1].clientY + event.touches[0].clientY) / 2,
                    },
                );
            }

            svgHandler.touchEventHistory.touchMove = event;
        }
    }
};

const touchCancelHandler = (svgHandler: SVGHandler): TouchEventHandlerType => (event: TouchEvent): void => {
    svgHandler.updateMousePosition(event.touches[0]);
    svgHandler.touchEventHistory.touchStart = null;
    svgHandler.touchEventHistory.touchEnd = null;
    svgHandler.touchEventHistory.touchMove = null;
    svgHandler.touchEventHistory.touchCancel = event;
};
