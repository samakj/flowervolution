import { Cell } from '@flowervolution/core/data-structures/grid-2d/cell';
import { GameTile } from '@flowervolution/core/models/game-tile';
import { Grid2d } from '@flowervolution/core/data-structures/grid-2d';
import { GameOptionsType, TerrainType } from '@flowervolution/core/engine/types';

export const applyWaterLevelsToGrid2d = (grid: Grid2d<GameTile>, gameOptions: GameOptionsType): Grid2d<GameTile> => {
    grid.cells.forEach(
        (cell: Cell<GameTile>): void => {
            const options: TerrainType = gameOptions.terrain.types[cell.value.environment.terrain.type];
            cell.value.environment.water.salinity = options.getWaterSalinity(cell);
            cell.value.environment.water.saturation = options.getWaterSaturation(cell);
        },
    );

    return grid;
};
