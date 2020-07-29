// Javascript Minesweeper Application

(function () {
	
	//settings
	const ID = 'JSMine',
		timer = true,
		hiscore = true,
		mine_icon = 'src/mine.png',
		flag_icon = 'src/flag.png',
		colors = {
			1: 'blue',
			2: 'green',
			3: 'red', 
			4: 'dark-blue',
			5: 'brown',
			6: 'purple',
			7: 'dark-green',
			8: 'orange',
			9: 'dark-red'
		},
		difficulties = {
			beginner : [9, 9, 10],
			intermediate : [16, 16, 40],
			advanced : [16, 30, 99]
		};
	
	
	//define our cell states
	const HIDDEN = 1,
		REVEALED = 2,
		EMPTY = 3,
		MINE = 4;
	
	//cell object
	function Cell(row, column, state) {
		this.row = row;
		this.column = column;
		this.state = state; 
		this.mines = 0;
		this.flagged = false;
		this.alias = get_alias(row, column);
		this.DOM = document.getElementById(this.alias);
		this.add_class = function(classname) {
			this.DOM.className = ID + '-' + classname;
		}
	}
	
	//our main controller object
	const app = {
		VIRTUAL_GRID: {},
		ROWS: 9,
		COLUMNS: 9,
		MINES: 10,
		FLAGGED: 0,
		CELLS_LEFT: 71, //(9*9)-10
		MINES_LEFT: 10,
		STARTED: false,
		FINISHED: false,
		GAME_START_TIME : 0,
		FLAG_HTML: `<img src="${flag_icon}" />`,
		MINE_HTML: `<img src="${mine_icon}" />`
	};
	
	//init loading of UI, not init the game. 
	app.init = function() {	
		if(!this.HOLDER) {
			this.HOLDER = document.getElementById(ID);
		}
		
		//urgh so ugly.
		let html = `<div id="${ID}_ui">
						<select id="${ID}_difficulty">
							<option value="beginner">Beginner (9x9)</option>
							<option value="intermediate">Intermediate (16x16)</option>
							<option value="advanced">Advanced (16x30)</option>
						</select> 
						<input type="number" maxlength="2" id="${ID}_height" value="${this.ROWS}" /> x
						<input type="number" maxlength="2" id="${ID}_width" value="${this.COLUMNS}" />
						<input type="number" maxlength="3" id="${ID}_mines" value="${this.MINES}" style="background-image:url(${mine_icon})" />
						<input type="button" value="New Game" id="${ID}_newgame" />		
					</div>
					<div id="${ID}_table"></div>
					<div id="${ID}_footer">Mines Left: <span id="${ID}_minesleft"></span>
						<span style="float:right">
							<span id="${ID}_time"></span>
						</span>
					</div>`;
		
		this.HOLDER.innerHTML = html;
		
		//add event listener for new game UI
		document.getElementById(ID + '_newgame').addEventListener('click', e => {
			this.new_game(
				+document.getElementById(ID + '_height').value,
				+document.getElementById(ID + '_width').value,
				+document.getElementById(ID + '_mines').value
			)
		});
		
		//add event listener to difficulty ui
		document.getElementById(ID + '_difficulty').addEventListener('change', e => {
			let difficulty = document.getElementById(ID + '_difficulty').value;
			update_ui( ...difficulties[difficulty] )
		});
		
		//set up a new game
		this.new_game(this.ROWS, this.COLUMNS, this.MINES);
	};
	
	//load new game with new settings
	app.new_game = function(rows, columns, mines) {
		if([rows, columns, mines].filter(i => typeof i === 'number').length !== 3) {
			return;
		}
		
		//validate the options, setting a minimum and maximum for all options.
		
		let maximum_mines = (rows - 1) * (columns - 1),
			minimum_mines = Math.round((rows * columns) * 0.1); //minimum mines is 10% of total cells.
		mines = Math.min(mines, maximum_mines);
		mines = Math.max(mines, minimum_mines);
		
		//minimum value of 5 and mmax of 100 for rows and columns.
		rows = Math.max(5, rows);
		rows = Math.min(100, rows);
		
		columns = Math.max(5, columns);	
		columns = Math.min(100, columns);
		
		//reset our flags
		this.STARTED = false;
		this.FINISHED = false;
		this.ROWS = rows;
		this.COLUMNS = columns;
		this.MINES = mines;
		
		update_ui(rows, columns, mines);
		update_mines(this.MINES);
		
		//create the grid.
		if(!this.TABLE) {
			this.TABLE = document.getElementById(ID + '_table');
		}
		
		this.TABLE.innerHTML = create_table(rows, columns);
		
		let cells = this.TABLE.getElementsByTagName('td');
		
		//add our click handlers to each cell
		Array.from(cells).forEach(cell => {	
			cell.addEventListener('click', e => {
				this.action_cell(cell, e) 
			});
			
			cell.addEventListener('contextmenu', e => {
				e.preventDefault();
				this.flag_cell(cell, e)
			})
		})
	}
	
	//actually start the game, would be performed when clicking the first cell.
	app.start_game = function(first) {
		
		//empty the virtual grid of any old games/cells
		this.VIRTUAL_GRID = {}; 		
		this.STARTED = true;
		this.CELLS_LEFT = (this.ROWS * this.COLUMNS) - this.MINES;
		this.MINES_LEFT = this.MINES;
		this.create_virtual_grid(this.ROWS, this.COLUMNS, this.MINES, first);
		
		if(timer) {
			this.GAME_START_TIME = new Date();
		}
	};
	
	app.end_game = function(lost) {
		this.FINISHED = true;
		
		if(lost) {		
			let cells = Object.values(this.VIRTUAL_GRID);
			
			//reveal all incorrectly flagged mines
			cells.filter(cell => cell.flagged && cell.state !== MINE).forEach(cell => {
				cell.add_class('incorrect');
			});
			
			//reveal all non-flagged mines mines.
			cells.filter(cell => cell.state === MINE && !cell.flagged).forEach(cell => {
				cell.DOM.innerHTML = this.MINE_HTML;
			})
		}
		else {
			
			//record the time. vs hiscore
			if(timer) {
				let end = new Date(),
					diff = (end - this.GAME_START_TIME) /1000,
					mins = Math.floor(diff / 60) % 60,
					secs = Math.floor(diff % 60);
				
				document.getElementById(ID + '_time').innerHTML = `${mins}:${secs}s`;
			}
			
		}
		
		if(hiscore) {
			//localStorage of hiscore?
		}	
	};
	
	//creates all the data for each cell. Created on first click
	app.create_virtual_grid = function(rows, columns, mines, first) {
		let i = 0,
			j = 0;
		
		//fill our grid with normal/hidden cells
		for(; j < rows; j++) {
			for(let k = 0; k < columns; k++) {
				let cell = new Cell(j, k, HIDDEN);
				this.VIRTUAL_GRID[cell.alias] = cell; 
			}
		}
		
		//get the immune cells, aka the first clicked and its neighbours.
		let immune = [first, ...this.get_cell_neighbours(first)];	
		
		//randomise the co-ordinates of the mines
		for(; i < mines; i++) {
			let row = Math.round(Math.random() * (rows - 1)),
				column = Math.round(Math.random() * (columns - 1)),
				cell = this.VIRTUAL_GRID[ get_alias(row, column) ];
				
			//if this cell is already a mine, or immune, we must rewinds and try again
			if(cell.state === MINE || immune.indexOf(cell.alias) >= 0) {
				--i;
				continue
			}
			
			this.cell(cell, 'state', MINE);
		}
	};
	
	//returns an array of aliases of the cells surrounding a cell.
	app.get_cell_neighbours = function(cell) {
		if(typeof cell === 'string') {
			cell = this.VIRTUAL_GRID[cell];
		}
		
		if(!cell || !cell.alias || !(cell.alias in this.VIRTUAL_GRID)) {
			return [];
		}
		
		let row = cell.row,
			col = cell.column;
		
		let neighbours = [
			get_alias(row - 1, col - 1), //North-west neighbour
			get_alias(row - 1, col), //N 
			get_alias(row - 1, col + 1) ,//NE
			get_alias(row, col - 1), //W
			get_alias(row, col + 1), //E
			get_alias(row + 1, col - 1), //SW
			get_alias(row + 1, col), //S
			get_alias(row + 1, col + 1) //SE
		];
		
		return neighbours.filter(alias => alias in this.VIRTUAL_GRID);
	}
	
	//handler for when a cell is clicked on.
	app.action_cell = function(DOMcell) {
		if(typeof DOMcell === 'string') {
			DOMcell = this.VIRTUAL_GRID[DOMcell].DOM;
		}
		
		//if game is finished, ignore.
		if(this.FINISHED) {
			return;
		}
		
		//if this is the first click of the game then we need to start the game. 
		if(!this.STARTED) {
			this.start_game(DOMcell.id);
		}
		
		let virtual_cell = this.VIRTUAL_GRID[DOMcell.id],
			neighbours = this.get_cell_neighbours(virtual_cell),
			surrounding_mines = 0,
			identified_mines = 0;
		
		if(!virtual_cell) {
			return;
		}
		
		//count the mines surrounding this cell.
		neighbours.forEach(neighbour_cell => {
			
			let cell = this.VIRTUAL_GRID[neighbour_cell];
			
			if(cell.state === MINE) {
				surrounding_mines++;
			}
			
			if(cell.flagged) {
				identified_mines++;
			}
		})
		
		//this cell has been flagged and now clicked on, so we remove the flag.
		if(virtual_cell.flagged) {
			this.flag_cell(DOMcell);
			return;
		}
		
		//now lets action the cell based on its current state
		switch(virtual_cell.state) {
				
			//hidden cell clicked on needs to be revealed.
			case HIDDEN:
				virtual_cell.add_class('revealed');
				this.CELLS_LEFT--;
				
				//this cell has mines around it
				if(surrounding_mines > 0) {
					this.cell(virtual_cell, {
						state : REVEALED,
						MINES : surrounding_mines
					});
					DOMcell.innerHTML = get_color(surrounding_mines);
				}
				else {
					
					//this cell doesnt have any mines around it so it is empty and we move on to its neihgbours.
					this.cell(virtual_cell, 'state', EMPTY);
					neighbours.forEach(neighbour => {
						this.action_cell(neighbour);
					});
					
				}
				
				//all cells have been revealed with no mines hit. Game won
				if(this.CELLS_LEFT <= 0) {
					this.end_game();
				}
				
				break;
			
			//if its already been revealed, then we check how many flags are surrounding it and reveal the hidden
			case REVEALED:
				
				//check that the number of flags around this cell matches the number of mines.
				if(identified_mines >= surrounding_mines) {
					neighbours.forEach(neighbour => {
						let neighbour_state = this.cell(neighbour);
						
						//if its a hidden cell, or a mine and has not been flagged, reveal it
						if(neighbour_state === HIDDEN || neighbour_state === MINE) {
							if( !this.cell(neighbour, 'flagged') ) {
								this.action_cell(neighbour);
							}
						}
						
					});
				}
				
				break;
				
				
			case MINE:
				//if this mine hasn't been flagged
				if( !virtual_cell.flagged ) {
					DOMcell.innerHTML = this.MINE_HTML;
					virtual_cell.add_class('exploded');
					this.end_game(true);
				}
				
				break;
				
			case EMPTY:
				
				break;
		}
		
	}
	
	app.flag_cell = function(DOMcell) {
		//if the game hasn't started, do nothing
		if(this.FINISHED || !this.STARTED) {
			return;
		}
		
		if(typeof DOMcell === 'string') {
			DOMcell = this.VIRTUAL_GRID[DOMcell].DOM;
		}
		
		let virtual_cell = this.VIRTUAL_GRID[DOMcell.id];
		
		//has to be a hidden cell or a mine cell to be flagged. 
		if(virtual_cell && [MINE, HIDDEN].indexOf(virtual_cell.state) !== -1) {
			
			//this cell has already been flagged so we'll unflag it
			if( virtual_cell.flagged ) {
				DOMcell.innerHTML = '';
				this.cell(virtual_cell, 'flagged', false)
				this.MINES_LEFT++; 
				this.FLAGGED--;
			}
			else {
				DOMcell.innerHTML = this.FLAG_HTML; 
				this.cell(virtual_cell, 'flagged', true);
				this.MINES_LEFT--;
				this.FLAGGED++;
			}

			update_mines(this.MINES_LEFT);
			
		}
	}
	
	//get/set a cells property. Or multiple properties with an obj. By default returns state. 
	app.cell = function(cell, key = 'state', value = null) {
		if(typeof cell === 'string') {
			cell = this.VIRTUAL_GRID[cell];
		}
		
		if(typeof key === 'string') {
			if(value === null) {
				return this.VIRTUAL_GRID[cell.alias][key]
			}
			else {
				this.VIRTUAL_GRID[cell.alias][key] = value;
			}
		}
		else {
			//object of key/value pairs
			for(let prop in key) {
				this.cell(cell, prop, key[prop])
			}
		}
	}
	
	function update_mines(mines) {
		document.getElementById(ID + '_minesleft').innerHTML = mines;
	}
	
	function update_ui(rows, columns, mines) {
		document.getElementById(ID + '_height').value = rows;
		document.getElementById(ID + '_width').value = columns;
		document.getElementById(ID + '_mines').value = mines;
	}
	
		//wrapped in a function for consistency and easy edit
	function get_alias(row, column) {
		return ID + '_cell_' + row + '_' + column; 
	}
	
	function get_color(num) {
		return '<span style="color: ' + colors[num] + '">' + num + '</span>';
	}
	
	function create_table(height, width) {
		let html = '<table>',
			i = 0;
		
		for(; i < height; i++) {
			html += '<tr>';
			
			for(let j = 0; j < width; j++) {
				let cell_alias = get_alias(i, j);
				html += '<td id="' + cell_alias + '"></td>';
			}
			
			html += '</tr>'
		}
		
		//preload our icons.
		html += `</table><div style="display:none"><img src="${flag_icon}"><img src="${mine_icon}"></div>`;
		
		return html;
		
	}
	
	window.parent[ID] = window[ID] = app; 
	
})();