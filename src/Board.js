// board.js for use within core.js
// creation of the DOM elements and UI game board.

//TODO: update dynamic difficulties creation.

import {Config} from './Config.js';

export class Board {
	constructor(rows, columns, mines) {
		this.rows = rows;
		this.columns = columns;
		this.mines = mines;
		this.mine_html = '<img src="' + Config.MINE_ICON + '" />';
		this.flag_html = '<img src="' + Config.FLAG_ICON + '" />';
	}

	add_ui() {
		if(!this.holder) {
			this.holder = document.getElementById(Config.ID);
		}

		let id = Config.ID;

		//urgh so ugly.
		let html = `<div id="${id}_ui">
						<select id="${id}_difficulty">
							<option value="beginner">Beginner (9x9)</option>
							<option value="intermediate">Intermediate (16x16)</option>
							<option value="advanced">Advanced (16x30)</option>
						</select>
						<input type="number" maxlength="2" id="${id}_rows" /> x
						<input type="number" maxlength="2" id="${id}_columns" />
						<input type="number" maxlength="3" id="${id}_mines" style="background-image:url(${Config.MINE_ICON})" />
						<input type="button" value="New Game" id="${id}_newgame" />
					</div>
					<div id="${id}_table"></div>
					<div id="${id}_footer">Mines Left: <span id="${id}_minesleft"></span>
						<span style="float:right">
							<span id="${id}_time"></span>
						</span>
					</div>`;

		this.holder.innerHTML = html;
	}

	create_table(rows, columns) {
		if(!this.table) {
			this.table = document.getElementById(Config.ID + '_table');
		}

		let html = '<table>',
			i = 0;

		for(; i < rows; i++) {
			html += '<tr>';

			for(let j = 0; j < columns; j++) {
				html += '<td id="' + Config.CELL_ID(i, j) + '"></td>';
			}

			html += '</tr>'
		}

		//preload our icons.
		html += `</table>`;

		this.table.innerHTML = html;

		return this.table.getElementsByTagName('td');
	}

	update_ui(rows, columns, mines) {
		document.getElementById(Config.ID + '_rows').value = rows;
		document.getElementById(Config.ID + '_columns').value = columns;
		document.getElementById(Config.ID + '_mines').value = mines;
	}

	update_mines(mines) {
		document.getElementById(Config.ID + '_minesleft').innerHTML = mines;
	}

	//this does not action a cell, simply only reveals it. ALl other actions must take part elsewhere.
	reveal_cell(cell) {
		let cell_id = Config.CELL_ID(cell.row, cell.column)
		, dom_cell = document.getElementById(cell_id);

		if(cell.state === Config.CELL_MINE) {
			this.add_class(cell_id, 'exploded');
			dom_cell.innerHTML = this.mine_html;
		}
		else {
			this.add_class(cell_id, 'revealed');
			if(cell.mines > 0) {
				dom_cell.innerHTML = this.color_cell(cell.mines);
			}
		}
	}

	flag(cell) {
		let cell_id = Config.CELL_ID(cell.row, cell.column)
		, dom_cell = document.getElementById(cell_id);

		if(cell.flagged) {
			dom_cell.innerHTML = this.flag_html;
		}
		else {
			dom_cell.innerHTML = '';
		}
	}

	add_game_time(text) {
		document.getElementById(Config.ID + '_time').innerHTML = text;
	}

	add_class(cell, classname) {
		if(typeof cell !== 'string') {
			cell = Config.CELL_ID(cell.row, cell.column);
		}

		document.getElementById(cell).className = Config.ID + '-' + classname;
	}

	color_cell(number) {
		return '<span style="color: ' + Config.COLORS[number] + '">' + number + '</span>';
	}
}
