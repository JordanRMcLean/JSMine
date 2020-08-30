// core.js
//require: Cell.js, Game.js, Board.js

import {Config} from './Config.js';
import {Cell} from './Cell.js';
import {Game} from './Game.js';
import {Board} from './Board.js';

class JSMine {
	constructor(id) {

		//TODO: load from localStorage to save difficulty?
		let start_difficulty = Config.DIFFICULTIES.beginner;

		//create first board.
		this._board = new Board(...start_difficulty);
		this._board.add_ui();

		//add event listener for new game UI
		document.getElementById(id + '_newgame').addEventListener('click', e => {
			this.new_game(
				+document.getElementById(id + '_rows').value,
				+document.getElementById(id + '_columns').value,
				+document.getElementById(id + '_mines').value
			)
		});

		this.new_game( ...start_difficulty );

		//TODO: if hiscore load hiscore and display?
	}

	new_game(rows, columns, mines) {
		if([rows, columns, mines].filter(i => typeof i === 'number').length !== 3) {
			return;
		}

		//validate mines, rows and columns
		let maximum_mines = (rows - 1) * (columns - 1);
		let minimum_mines = Math.round((rows * columns) * 0.1); //minimum mines is 10% of total cells.
		mines = Math.min(mines, maximum_mines);
		mines = Math.max(mines, minimum_mines);

		//minimum value of 5 and max of 100 for rows and columns.
		rows = Math.max(5, rows);
		rows = Math.min(100, rows);
		columns = Math.max(5, columns);
		columns = Math.min(100, columns);

		this._board.update_ui(rows, columns, mines);
		this._board.update_mines(mines);
		let cells = this._board.create_table(rows, columns);

		//delete any old instance of a game.
		delete this._game;
		this._game = new Game(rows, columns, mines);

		//add the event listeners to the cells.
		Array.from(cells).forEach(cell => {
			cell.addEventListener('click', e => {
				this.action_cell(cell.id, e)
			});

			cell.addEventListener('contextmenu', e => {
				e.preventDefault();
				this.flag_cell(cell.id, e)
			})
		})
	}

	finish_game(lost) {
		let { incorrect_flags, unrevealed_mines, game_time } = this._game.end(lost);

		//reveal incorrect flags.
		incorrect_flags.forEach(cell => {
			this._board.add_class(cell, 'incorrect');
		});

		//reveal unrevealed mines
		unrevealed_mines.forEach(cell => {
			this._board.reveal_cell(cell);
		})

		//add game time.
		if(game_time > 0) {
			let mins = Math.floor(game_time / 60) % 60,
				secs = Math.floor(game_time % 60);

			this._board.add_game_time(`${mins}:${secs}s`);

			if(Config.HISCORE) {
				//check if hi score and save. 
			}
		}

		//TODO: some sort of 'Won' animation
	}

	action_cell(cell) {
		if(!this._game || !this._game.started) {
			this._game.start(cell);
		}

		if(this._game.finished) {
			return;
		}

		if(typeof cell === 'string') {
			cell = this._game.get_cell(cell);
		}

		let neighbours = this._game.get_cell_neighbours(cell),
			surrounding_mines = 0,
			identified_mines = 0;

		//count the mines surrounding this cell.
		neighbours.forEach(neighbour_cell => {
			let cell = this._game.get_cell(neighbour_cell);

			if(cell.state === Config.CELL_MINE) {
				surrounding_mines++;
			}

			if(cell.flagged) {
				identified_mines++;
			}
		});

		//this cell has been flagged and now clicked on, so we remove the flag.
		if(cell.flagged) {
			return this.flag_cell(cell);
		}

		//now lets action the cell based on its current state
		switch(cell.state) {
			case Config.CELL_HIDDEN:
				cell.mines = surrounding_mines;
				cell.state = Config.CELL_REVEALED;
				this._board.reveal_cell(cell);
				this._game.cells_left--;

				//this cell has no mines around it and therefore is empty... reveal all its neighbours
				if(surrounding_mines === 0) {
					cell.state = Config.CELL_EMPTY;
					neighbours.forEach(neighbour => {
						this.action_cell(neighbour);
					});
				}

				//all cells have been revealed with no mines hit. Game won
				if(this._game.cells_left <= 0) {
					this.finish_game();
				}
				break;

			case Config.CELL_REVEALED:
				//If a cell has already been revealed, technically nothing to do, however...
				//this provides the shortcut by which when you click a revealed cell which you have already flagged all its mines
				//the unrevealed cells around it will be revealed. Good for speed.
				if(identified_mines >= surrounding_mines) {
					neighbours.forEach(neighbour => {
						let cell = this._game.get_cell(neighbour);

						//if its a hidden cell, or a mine and has not been flagged, reveal it
						if(cell.state === Config.CELL_HIDDEN || cell.state === Config.CELL_MINE) {
							if( !cell.flagged ) {
								this.action_cell(cell);
							}
						}

					});
				}
				break;

			case Config.CELL_MINE:
				//if this mine hasn't been flagged... uh oh you just clicked a mine.
				if( !cell.flagged ) {
					this._board.reveal_cell(cell);
					this.finish_game(true);
				}
		}
	}

	flag_cell(cell) {
		//if the game hasn't started, do nothing
		if(this._game.finished || !this._game.started) {
			return;
		}

		if(typeof cell === 'string') {
			cell = this._game.get_cell(cell);
		}

		if(cell.state === Config.CELL_HIDDEN || cell.state === Config.CELL_MINE) {
			cell.flagged = !cell.flagged;
			this._board.flag(cell);
			cell.flagged ? --this._game.mines_left : this._game.mines_left++;
		}

		this._board.update_mines(this._game.mines_left);
	}

}

JSMine = new JSMine(Config.ID);
