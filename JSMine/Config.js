// JSMine Settings

export const Config = {

    //Basic customizations
    ID: 'JSMine',
    HISCORE: true,

    //image sources
    MINE_ICON: '/JSMine/mine.png',
    FLAG_ICON: '/JSMine/flag.png',

    //Colours for numbered cells.
    COLORS: {
        1: 'blue',
        2: 'green',
        3: 'red',
        4: 'dark-blue',
        5: 'brown',
        6: 'purple',
        7: 'dark-green',
        8: 'orange'
    },

    // [height, width, mines]
    //adding a new difficulty here will also need adding within the templates.
    DIFFICULTIES: {
        beginner: [9, 9, 10],
        intermediate: [16, 16, 40],
        advanced: [16, 30, 99]
    },

    //cell states
    CELL_HIDDEN: 1,
    CELL_REVEALED: 2,
    CELL_EMPTY: 3,
    CELL_MINE: 4,

    //default values saved.
    SAVEFILE: {
        difficulty : 'beginner',
        hiscores : {
            beginner : 999999,
            intermediate : 999999,
            advanced : 999999
        }
    },

    //function for creating unique name for each cell on DOM and API.
    //In config as needs to be consistent throughout.
    CELL_ID: function(x, y) {
        return this.ID + '_cell_' + x + '_' + y;
    }
}
