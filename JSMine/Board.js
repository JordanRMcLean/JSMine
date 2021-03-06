// board.js for use within core.js
// creation of the DOM elements and UI game board.

import {Config} from './Config.js';
import {Templates} from './Templates.js';

export class Board {
    constructor(rows, columns, mines) {
        this.rows = rows;
        this.columns = columns;
        this.mines = mines;

        let holder = document.getElementById(Config.ID);
        if(!holder) {
            holder = document.createElement('div');
            holder.id = Config.ID;
            document.body.appendChild(holder);
        }
        this.holder = holder;
    }

    build_ui() {
        let id = Config.ID,
            header = Templates.header(id, Config.MINE_ICON),
            body = Templates.body(id, Config.MINE_ICON);

        //before building footer template we build HiScore
        let hiscore_template = Config.HISCORE ? Templates.hiscore(id) : '',
            footer = Templates.footer(id, Config.MINE_ICON, hiscore_template);

        this.mine_html = Templates.mine(Config.MINE_ICON);
        this.flag_html = Templates.flag(Config.FLAG_ICON);
        this.holder.innerHTML = header + body + footer;

        let hiscore = Config.SAVEFILE.hiscores[ Config.SAVEFILE.difficulty ],
            dif_selector = document.getElementById(id + '_difficulty');

        Config.HISCORE && this.add_game_time(hiscore, 1);
        dif_selector.value = Config.SAVEFILE.difficulty;

        //add event listener for difficulty changer
        dif_selector.addEventListener('change', e => {
            let difficulty = this.get_selected_difficulty(),
                options = document.getElementById(Config.ID + '_options');

            if(difficulty !== 'custom') {
                options.style.display = 'none';
                this.update_ui( ...Config.DIFFICULTIES[difficulty] );
                Config.HISCORE && this.add_game_time(Config.SAVEFILE.hiscores[ difficulty ], 1);
            }
            else {
                options.style.display = '';
            }
        });
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
        this.rows = rows;
        this.columns = columns;
        this.mines = mines;
    }

    update_mines(mines) {
        document.getElementById(Config.ID + '_minesleft').innerHTML = mines;
    }

    get_selected_difficulty() {
        return document.getElementById(Config.ID + '_difficulty').value;
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

    add_game_time(seconds, hiscore) {
        let text = this.format_time(seconds);

        if(hiscore) {
            document.getElementById(Config.ID + '_hiscore').innerHTML = text;
        }
        else {
            document.getElementById(Config.ID + '_time').innerHTML = text;
        }
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

    format_time(seconds) {
        let mins = Math.floor(seconds / 60) % 60,
            secs = Math.floor(seconds % 60);

        if(secs < 10) {
            secs = '0' + secs;
        }

        return `${mins}:${secs}s`;
    }
}
