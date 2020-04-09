import { Position3dType, PositionType } from '@flowervolution/types';
import { Grid2d } from '@flowervolution/core/data-structures/grid-2d';
import { GameTile } from '@flowervolution/core/models/game-tile';
import { Cell } from '@flowervolution/core/data-structures/grid-2d/cell';
import { Equation } from '@flowervolution/core/models/equation';
import { Term } from '@flowervolution/core/models/equation/term';
import { bresenhamLine } from '@flowervolution/utils/bresenham-line';
import { roundToDp } from '@flowervolution/utils/round';

export const applyLightMapToGrid2d = (
    sunPosition: Position3dType,
    grid: Grid2d<GameTile>,
    waterHeight: number,
): Grid2d<GameTile> => {
    grid.cells.forEach(
        (cell: Cell<GameTile>): void => {
            const rayPath: PositionType[] = bresenhamLine(cell.position, sunPosition);
            const cellHeight: number = Math.max(cell.value.environment.height, waterHeight);

            const rayXHeightEquation: Equation = new Equation(null, null, cellHeight);
            rayXHeightEquation.addTerm(
                'x',
                new Term(
                    null,
                    (sunPosition.z - cellHeight) / (sunPosition.x - cell.position.x),
                    null,
                    null,
                    null,
                    - cell.position.x,
                ),
            );

            const rayYHeightEquation: Equation = new Equation(null, null, cellHeight);
            rayYHeightEquation.addTerm(
                'y',
                new Term(
                    null,
                    (sunPosition.z - cellHeight) / (sunPosition.y - cell.position.y),
                    null,
                    null,
                    null,
                    - cell.position.y,
                ),
            );

            let cellLight: number = 1;
            let pathStep: number = 0;

            for (const position of rayPath) {
                const rayXHeight: number | Equation = rayXHeightEquation.resolve({ x: position.x });
                const rayYHeight: number | Equation = rayYHeightEquation.resolve({ y: position.y });

                if (rayXHeight instanceof Equation || rayYHeight instanceof Equation) {
                    throw Error('Error resolving ray height equations.');
                }

                let rayHeight: number = (rayXHeight + rayYHeight) / 2;

                if (sunPosition.x === cell.position.x) rayHeight = rayYHeight;
                if (sunPosition.y === cell.position.y) rayHeight = rayXHeight;

                if (rayHeight > 1) {
                    break;
                }

                if (rayHeight < grid.getCell(position).value.environment.height) {
                    cellLight = (rayPath.length - pathStep) / rayPath.length;
                }

                pathStep += 1;
            }

            cell.value.environment.light.intensity = roundToDp(cellLight, 3);
        },
    );

    return grid;
};
