// cell.js
//for use within Core.js and Game.js only

export class Cell {
    constructor(row, column, state) {
        this.row = row;
        this.column = column;
        this.state = state;
        this.mines = 0;
        this.flagged = false;
    }
}
