import { Equation } from '@flowervolution/core/equation';
import { Grid2d } from '@flowervolution/core/grid-2d';
import { PositionType } from '@flowervolution/types';

export const appendHeight2dGrid = (
    equation: Equation,
    grid: Grid2d<{[key: string]: any}>,
    initialOffset?: PositionType,
): Grid2d<{[key: string]: any}> => {
    const offset: PositionType = {
        x: initialOffset && initialOffset.x || 0,
        y: initialOffset && initialOffset.y || 0,
    };
    let maxCellHeight: number = null;
    let minCellHeight: number = null;

    // Get value for cell.
    for (const cell of grid.cells) {
        const cellHeight: number | Equation = equation.resolve(
            {
                x: cell.position.x + offset.x,
                y: cell.position.y + offset.y,
            },
        );

        if (typeof cellHeight !== 'number') {
            throw EvalError('Something went wrong in resolving the height equation.');
        }

        if (!maxCellHeight || cellHeight > maxCellHeight) maxCellHeight = cellHeight;
        if (!minCellHeight || cellHeight < minCellHeight) minCellHeight = cellHeight;

        cell.value.height = cellHeight;
    }

    // Normalise cell heights between 0 and 1.
    for (const cell of grid.cells) {
        cell.value.height = (cell.value.height - minCellHeight) / (maxCellHeight - minCellHeight);
    }

    return grid;
};
