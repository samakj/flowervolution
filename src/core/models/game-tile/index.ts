import { SVGChildElementType } from '@flowervolution/frontend/svg-handler/types';
import { deepGet } from '@flowervolution/utils/deep-get';
import { SVGHandler } from '@flowervolution/frontend/svg-handler';
import { GameOptionsType, TerrainType } from '@flowervolution/core/engine/types';

export class GameTile {
    elementId?: string;
    environment?: {
        height?: number;
        terrain?: {
            type?: string;
            height?: number;
        };
        light?: {
            intensity?: number;
        };
        water?: {
            saturation?: number;
            salinity?: number;
        };
    };

    currentPropertyStyles?: string[];

    constructor () {
        this.environment = { terrain: {}, light: {}, water: {} };
    }

    removePropertyStyleClasses (element: SVGChildElementType): void {
        if (this.currentPropertyStyles) {
            element.classList.remove(...this.currentPropertyStyles);
            this.currentPropertyStyles = null;
        }
    }

    drawProperty (propertyPath: string[], svgHandler: SVGHandler, gameOptions?: GameOptionsType): void {
        if (
            propertyPath.length === 3 &&
            propertyPath[0] === 'environment' &&
            propertyPath[1] === 'terrain' &&
            propertyPath[2] === 'type'
        ) {
            return this.drawTerrainType(svgHandler, gameOptions);
        }
        const element: SVGChildElementType = svgHandler.getChild(this.elementId);
        this.removePropertyStyleClasses(element);

        const propertyValue: any = deepGet(this, propertyPath);

        if (typeof propertyValue !== 'number') {
            throw Error(`Trying to display property '${propertyPath[propertyPath.length - 1]}' which isn't a number`);
        }

        this.currentPropertyStyles = propertyPath.map((pathChunk: string): string => `-${pathChunk}`);
        element.style.fillOpacity = deepGet(this, propertyPath).toString();
        element.classList.add(...this.currentPropertyStyles);
    }

    drawTerrainType (svgHandler: SVGHandler, gameOptions?: GameOptionsType): void {
        const options: TerrainType = gameOptions.terrain.types[this.environment.terrain.type];
        const element: SVGChildElementType = svgHandler.getChild(this.elementId);

        this.removePropertyStyleClasses(element);
        this.currentPropertyStyles = [`-${this.environment.terrain.type}`];

        element.classList.add(...this.currentPropertyStyles);
        element.style.fillOpacity = (
            (options.fillOpacityRange.max - options.fillOpacityRange.min) *
                this.environment.terrain.height +
            options.fillOpacityRange.min
        ).toString();
    }
}
