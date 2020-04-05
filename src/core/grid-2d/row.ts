import { Cell } from '@flowervolution/core/grid-2d/cell';

/**
 * A class to represent a row in the 2D Grid.
 *
 * @property y - The y position of the row in the grid.
 * @property cells - The list of cells in the row.
 */
export class Row<CellValueType> {
    y: number;
    cells: Cell<CellValueType>[];

    /**
     * The constructor for the Row class.
     *
     * @property y - The y position of the row in the grid.
     * @property cells - The list of cells in the row.
     */
    constructor(y: number, cells: Cell<CellValueType>[]) {
        this.y = y;
        this.cells = cells;
    }

    /**
     * Gets the cell in the specified column.
     *
     * @property x - The x position of the row in the grid.
     *
     * @returns The cell in the specified column.
     */
    getColumn(x: number): Cell<CellValueType> {
        return this.cells[x];
    }

    /**
     * Gets the value of the cell in the specified column.
     *
     * @property x - The x position of the row in the grid.
     *
     * @returns The value of the cell in the specified column.
     */
    getColumnValue(x: number): CellValueType {
        return this.cells[x].value;
    }
}
