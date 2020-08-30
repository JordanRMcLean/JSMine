//JSMine Templates

export const Templates = {

	header : (id, mine_icon) =>
				`<div id="${id}_ui">
					<select id="${id}_difficulty">
						<option value="beginner">Beginner (9x9)</option>
						<option value="intermediate">Intermediate (16x16)</option>
						<option value="advanced">Advanced (16x30)</option>
					</select>
					<input type="number" maxlength="2" id="${id}_rows" /> x
					<input type="number" maxlength="2" id="${id}_columns" />
					<input type="number" maxlength="3" id="${id}_mines" style="background-image:url(${mine_icon})" />
					<input type="button" value="New Game" id="${id}_newgame" />
				</div>`,

	body : (id) => `<div id="${id}_table"></div>`,

	footer : (id) =>
		`<div id="${id}_footer">
			Mines Left: <span id="${id}_minesleft"></span>
			<span id="${id}_time" style="float:right"></span>
		</div>`,

	mine : (img) => `<img src="${img}" />`,

	flag : (img) => `<img src="${img}" />`
	
}
