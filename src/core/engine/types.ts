import { PositionType } from '@flowervolution/types';

export interface RangeType {
    min: number;
    max: number;
}

export interface TerrainType {
    fill: string;
    fillOpacityRange: RangeType;
    heightRange: RangeType;
}

export interface GameOptionsType {
    animation?: { time?: number; gap?: number; maxChunkSize?: number; chunkOverlap?: number };
    debug?: boolean;
    dom?: { elementId?: string; cellPxSize?: number; cellPxSpacing?: number };
    grid?: { size?: number };
    seed?: number;
    terrain?: {
        equationTerms?: number;
        spread?: number;
        offset?: PositionType;
        types?: { [name: string]: TerrainType; empty: TerrainType };
    };
}
