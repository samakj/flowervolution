import { GameOptionsType } from '@flowervolution/core/engine/types';
import { roundToDp } from '@flowervolution/utils/round';
import { Cell } from '@flowervolution/core/data-structures/grid-2d/cell';
import { GameTile } from '@flowervolution/core/models/game-tile';

export const DEFAULT_OPTIONS: GameOptionsType = {
    animation: { time: 400, gap: 100, maxChunkSize: 32, chunkOverlap: 200 },
    debug: {
        cellValueDisplay: true,
        sunRay: false,
    },
    dom: { cellPxSpacing: 0 },
    grid: { size: 64 },
    seed: 1234,
    terrain: {
        equationTerms: 16,
        types: {
            empty: {
                fill: '#fff',
                fillOpacityRange: { min: 0.01, max: 1 },
                heightRange: { min: -1, max: -1 },
                getWaterSaturation: (): number => -1,
                getWaterSalinity: (): number => -1,
            },
            water: {
                fill: '#08f',
                fillOpacityRange: { min: 0.5, max: 1 },
                heightRange: { min: 0, max: 0.3 },
                getWaterSaturation: (): number => 1,
                getWaterSalinity: (): number => 1,
            },
            mud: {
                fill: '#420',
                fillOpacityRange: { min: 0.25, max: 1 },
                heightRange: { min: 0.3, max: 0.75 },
                getWaterSaturation: (cell: Cell<GameTile>): number => roundToDp(
                    1 - cell.value.environment.terrain.height,
                    3,
                ),
                getWaterSalinity: (cell: Cell<GameTile>): number => roundToDp(
                    (1 - cell.value.environment.terrain.height) ** 2,
                    3,
                ),
            },
            rock: {
                fill: '#888',
                fillOpacityRange: { min: 0.5, max: 1 },
                heightRange: { min: 0.75, max: 0.85 },
                getWaterSaturation: (): number => 0,
                getWaterSalinity: (): number => 0,
            },
            snow: {
                fill: '#fff',
                fillOpacityRange: { min: 0.75, max: 1 },
                heightRange: { min: 0.85, max: 1 },
                getWaterSaturation: (): number => 1,
                getWaterSalinity: (): number => 0,
            },
        },
    },
};
