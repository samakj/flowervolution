export class GameTile {
    elementId?: string;
    environment?: {
        height?: number;
        terrain?: {
            type?: string;
            height?: number;
        };
        light?: {
            intensity?: number;
        };
        water?: {
            saturation?: number;
            salinity?: number;
        };
    };

    constructor () {
        this.environment = { terrain: {}, light: {}, water: {} };
    }
}
