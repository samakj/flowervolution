import { SVGHandler } from '@flowervolution/svg-handler';
import { SeededRandomNumberGenerator } from '@flowervolution/core/seeded-random-number-generator';
import { Grid2d } from '@flowervolution/core/grid-2d';
import { GameTile } from '@flowervolution/core/engine/tile';
import { GameOptionsType, TerrainType } from '@flowervolution/core/engine/types';
import { deepObjectCombine } from '@flowervolution/utils/deep-combine';
import { DEFAULT_OPTIONS } from '@flowervolution/core/engine/default-options';
import { generate2dTerrainEquation } from '@flowervolution/core/terrain/height-generation/terrain-equation-generation';
import { appendHeight2dGrid } from '@flowervolution/core/terrain/height-generation';
import { Cell } from '@flowervolution/core/grid-2d/cell';
import { sleep } from '@flowervolution/utils/sleep';
import { PositionType } from '@flowervolution/types';
import { Equation } from '@flowervolution/core/equation';

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
            .then(() => Promise.all([this.drawRawHeightMap(), this.interpretHeightMap()]))
            .then(() => Promise.all([this.drawTerrainMap()]))
            .catch(console.error);
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
                    { class: 'grid-cell -empty' },
                );
            }

            resolve(sleep(this.options.animation.time + this.options.animation.gap));
        });
    }

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

            const terrainEquation: Equation = generate2dTerrainEquation(
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

            appendHeight2dGrid(terrainEquation, this.grid, this.options.terrain.offset);
            resolve();
        });
    }

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

    drawRawHeightMap(): Promise<void> {
        return this.chunkAnimation((cell: Cell<GameTile>): void => {
            this.svgHandler.children[cell.value.elementId].style.fillOpacity = (
                (this.options.terrain.types.empty.fillOpacityRange.max -
                    this.options.terrain.types.empty.fillOpacityRange.min) *
                    cell.value.height +
                this.options.terrain.types.empty.fillOpacityRange.min
            ).toString();
        });
    }

    interpretHeightMap(): Promise<void> {
        return new Promise<void>((resolve: Function): void => {
            this.grid.cells.forEach((cell: Cell<GameTile>): void => {
                for (const name in this.options.terrain.types) {
                    const options: TerrainType = this.options.terrain.types[name];

                    if (
                        cell.value.height >= options.heightRange.min &&
                        cell.value.height <= options.heightRange.max
                    ) {
                        cell.value.terrain = name;
                        cell.value.terrainSpecificHeight =
                            (cell.value.height - options.heightRange.min) /
                            (options.heightRange.max - options.heightRange.min);
                        break;
                    }
                }
                if (!cell.value.terrain) {
                    throw Error(`No terrain found for height: ${cell.value.height}`);
                }
            });
            resolve();
        });
    }

    drawTerrainMap(): Promise<void> {
        return this.chunkAnimation((cell: Cell<GameTile>): void => {
            const options: TerrainType = this.options.terrain.types[cell.value.terrain];
            this.svgHandler.children[cell.value.elementId].classList.remove('-empty');
            this.svgHandler.children[cell.value.elementId].classList.add(`-${cell.value.terrain}`);
            this.svgHandler.children[cell.value.elementId].style.fillOpacity = (
                (options.fillOpacityRange.max - options.fillOpacityRange.min) *
                    cell.value.terrainSpecificHeight +
                options.fillOpacityRange.min
            ).toString();
        });
    }
}
