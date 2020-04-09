import { Grid2d } from '@flowervolution/core/data-structures/grid-2d';
import { GameTile } from '@flowervolution/core/models/game-tile';
import { Cell } from '@flowervolution/core/data-structures/grid-2d/cell';
import { GameOptionsType, TerrainType } from '@flowervolution/core/engine/types';
import { roundToDp } from '@flowervolution/utils/round';

export const applyTerrainTypesToGrid2d = (grid: Grid2d<GameTile>, gameOptions: GameOptionsType): Grid2d<GameTile> => {
    grid.cells.forEach((cell: Cell<GameTile>): void => {
        for (const name in gameOptions.terrain.types) {
            const options: TerrainType = gameOptions.terrain.types[name];

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

    return grid;
};
