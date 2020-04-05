import { Cell } from '@flowervolution/core/grid-2d/cell';
import { DimensionsType, PositionType } from '@flowervolution/types';
import { Row } from '@flowervolution/core/grid-2d/row';
import { Column } from '@flowervolution/core/grid-2d/column';
import { CellValueGeneratorType } from '@flowervolution/core/grid-2d/types';

/**
 * A class that represents an 2 dimensional grid of dimensions specified on initialisation.
 *
 * @property cells - The list of cells contained within the grid.
 * @property dimensions - The number of cells in the x and y directions.
 * @property offset - The initial value to start x and y at.
 * @property spacing - The effective size of each cell.
 */
export class Grid2d<CellValueType> {
    cells: Cell<CellValueType>[];

    dimensions: DimensionsType;
    offset: PositionType;
    spacing: number;

    /**
     * The constructor for the Grid2d class.
     *
     * @param dimensions - The number of cells in the x and y directions.
     * @param offset - The initial value to start x and y at. Default = { x: 0, y: 0 }.
     * @param spacing - The effective size of each cell. Default = 1.
     * @param defaultCellValue - The default value of a cell. Default = undefined.
     */
    constructor(
        dimensions: DimensionsType,
        offset?: PositionType,
        spacing?: number,
        defaultCellValue?: CellValueType | CellValueGeneratorType<CellValueType>,
    ) {
        this.dimensions = dimensions;
        this.offset = offset || { x: 0, y: 0 };
        this.spacing = spacing || 1;
        this.cells = [];

        for (let y: number = 0; y < dimensions.y; y += 1) {
            for (let x: number = 0; x < dimensions.x; x += 1) {
                this.cells.push(
                    new Cell(
                        // @ts-ignore: Not picking up function check.
                        typeof defaultCellValue === 'function' ? defaultCellValue() : defaultCellValue,
                        {
                            x: x * this.spacing + this.offset.x,
                            y: y * this.spacing + this.offset.y,
                        },
                    ),
                );
            }
        }
    }

    /**
     * Generates a string representation of the table.
     *
     * @param cellLengthCap - Caps the width of each cell. Undefined or 0 means no cap.
     *
     * @returns The string representation of the table.
     */
    toString(cellLengthCap?: number): string {
        const rowStrLists: string[][] = [];
        let maxCellLength: number = 0;

        for (let y: number = 0; y < this.dimensions.y; y += 1) {
            const rowStrList: string[] = [];

            this.getRow(y).cells.forEach((cell: Cell<CellValueType>) => {
                // @ts-ignore: number type has toLocaleString method
                let cellStr: string =
                    typeof cell.value === 'number'
                        ? cell.value.toLocaleString()
                        : cell.value && cell.value.toString
                        ? cell.value.toString()
                        : `${cell.value}`;

                if (cellLengthCap && cellStr.length > cellLengthCap) {
                    cellStr = `${cellStr.slice(0, -3)}...`;
                }
                if (cellStr.length > maxCellLength) {
                    maxCellLength = cellStr.length;
                }

                rowStrList.push(cellStr);
            });

            rowStrLists.push(rowStrList);
        }

        let s: string = '\n';

        for (const rowStrList of rowStrLists) {
            for (const cellStr of rowStrList) {
                s += ' '.repeat(maxCellLength - cellStr.length + 1);
                s += cellStr;
            }
            s += '\n';
        }

        return s;
    }

    /**
     * Gets the cell at the provided position.
     *
     * @param position - The position of the cell to fetch.
     *
     * @returns The cell at the specified position.
     */
    getCell(position: PositionType): Cell<CellValueType> {
        return this.cells[position.x + position.y * this.dimensions.x];
    }

    /**
     * Gets the value of the cell at the provided position.
     *
     * @param position - The position of the cell to fetch.
     *
     * @returns The value of the cell at the specified position.
     */
    getCellValue(position: PositionType): CellValueType {
        return this.getCell(position).value;
    }

    /**
     * Sets the value of the cell at the provided position.
     *
     * @param position - The position of the cell to set.
     * @param value - The value to set the cell to.
     *
     */
    setCellValue(position: PositionType, value: CellValueType): void {
        this.getCell(position).value = value;
    }

    /**
     * Gets the row at the provided y value.
     *
     * @param y - The y value of the row to fetch.
     *
     * @returns The row at the specified y value.
     */
    getRow(y: number): Row<CellValueType> {
        return new Row(y, this.cells.slice(y * this.dimensions.x, (y + 1) * this.dimensions.x));
    }

    /**
     * Gets the column at the provided x value.
     *
     * @param x - The x value of the row to fetch.
     *
     * @returns The column at the specified x value.
     */
    getColumn(x: number): Column<CellValueType> {
        const cells: Cell<CellValueType>[] = [];

        for (let y: number = 0; y < this.dimensions.y; y += 1) {
            cells.push(this.cells[y * this.dimensions.x + x]);
        }

        return new Column(x, cells);
    }
}
