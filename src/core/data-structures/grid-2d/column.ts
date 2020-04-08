import { Cell } from '@flowervolution/core/data-structures/grid-2d/cell';

/**
 * A class to represent a column in the 2D Grid.
 *
 * @property x - The x position of the column in the grid.
 * @property cells - The list of cells in the row.
 */
export class Column<CellValueType> {
    x: number;
    cells: Cell<CellValueType>[];

    /**
     * The constructor for the Column class.
     *
     * @property x - The x position of the column in the grid.
     * @property cells - The list of cells in the row.
     */
    constructor(x: number, cells: Cell<CellValueType>[]) {
        this.x = x;
        this.cells = cells;
    }

    /**
     * Gets the cell in the specified row.
     *
     * @property y - The y position of the row in the grid.
     *
     * @returns The cell in the specified row.
     */
    getRow(y: number): Cell<CellValueType> {
        return this.cells[y];
    }

    /**
     * Gets the value of the cell in the specified row.
     *
     * @property y - The y position of the row in the grid.
     *
     * @returns The value of the cell in the specified row.
     */
    getRowValue(y: number): CellValueType {
        return this.cells[y].value;
    }
}
