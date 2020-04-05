import { PositionType } from '@flowervolution/types';

/**
 * A class that represents a cell within the 2D Grid.
 *
 * @property value - The value of the cell.
 * @property position - The position of the cell in the grid.
 */
export class Cell<CellValueType> {
    value: CellValueType;
    position: PositionType;

    /**
     * The constructor for the Cell class.
     *
     * @param value - The value of the cell.
     * @param position - The position of the cell in the grid.
     */
    constructor(value: CellValueType, position: PositionType) {
        this.value = value;
        this.position = position;
    }
}
