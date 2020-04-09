export interface PositionType {
    x: number;
    y: number;
}

export interface Position3dType {
    x: number;
    y: number;
    z: number;
}

export interface NumberLimitsType {
    min?: number;
    max?: number;
}

export interface PositionLimitsType {
    x?: NumberLimitsType;
    y?: NumberLimitsType;
}

export interface DimensionsType {
    x: number;
    y: number;
}

export interface KeyedObject {
    [key: string]: any;
    [key: number]: any;
}

export interface StringKeyedObject {
    [key: string]: any;
}

export interface NumberKeyedObject {
    [key: number]: any;
}
