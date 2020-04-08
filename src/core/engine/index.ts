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
import { roundToDp } from '@flowervolution/utils/round';
import { deepGet } from '@flowervolution/utils/deep-get';
import { SVGChildElementType } from '@flowervolution/frontend/svg-handler/types';

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

        Promise.all([this.drawGrid(), this.createTerrainClasses(), this.generateHeightMap()])
            .then(
                () => Promise.all([
                    this.draw1dProperty(['environment', 'height']),
                    this.interpretHeightMap(),
                    this.addCellDebug(),
                ]),
            )
            .then(() => Promise.all([this.drawTerrainMap(), this.interpretTerrain()]))
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

    draw1dProperty(propertyPath: string[]): Promise<void> {
        return this.chunkAnimation((cell: Cell<GameTile>): void => {
            const element: SVGChildElementType = this.svgHandler.getChild(cell.value.elementId);
            this.removeStylingClasses(element);
            element.style.fillOpacity = deepGet(cell.value, propertyPath).toString();
            element.classList.add(`-${propertyPath[propertyPath.length - 1]}`);
        });
    }

    drawTerrainMap(): Promise<void> {
        return this.chunkAnimation((cell: Cell<GameTile>): void => {
            const options: TerrainType = this.options.terrain.types[cell.value.environment.terrain.type];
            const element: SVGChildElementType = this.svgHandler.getChild(cell.value.elementId);
            this.removeStylingClasses(element);
            element.classList.add(`-${cell.value.environment.terrain.type}`);
            element.style.fillOpacity = (
                (options.fillOpacityRange.max - options.fillOpacityRange.min) *
                    cell.value.environment.terrain.height +
                options.fillOpacityRange.min
            ).toString();
        });
    }

    removeStylingClasses(element: SVGChildElementType): void {
        element.classList.remove('-water', '-mud', '-rock', '-snow', '-height', '-saturation', '-salinity');
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

    interpretHeightMap(): Promise<void> {
        return new Promise<void>((resolve: Function): void => {
            this.grid.cells.forEach((cell: Cell<GameTile>): void => {
                for (const name in this.options.terrain.types) {
                    const options: TerrainType = this.options.terrain.types[name];

                    if (
                        cell.value.environment.height >= options.heightRange.min &&
                        cell.value.environment.height <= options.heightRange.max
                    ) {
                        cell.value.environment.terrain.type = name;
                        cell.value.environment.terrain.height = roundToDp(
                            (cell.value.environment.height - options.heightRange.min) /
                            (options.heightRange.max - options.heightRange.min),
                            3,
                        );
                        break;
                    }
                }
                if (!cell.value.environment.terrain.type) {
                    throw Error(`No terrain found for height: ${cell.value.environment.height}`);
                }
            });
            resolve();
        });
    }

    interpretTerrain(): Promise<void> {
        return new Promise<void>(
            (resolve: Function): void => {
                this.grid.cells.forEach(
                    (cell: Cell<GameTile>): void => {
                        if (cell.value.environment.terrain.type === 'water') {
                            cell.value.environment.water.saturation = 1;
                            cell.value.environment.water.salinity = 1;
                        } else if (cell.value.environment.terrain.type === 'mud') {
                            cell.value.environment.water.saturation = 1 - cell.value.environment.terrain.height;
                            cell.value.environment.water.salinity = roundToDp(
                                (1 - cell.value.environment.terrain.height) ** 2,
                                3,
                            );
                        } else if (cell.value.environment.terrain.type === 'rock') {
                            cell.value.environment.water.saturation = 0;
                            cell.value.environment.water.salinity = 0;
                        } else if (cell.value.environment.terrain.type === 'snow') {
                            cell.value.environment.water.saturation = 1;
                            cell.value.environment.water.salinity = 0;
                        } else {
                            throw Error(
                                `Terrain type not handled in terrain interpretation: ` +
                                `${cell.value.environment.terrain.type}`,
                            );
                        }
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
                        this.svgHandler.getChild(cell.value.elementId).addEventListener(
                            'click',
                            (): void => {
                                document.querySelector('.game-controls').innerHTML = `
                                <pre>${JSON.stringify(cell.value, null, 4)}</pre>
                                `;
                            },
                        );
                    },
                );
                resolve();
            },
        );
    }
}
