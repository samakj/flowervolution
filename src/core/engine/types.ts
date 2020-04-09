import { PositionType } from '@flowervolution/types';
import { GameTile } from '@flowervolution/core/models/game-tile';
import { Cell } from '@flowervolution/core/data-structures/grid-2d/cell';

export interface RangeType {
    min: number;
    max: number;
}

export interface TerrainType {
    fill: string;
    fillOpacityRange: RangeType;
    heightRange: RangeType;
    getWaterSaturation: (cell: Cell<GameTile>) => number;
    getWaterSalinity: (cell: Cell<GameTile>) => number;
}

export interface GameOptionsType {
    animation?: { time?: number; gap?: number; maxChunkSize?: number; chunkOverlap?: number };
    debug?: {
        cellValueDisplay?: boolean;
        sunRay?: boolean;
    };
    dom?: { elementId?: string; cellPxSize?: number; cellPxSpacing?: number };
    grid?: { size?: number };
    seed?: number;
    terrain?: {
        equationTerms?: number;
        spread?: number;
        offset?: PositionType;
        types?: { [name: string]: TerrainType; empty: TerrainType, water: TerrainType };
    };
}
