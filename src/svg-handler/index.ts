import { BadElement } from '@flowervolution/svg-handler/errors';
import { NumberLimitsType, PositionLimitsType, PositionType } from '@flowervolution/types';
import { limitNumber, limitPosition } from '@flowervolution/utils/limit-values';
import { MouseEventHistoryType, TouchEventHistoryType } from '@flowervolution/svg-handler/types';
import { addMouseEventHandlers } from '@flowervolution/svg-handler/event-handlers/mouse';
import { addTouchEventHandlers } from '@flowervolution/svg-handler/event-handlers/touch';
import { addWheelEventHandlers } from '@flowervolution/svg-handler/event-handlers/wheel';
import { addResizeHandler } from '@flowervolution/svg-handler/event-handlers/resize';

export class SVGHandler {
    element: SVGElement;

    scale: number;
    scaleLimits: NumberLimitsType;

    translation: PositionType;
    translationLimits: PositionLimitsType;

    boundingClientRect: DOMRect | ClientRect;

    mousePosition: PositionType;
    mouseEventHistory: MouseEventHistoryType;
    touchEventHistory: TouchEventHistoryType;

    constructor (element: string | SVGElement) {
        this.element = typeof element === 'string' ? SVGHandler.getSVGElement(element) : element;

        this.scale = 1;
        this.scaleLimits = { min: 0.1, max: 10 };

        this.translation = { x: 0, y: 0};
        this.translationLimits = { x: {min: 0, max: 10}, y: {min: 0, max: 10}};

        this.mousePosition = { x: 0, y: 0};
        this.mouseEventHistory = {};
        this.touchEventHistory = {};

        this.updateSvgProperties();
        this.element.classList.remove('-hide');

        addMouseEventHandlers(this);
        addTouchEventHandlers(this);
        addWheelEventHandlers(this);
        addResizeHandler(this);
    }

    static getSVGElement (elementId: string): SVGElement {
        const element: HTMLElement = document.querySelector(`svg#${elementId}`);

        if (!(element instanceof SVGElement)) {
            throw new BadElement('Element id provided does not resolve to an svg element.');
        }

        return element;
    }

    updateSvgProperties(): void {
        const width: number = this.element.parentElement.clientWidth;
        const height: number = this.element.parentElement.clientHeight;

        this.element.setAttribute('width', width.toString());
        this.element.setAttribute('height', height.toString());
        this.element.setAttribute(
            'viewBox',
            `${-this.translation.x / this.scale} ${-this.translation.y / this.scale} ` +
                `${width / this.scale} ${height / this.scale}`,
        );

        this.boundingClientRect = this.element.getBoundingClientRect();
    }

    updateMousePosition(event: MouseEvent | Touch): void {
        if (this.boundingClientRect) {
            this.mousePosition = {
                x: event.clientX - this.boundingClientRect.left,
                y: event.clientY - this.boundingClientRect.top,
            };
        }
    }

    panBy(delta: PositionType): void {
        this.translation.x += delta.x || 0;
        this.translation.y += delta.y || 0;
        this.translation = limitPosition(this.translation, this.translationLimits);

        this.updateSvgProperties();
    }

    panTo(position: PositionType): void {
        this.translation = limitPosition(position, this.translationLimits);

        this.updateSvgProperties();
    }

    scaleBy(delta: number, center: PositionType): void {
        const newScale: number = limitNumber(this.scale + delta, this.scaleLimits);

        if (newScale !== this.scale) {
            this.translation = {
                x: center.x + (this.translation.x - center.x) * (newScale / this.scale),
                y: center.y + (this.translation.y - center.y) * (newScale / this.scale),
            };
            this.scale = newScale;
            this.updateSvgProperties();
        }
    }

    scaleTo(scale: number, center: PositionType): void {
        const scaledDelta = scale / this.scale;
        return this.scaleBy(scaledDelta, center);
    }
}
