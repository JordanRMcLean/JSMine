//JSMine Templates

export const Templates = {

    header : (id, mine_icon) =>
                `<div id="${id}_ui">
                    <select id="${id}_difficulty">
                        <option value="beginner">Beginner (9x9)</option>
                        <option value="intermediate">Intermediate (16x16)</option>
                        <option value="advanced">Advanced (16x30)</option>
                        <option value="custom">Custom</option>
                    </select>
                    <input type="button" value="New Game" id="${id}_newgame" />
                    <div id="${id}_options" style="display:none">
                        <input type="number" maxlength="2" id="${id}_rows" /> x
                        <input type="number" maxlength="2" id="${id}_columns" />
                        <input type="number" maxlength="3" id="${id}_mines" style="background-image:url(${mine_icon})" />
                    </div>
                </div>`,

    body : (id, mine_icon) => `<div id="${id}_table"></div>`,

    footer : (id, mine_icon, hiscore_template) =>
        `<div id="${id}_footer">
            <div style="float:right">
                <span id="${id}_minesleft"></span>
                <img src="${mine_icon}" />
            </div>
            ${hiscore_template}
        </div>`,

    hiscore : (id) =>
        `<div>
            HiScore: <span id="${id}_hiscore"></span>
            <br>
            <span id="${id}_time"></span>
        </div>`,

    mine : (img) => `<img src="${img}" />`,

    flag : (img) => `<img src="${img}" />`

}
