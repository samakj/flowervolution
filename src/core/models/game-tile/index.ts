export class GameTile {
    elementId?: string;
    height?: number;
    terrain?: string;
    terrainSpecificHeight?: number;

    constructor(elementId?: string, height?: number, terrain?: string) {
        this.elementId = elementId;
        this.height = height;
        this.terrain = terrain;
    }
}
