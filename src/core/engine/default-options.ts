import { GameOptionsType } from '@flowervolution/core/engine/types';

export const DEFAULT_OPTIONS: GameOptionsType = {
    animation: { time: 400, gap: 100, maxChunkSize: 32, chunkOverlap: 200 },
    debug: true,
    dom: { cellPxSpacing: 0 },
    grid: { size: 128 },
    seed: null,
    terrain: {
        equationTerms: 16,
        types: {
            empty: {
                fill: '#fff',
                fillOpacityRange: { min: 0.01, max: 1 },
                heightRange: { min: -1, max: -1 },
            },
            water: {
                fill: '#08f',
                fillOpacityRange: { min: 0.5, max: 1 },
                heightRange: { min: 0, max: 0.3 },
            },
            mud: {
                fill: '#420',
                fillOpacityRange: { min: 0.25, max: 1 },
                heightRange: { min: 0.3, max: 0.75 },
            },
            rock: {
                fill: '#888',
                fillOpacityRange: { min: 0.5, max: 1 },
                heightRange: { min: 0.75, max: 0.85 },
            },
            snow: {
                fill: '#fff',
                fillOpacityRange: { min: 0.75, max: 1 },
                heightRange: { min: 0.85, max: 1 },
            },
        },
    },
};
