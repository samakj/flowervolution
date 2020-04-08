import ResizeObserver from 'resize-observer-polyfill';
import { SVGHandler } from '@flowervolution/frontend/svg-handler';

export const addResizeHandler = (svgHandler: SVGHandler): void => {
    const resizeObserver: ResizeObserver = new ResizeObserver((): void =>
        svgHandler.updateSvgProperties(),
    );
    resizeObserver.observe(svgHandler.element.parentElement);
};
