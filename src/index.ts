import '@flowervolution/templates/style.scss';
import { SVGHandler } from '@flowervolution/svg-handler';
import { SeededRandomNumberGenerator } from '@flowervolution/core/seeded-random-number-generator';
import { generate2dTerrainEquation } from '@flowervolution/core/terrain/height-generation/terrain-equation-generation';
import { Grid2d } from '@flowervolution/core/grid-2d';
import { appendHeight2dGrid } from '@flowervolution/core/terrain/height-generation';
import { GameEngine } from '@flowervolution/core/engine';
const templateParameters: {
    [key: string]: any;
} = require('@flowervolution/templates/template-parameters');

const engine: GameEngine = new GameEngine(templateParameters.gameMountId);

// declare global {
//     interface Window {
//         svgHandler: SVGHandler;
//         colourTerrain: Function;
//         seededRandomNumberGenerator: SeededRandomNumberGenerator;
//         grid: Grid2d<{[key: string]: any}>;
//     }
// }
//
// console.time('Total Generation')
//
// const gridDims: number = 128;
// const cellSize: number = Math.floor(960 / gridDims);
//
// console.time('SVGHandler Init')
// window.svgHandler = new SVGHandler(templateParameters.gameMountId);
// console.timeEnd('SVGHandler Init')
//
// console.time('SRNG Init')
// window.seededRandomNumberGenerator = new SeededRandomNumberGenerator();
// console.timeEnd('SRNG Init')
//
// console.time('Grid Init')
// window.grid = new Grid2d({ x: gridDims, y: gridDims }, null, null, () => ({}));
// console.timeEnd('Grid Init')
//
// console.time('Add Cell Elements')
// for (const cell of window.grid.cells) {
//     cell.value.elementId = window.svgHandler.addRectChild(
//         { x: cellSize * cell.position.x, y: cellSize * cell.position.y },
//         { x: cellSize, y: cellSize },
//         null,
//         { class: 'grid-cell' },
//     );
// }
// console.timeEnd('Add Cell Elements')
//
// console.time('Terrain Equation Generation')
// const terrainEquation = generate2dTerrainEquation(window.seededRandomNumberGenerator, 16, gridDims * 4);
// console.timeEnd('Terrain Equation Generation')
//
// console.time('Add Height To Grid')
// appendHeight2dGrid(
//     terrainEquation,
//     window.grid,
//     {
//         x: window.seededRandomNumberGenerator.randomIntegerBetween(256, 1024),
//         y: window.seededRandomNumberGenerator.randomIntegerBetween(256, 1024),
//     },
// );
// console.timeEnd('Add Height To Grid')
//
//
// console.time('Colour Grid')
// for (const cell of window.grid.cells) {
//     let terrain: string = null;
//
//     if (cell.value.height > 0.85) {
//         terrain = 'snow';
//         window.svgHandler.getChild(cell.value.elementId).style.opacity = cell.value.height.toString()
//     } else if (cell.value.height > 0.75) {
//         terrain = 'rock';
//         window.svgHandler.getChild(cell.value.elementId).style.opacity = cell.value.height.toString()
//     } else  if (cell.value.height < 0.3) {
//         terrain = 'water';
//         window.svgHandler.getChild(cell.value.elementId).style.opacity = (cell.value.height + 0.5).toString()
//     } else {
//         terrain = 'mud';
//         window.svgHandler.getChild(cell.value.elementId).style.opacity = (cell.value.height + 0.2).toString()
//     }
//
//     window.svgHandler.getChild(cell.value.elementId).classList.add(`-${terrain}`)
// }
// console.timeEnd('Colour Grid')
//
// console.timeEnd('Total Generation');
