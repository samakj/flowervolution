import ResizeObserver from 'resize-observer-polyfill';
import { SVGHandler } from '@flowervolution/svg-handler';

export const addResizeHandler = (svgHandler: SVGHandler): void => {
    const resizeObserver: ResizeObserver = new ResizeObserver(
        (): void => svgHandler.updateSvgProperties(),
    );
    resizeObserver.observe(svgHandler.element.parentElement);
};
