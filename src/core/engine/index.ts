import { SVGHandler } from '@flowervolution/frontend/svg-handler';
import { SeededRandomNumberGenerator } from '@flowervolution/core/generators/seeded-random-number-generator';
import { Grid2d } from '@flowervolution/core/data-structures/grid-2d';
import { GameTile } from '@flowervolution/core/models/game-tile';
import { GameOptionsType, TerrainType } from '@flowervolution/core/engine/types';
import { deepObjectCombine } from '@flowervolution/utils/deep-combine';
import { DEFAULT_OPTIONS } from '@flowervolution/core/config/default-options';
import { generate2dHeightMapEquation, applyHeightMapEquationToGrid2d } from '@flowervolution/core/generators/environment-generators/height-map';
import { Cell } from '@flowervolution/core/data-structures/grid-2d/cell';
import { sleep } from '@flowervolution/utils/sleep';
import { PositionType } from '@flowervolution/types';
import { Equation } from '@flowervolution/core/models/equation';
import { SVGChildElementType } from '@flowervolution/frontend/svg-handler/types';
import { bresenhamLine } from '@flowervolution/utils/bresenham-line';
import { applyLightMapToGrid2d } from '@flowervolution/core/generators/environment-generators/light-map';
import { applyWaterLevelsToGrid2d } from '@flowervolution/core/generators/environment-generators/water-level';
import { applyTerrainTypesToGrid2d } from '@flowervolution/core/generators/environment-generators/terrain-type';

export class GameEngine {
    options: GameOptionsType;

    seededRandomNumberGenerator: SeededRandomNumberGenerator;
    svgHandler: SVGHandler;
    grid: Grid2d<GameTile>;

    constructor(element: string | SVGElement, options?: GameOptionsType) {
        this.options = deepObjectCombine(options || {}, DEFAULT_OPTIONS);

        this.seededRandomNumberGenerator = new SeededRandomNumberGenerator(this.options.seed);
        this.options.seed = this.seededRandomNumberGenerator.initialSeed;

        this.svgHandler = new SVGHandler(element);
        this.options.dom.elementId = this.svgHandler.element.id;

        this.grid = new Grid2d<GameTile>(
            { x: this.options.grid.size, y: this.options.grid.size },
            null,
            null,
            (): GameTile => new GameTile(),
        );

        Promise.all([
            this.drawGrid(),
            this.createTerrainClasses(),
            this.generateHeightMap(),
        ])
            .then(
                () => Promise.all([
                    this.drawTileProperty(['environment', 'height']),
                    this.inferTerrainTypes(),
                    this.generateLightMap(),
                    this.addCellDebug(),
                ]),
            )
            .then(
                () => Promise.all([
                    this.drawTileProperty(['environment', 'terrain', 'type']),
                    this.inferWaterLevels(),
                ]),
            )
            .then(
                () => Promise.all([
                    this.addPropertyButtons(),
                ]),
            )
            .catch(console.error);
    }

    //// ANIMATION AND DRAWING

    chunkAnimationIteration(
        x: number,
        y: number,
        animationFunction: (cell: Cell<GameTile>) => void,
    ): Promise<void> {
        return new Promise<void>((resolve: Function): void => {
            this.grid
            .getChunk(
                {
                    x: this.options.animation.maxChunkSize,
                    y: this.options.animation.maxChunkSize,
                },
                {
                    x: x * this.options.animation.maxChunkSize,
                    y: y * this.options.animation.maxChunkSize,
                },
            )
            .forEach(animationFunction);
            resolve(sleep(this.options.animation.time - this.options.animation.chunkOverlap));
        });
    }

    chunkAnimation(animationFunction: (cell: Cell<GameTile>) => void): Promise<void> {
        return new Promise<void>((resolve: Function): void => {
            const chunksRequired: number = Math.ceil(
                this.options.grid.size / this.options.animation.maxChunkSize,
            );
            const chunkList: PositionType[] = [];

            for (let y: number = 0; y < chunksRequired; y += 1) {
                for (let x: number = 0; x < chunksRequired; x += 1) {
                    chunkList.push({ x, y });
                }
            }

            chunkList
                .reduce(
                    (acc: Promise<void | PromiseLike<void>>, chunk: PositionType) =>
                        acc.then(() =>
                            this.chunkAnimationIteration(chunk.x, chunk.y, animationFunction),
                        ),
                    Promise.resolve(),
                )
                .then(() => resolve(sleep(this.options.animation.gap)));
        });
    }

    drawGrid(): Promise<void> {
        return new Promise<void>((resolve: Function): void => {
            if (!this.options.dom.cellPxSize) {
                this.options.dom.cellPxSize = Math.floor(
                    Math.min(
                        this.svgHandler.element.clientHeight / this.options.grid.size,
                        this.svgHandler.element.clientWidth / this.options.grid.size,
                    ) -
                        2 * this.options.dom.cellPxSpacing,
                );
            }

            const outerCellPxSize: number =
                this.options.dom.cellPxSize + 2 * this.options.dom.cellPxSpacing;

            for (const cell of this.grid.cells) {
                cell.value.elementId = this.svgHandler.addRectChild(
                    { x: outerCellPxSize * cell.position.x, y: outerCellPxSize * cell.position.y },
                    { x: this.options.dom.cellPxSize, y: this.options.dom.cellPxSize },
                    null,
                    { class: 'grid-cell' },
                );
            }

            resolve(sleep(this.options.animation.time + this.options.animation.gap));
        });
    }

    drawTileProperty(propertyPath: string[]): Promise<void> {
        return this.chunkAnimation((cell: Cell<GameTile>): void => {
            cell.value.drawProperty(propertyPath, this.svgHandler, this.options);
        });
    }

    //// GENERATION AND CREATION

    createTerrainClasses(): Promise<void> {
        return new Promise<void>((resolve: Function): void => {
            let styles: string = `#${this.options.dom.elementId} .grid-cell` +
                `{transition: ${this.options.animation.time}ms}`;
            Object.entries(this.options.terrain.types).forEach(
                ([name, options]: [string, TerrainType]) => {
                    styles += `#${this.options.dom.elementId} .grid-cell.-${name}{fill: ${options.fill}}`;
                },
            );
            const el: HTMLElement = document.createElement('style');
            el.innerText = styles;
            document.head.insertAdjacentElement('beforeend', el);
            resolve();
        });
    }

    generateHeightMap(): Promise<void> {
        return new Promise<void>((resolve: Function): void => {
            if (!this.options.terrain.spread) {
                this.options.terrain.spread = this.options.grid.size * 4;
            }

            const terrainEquation: Equation = generate2dHeightMapEquation(
                this.seededRandomNumberGenerator,
                this.options.terrain.equationTerms,
                this.options.terrain.spread,
            );

            if (!this.options.terrain.offset) {
                this.options.terrain.offset = {
                    x: this.seededRandomNumberGenerator.randomIntegerBetween(256, 1024),
                    y: this.seededRandomNumberGenerator.randomIntegerBetween(256, 1024),
                };
            }

            applyHeightMapEquationToGrid2d(terrainEquation, this.grid, this.options.terrain.offset);
            resolve();
        });
    }

    inferTerrainTypes(): Promise<void> {
        return new Promise<void>((resolve: Function): void => {
            applyTerrainTypesToGrid2d(this.grid, this.options);
            resolve();
        });
    }

    inferWaterLevels(): Promise<void> {
        return new Promise<void>(
            (resolve: Function): void => {
                applyWaterLevelsToGrid2d(this.grid, this.options);
                resolve();
            },
        );
    }

    generateLightMap(): Promise<void> {
        return new Promise<void>(
            (resolve: Function): void => {
                applyLightMapToGrid2d(
                    { x: this.grid.dimensions.x / 2, y: this.grid.dimensions.y / 2, z: 2 },
                    this.grid,
                    this.options.terrain.types.water.heightRange.max,
                );
                resolve();
            },
        );
    }

    createPropertyButton(propertyPath: string[]): HTMLElement {
        const element: HTMLElement = document.createElement('div');
        element.classList.add(
            'property-button',
            ...propertyPath.map((propertyPathChunk: string): string => `-${propertyPathChunk}`),
        );
        element.innerText = propertyPath[propertyPath.length - 1][0];

        return element;
    }

    addPropertyButtons(): Promise<void> {
        return new Promise<void>(
            (resolve: Function): void => {
                const buttonPropertyPaths: string[][] = [
                    ['environment', 'terrain', 'type'],
                    ['environment', 'height'],
                    ['environment', 'light', 'intensity'],
                    ['environment', 'water', 'saturation'],
                    ['environment', 'water', 'salinity'],
                ];
                const containerElement: HTMLElement = document.querySelector(
                    '.game-grid .game-controls .property-buttons',
                );
                const buttonElements: HTMLElement[] = [];

                buttonPropertyPaths.forEach(
                    (propertyPath: string[]): void => {
                        const element: HTMLElement = this.createPropertyButton(propertyPath);

                        buttonElements.push(element);
                        element.addEventListener(
                            'click',
                            () => {
                                this.drawTileProperty(propertyPath);
                                buttonElements.forEach(
                                    (buttonElement: HTMLElement): void => {
                                        buttonElement.classList.replace('-active', '-inactive');
                                    },
                                );
                                element.classList.add('-active');
                            },
                        );
                        containerElement.insertAdjacentElement('beforeend', element);
                    },
                );

                resolve();
            },
        );
    }

    //// DEBUG

    addCellDebug(): Promise<void> {
        return new Promise<void>(
            (resolve: Function): void => {
                this.grid.cells.forEach(
                    (cell: Cell<GameTile>): void => {
                        if (this.options.debug.cellValueDisplay) {
                            this.svgHandler.getChild(cell.value.elementId).addEventListener(
                                'click',
                                (): void => {
                                    const height: string = (
                                        cell.value.environment.height * 1000
                                    ).toFixed(0);
                                    const lightIntensity: string = (
                                        cell.value.environment.light.intensity * 100
                                    ).toFixed(1);
                                    const waterSaturation: string = (
                                        cell.value.environment.water.saturation * 100
                                    ).toFixed(1);
                                    const waterSalinity: string = (
                                        cell.value.environment.water.salinity * 100
                                    ).toFixed(1);

                                    document.querySelector('.game-controls .content').innerHTML = `
<div class="property-group">
    <div class="property-group-title">Environment</div>
    <div class="property">
        <div class="property-title">Position</div>
        <div class="property-value">x: ${cell.position.x}, y: ${cell.position.y}</div>
    </div>
    <div class="property">
        <div class="property-title">Height</div>
        <div class="property-value">${height}m</div>
    </div>
    <div class="property-group">
        <div class="property-group-title">Light</div>
        <div class="property">
            <div class="property-title">Intensity</div>
            <div class="property-value">
                <div class="bar" style="--bar-width: ${lightIntensity}%">
                    <div class="value">${lightIntensity}%</div>
                </div>
            </div>
        </div>
    </div>
    <div class="property-group">
        <div class="property-group-title">Water</div>
        <div class="property">
            <div class="property-title">Saturation</div>
            <div class="property-value">
                <div class="bar" style="--bar-width: ${waterSaturation}%">
                    <div class="value">${waterSaturation}%</div>
                </div>
            </div>
        </div>
        <div class="property">
            <div class="property-title">Salinity</div>
            <div class="property-value">
                <div class="bar" style="--bar-width: ${waterSalinity}%">
                    <div class="value">${waterSalinity}%</div>
                </div>
            </div>
        </div>
    </div>
</div>
                                    `;
                                },
                            );
                        }
                        if (this.options.debug.sunRay) {
                            this.svgHandler.getChild(cell.value.elementId).addEventListener(
                                'mouseenter',
                                (): void => {
                                    this.drawRayPath(cell.position, { x: 32, y: 32 });
                                },
                            );
                            this.svgHandler.getChild(cell.value.elementId).addEventListener(
                                'mouseleave',
                                (): void => {
                                    this.clearRayPath(cell.position, { x: 32, y: 32 });
                                },
                            );
                        }
                    },
                );
                resolve();
            },
        );
    }

    drawRayPath(a: PositionType, b: PositionType): Promise<void> {
        return new Promise<void>(
            (resolve: Function): void => {
                bresenhamLine(a, b).forEach(
                    (position: PositionType, index: number, positionList: PositionType[]): void => {
                        const cell: Cell<GameTile> = this.grid.getCell(position);
                        const element: SVGChildElementType = this.svgHandler.getChild(cell.value.elementId);
                        element.style.fill = index === 0 || index === positionList.length - 1 ? 'green' : 'red';
                        element.style.fillOpacity = '1';
                        element.style.transition = '0ms';
                    },
                );
                resolve();
            },
        );
    }

    clearRayPath(a: PositionType, b: PositionType): Promise<void> {
        return new Promise<void>(
            (resolve: Function): void => {
                bresenhamLine(a, b).forEach(
                    (position: PositionType): void => {
                        const cell: Cell<GameTile> = this.grid.getCell(position);
                        const element: SVGChildElementType = this.svgHandler.getChild(cell.value.elementId);
                        const options: TerrainType = this.options.terrain.types[cell.value.environment.terrain.type];
                        element.style.fill = '';
                        element.style.transition = '';
                        element.style.fillOpacity = (
                            (options.fillOpacityRange.max - options.fillOpacityRange.min) *
                                cell.value.environment.terrain.height +
                            options.fillOpacityRange.min
                        ).toString();
                    },
                );
                resolve();
            },
        );
    }
}
