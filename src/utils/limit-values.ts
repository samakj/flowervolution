import { PositionLimitsType, NumberLimitsType, PositionType } from '@flowervolution/types';

export const limitNumber = (n: number, limits: NumberLimitsType): number => {
    let limitedNumber = n;

    if (typeof limits.max === 'number') {
        limitedNumber = Math.min(limits.max, limitedNumber)
    }
    if (typeof limits.min === 'number') {
        limitedNumber = Math.max(limits.min, limitedNumber)
    }

    return limitedNumber
};

export const limitPosition = (position: PositionType, limits: PositionLimitsType): PositionType => {
    let limitedPosition = position;

    if (limits.x) {
        limitedPosition.x = limitNumber(position.x, limits.x)
    }
    if (limits.y) {
        limitedPosition.y = limitNumber(position.y, limits.y)
    }

    return limitedPosition
};
