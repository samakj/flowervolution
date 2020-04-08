import { BadElementError, IdGenerationError } from '@flowervolution/frontend/svg-handler/errors';
import {
    DimensionsType,
    NumberLimitsType,
    PositionLimitsType,
    PositionType,
} from '@flowervolution/types';
import { limitNumber, limitPosition } from '@flowervolution/utils/limit-values';
import {
    MouseEventHistoryType,
    SVGChildElementType,
    TouchEventHistoryType,
} from '@flowervolution/frontend/svg-handler/types';
import { addMouseEventHandlers } from '@flowervolution/frontend/svg-handler/event-handlers/mouse';
import { addTouchEventHandlers } from '@flowervolution/frontend/svg-handler/event-handlers/touch';
import { addWheelEventHandlers } from '@flowervolution/frontend/svg-handler/event-handlers/wheel';
import { addResizeHandler } from '@flowervolution/frontend/svg-handler/event-handlers/resize';
import { randomHex } from '@flowervolution/utils/random';
import { createPathElement } from '@flowervolution/frontend/svg-handler/element-creation/path';
import { createCircleElement } from '@flowervolution/frontend/svg-handler/element-creation/circle';
import { createRectElement } from '@flowervolution/frontend/svg-handler/element-creation/rect';
import { createPolygonElement } from '@flowervolution/frontend/svg-handler/element-creation/polygon';

export class SVGHandler {
    element: SVGElement;
    children: { [id: string]: SVGChildElementType };

    scale: number;
    scaleLimits: NumberLimitsType;
    scaleAnimationId: number;

    translation: PositionType;
    translationLimits: PositionLimitsType;
    translationAnimationId: number;

    boundingClientRect: DOMRect | ClientRect;

    mousePosition: PositionType;
    mouseEventHistory: MouseEventHistoryType;
    touchEventHistory: TouchEventHistoryType;

    constructor(element: string | SVGElement) {
        this.element = typeof element === 'string' ? SVGHandler.getSVGElement(element) : element;
        this.children = {};

        this.scale = 1;
        this.scaleLimits = { min: 0.1, max: 10 };

        this.translation = { x: 0, y: 0 };
        this.translationLimits = { x: { min: 0, max: 400 }, y: { min: 0, max: 400 } };

        this.mousePosition = { x: 0, y: 0 };
        this.mouseEventHistory = {};
        this.touchEventHistory = {};

        this.updateSvgProperties();
        this.element.classList.remove('-hide');

        addMouseEventHandlers(this);
        addTouchEventHandlers(this);
        addWheelEventHandlers(this);
        addResizeHandler(this);

        this.animatedPanTo = this.animatedPanTo.bind(this);
    }

    static getSVGElement(elementId: string): SVGElement {
        const element: HTMLElement = document.querySelector(`svg#${elementId}`);

        if (!(element instanceof SVGElement)) {
            throw new BadElementError('Element id provided does not resolve to an svg element.');
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

    addChild(element: SVGChildElementType, idLength?: number, maxIterationCount?: number): string {
        let id: string = randomHex(idLength || 6);
        let iterationCount: number = 0;

        while (id in this.children) {
            if (iterationCount > (maxIterationCount || 1000)) {
                throw new IdGenerationError('Failed to generate child id within iteration limit');
            }

            id = randomHex(idLength || 6);
            iterationCount += 1;
        }

        this.children[id] = element;
        this.element.insertAdjacentElement('beforeend', element);

        return id;
    }

    getChild(id: string): SVGChildElementType {
        return this.children[id];
    }

    removeChild(id: string): void {
        delete this.children[id];
    }

    addPathChild(
        commands: string[],
        attrs?: { [attribute: string]: string },
        idLength?: number,
        maxIterationCount?: number,
    ): string {
        return this.addChild(createPathElement(commands, attrs), idLength, maxIterationCount);
    }

    addCircleChild(
        center: PositionType,
        radius: number,
        attrs?: { [attribute: string]: string },
        idLength?: number,
        maxIterationCount?: number,
    ): string {
        return this.addChild(
            createCircleElement(center, radius, attrs),
            idLength,
            maxIterationCount,
        );
    }

    addRectChild(
        position: PositionType,
        dimensions: DimensionsType,
        cornerRadii?: DimensionsType,
        attrs?: { [attribute: string]: string },
        idLength?: number,
        maxIterationCount?: number,
    ): string {
        return this.addChild(
            createRectElement(position, dimensions, cornerRadii, attrs),
            idLength,
            maxIterationCount,
        );
    }

    addPolygonChild(
        points: PositionType[],
        position?: PositionType,
        attrs?: { [attribute: string]: string },
        idLength?: number,
        maxIterationCount?: number,
    ): string {
        return this.addChild(
            createPolygonElement(points, position, attrs),
            idLength,
            maxIterationCount,
        );
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

    animatedPanBy(delta: PositionType, duration: number = 300): void {
        this.animatedPanTo(
            {
                x: this.translation.x + delta.x,
                y: this.translation.y + delta.y,
            },
            duration,
        );
    }

    animatedPanTo(target: PositionType, duration: number = 300): void {
        const id: number = +new Date();
        this.translationAnimationId = id;

        requestAnimationFrame(() =>
            this.animatedPanToLooper(
                id,
                Object.assign(this.translation),
                limitPosition(target, this.translationLimits),
                id,
                duration,
            ),
        );
    }

    animatedPanToLooper(
        id: number,
        startPosition: PositionType,
        targetPosition: PositionType,
        startTime: number,
        duration: number,
    ): void {
        if (this.translationAnimationId !== id) return;

        const timeRatio: number = (+new Date() - startTime) / duration;

        if (timeRatio > 1) {
            this.panTo(targetPosition);
            return;
        }

        this.panTo({
            x: startPosition.x + timeRatio * (targetPosition.x - startPosition.x),
            y: startPosition.y + timeRatio * (targetPosition.y - startPosition.y),
        });

        requestAnimationFrame(() =>
            this.animatedPanToLooper(id, startPosition, targetPosition, startTime, duration),
        );
    }

    scaleBy(delta: number, center: PositionType): void {
        const newScale: number = limitNumber(this.scale * delta, this.scaleLimits);

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
        const scaledDelta: number = scale / this.scale;
        return this.scaleBy(scaledDelta, center);
    }

    animatedScaleBy(delta: number, center: PositionType, duration: number = 300): void {
        this.animatedScaleTo(this.scale * delta, center, duration);
    }

    animatedScaleTo(target: number, center: PositionType, duration: number = 300): void {
        const id: number = +new Date();
        this.scaleAnimationId = id;

        requestAnimationFrame(() =>
            this.animatedScaleToLooper(
                id,
                this.scale,
                limitNumber(target, this.scaleLimits),
                center,
                id,
                duration,
            ),
        );
    }

    animatedScaleToLooper(
        id: number,
        startScale: number,
        targetScale: number,
        center: PositionType,
        startTime: number,
        duration: number,
    ): void {
        if (this.scaleAnimationId !== id) return;

        const timeRatio: number = (+new Date() - startTime) / duration;

        if (timeRatio > 1) {
            this.scaleTo(targetScale, center);
            return;
        }

        this.scaleTo(startScale + timeRatio * (targetScale - startScale), center);

        requestAnimationFrame(() =>
            this.animatedScaleToLooper(id, startScale, targetScale, center, startTime, duration),
        );
    }
}
