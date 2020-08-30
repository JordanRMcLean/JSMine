// game.js

import {Cell} from './Cell.js';
import {Config} from './Config.js';

export class Game {
    constructor(rows, columns, mines) {
        this.virtual_grid = {};
        this.started = false;
        this.finished = true;

        this.rows = rows;
        this.columns = columns;
        this.mines = mines;

        this.mines_left = mines;
        this.cells_left = (rows * columns) - mines;
    }

    start(first_cell) {
        if (this.started) {
            return;
        }

        this.started = true;
        this.finished = false;
        this.create_virtual_grid(first_cell);
        if (Config.TIMER) {
            this.game_start_time = new Date();
        }
    }

    //return incorrect flags, unrevealed mine locations and time. for deconstructing.
    end(lost) {
        this.finished = true;

        let return_obj = {
            incorrect_flags: [],
            unrevealed_mines: [],
            game_time: 0,
        };

        if (lost) {
            let cells = Object.values(this.virtual_grid);

            //reveal all incorrectly flagged mines
            return_obj.incorrect_flags = cells.filter(cell => cell.flagged && cell.state !== Config.CELL_MINE);
            return_obj.unrevealed_mines = cells.filter(cell => cell.state === Config.CELL_MINE && !cell.flagged);
        }

        //record the time. vs hiscore
        if (Config.TIMER) {
            let end = new Date();
			return_obj.game_time = (end - this.game_start_time) / 1000;
        }

		//TODO: Save the time to compare hiscore?

		return return_obj;
    }

    create_virtual_grid(first_cell) {
        let i = 0,
            j = 0;

        //fill our grid with normal/hidden cells
        for (; j < this.rows; j++) {

            for (let k = 0; k < this.columns; k++) {
                let cell = new Cell(j, k, Config.CELL_HIDDEN);
                this.virtual_grid[ Config.CELL_ID(j, k) ] = cell;
            }

        }

        //get the immune cells, aka the first clicked and its neighbours.
        let immune = [first_cell, ...this.get_cell_neighbours(first_cell)];

        //randomise the co-ordinates of the mines
        for (; i < this.mines; i++) {
            let row = Math.round(Math.random() * (this.rows - 1)),
                column = Math.round(Math.random() * (this.columns - 1)),
                cell = this.get_cell(row, column);

            //if this cell is already a mine, or immune, we must rewind and try again
            if (cell.state === Config.CELL_MINE || immune.indexOf(Config.CELL_ID(row, column)) >= 0) {
                --i;
                continue
            }

            cell.state = Config.CELL_MINE;
        }
    }

    get_cell_neighbours(cell) {
        if (typeof cell === 'string') {
            cell = this.virtual_grid[cell];
        }

        let row = cell.row,
            col = cell.column;

        let neighbours = [
            Config.CELL_ID(row - 1, col - 1), //North-west neighbour
            Config.CELL_ID(row - 1, col), //N
            Config.CELL_ID(row - 1, col + 1), //NE
            Config.CELL_ID(row, col - 1), //W
            Config.CELL_ID(row, col + 1), //E
            Config.CELL_ID(row + 1, col - 1), //SW
            Config.CELL_ID(row + 1, col), //S
            Config.CELL_ID(row + 1, col + 1) //SE
        ];

        return neighbours.filter(alias => alias in this.virtual_grid);
    }

    get_cell(alias, col = null) {
        if (col !== null) {
            alias = Config.CELL_ID(alias, col);
        }

        return this.virtual_grid[alias];
    }

}
