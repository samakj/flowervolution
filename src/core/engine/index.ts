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
            cell.value.drawProperty(propertyPath, this.svgHandler, this.options)
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
                                    document.querySelector('.game-controls').innerHTML = `
                                    <pre>${JSON.stringify(cell.value, null, 4)}</pre>
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
