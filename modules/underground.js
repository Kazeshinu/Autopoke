//Auto Underground

if (!Autopoke) var Autopoke = {};

(function () {

	const AutoUnderground = {

		interval: [],
		intervalFunction: function () {
			return setInterval(() => {
				let UG = App.game.underground
				(function () {
					let starts = [{x: 1, y: 1}, {x: 0, y: 2}, {x: 2, y: 0}]
					for (let s of starts) {
						for (let y = s.y; y < Underground.sizeX; y += 3) { // these two are swapped so that y goes vertical and x goes horizontal
							for (let x = s.x; x < UG.getSizeY(); x += 3) {
								if (UG.energy < UG.getMaxEnergy() - UG.getEnergyGain()) {
									return
								}
								AutoUnderground.smartMine(x, y)
							}
						}
					}
					// mine random spots if the grid is done but the layer isn't
					while (UG.energy >= UG.getMaxEnergy() - UG.getEnergyGain() - 1) {
						const x = GameConstants.randomIntBetween(0, UG.getSizeY() - 1);
						const y = GameConstants.randomIntBetween(0, Underground.sizeX - 1);
						this.smartMine(x, y);
					}
				})()
			}, this.intervalTime);
		},

		// for some reason X is down and Y is right
		mine: function (x, y) {
			while (Mine.grid[x][y]() > 0 && App.game.underground.energy >= Underground.CHISEL_ENERGY) {
				Mine.chisel(x, y);
			}
		},
		smartMine: function (x, y) {
			this.mine(x, y)
			const reward = Mine.rewardGrid[x][y];

			function rotate(ls, N) {
				while (N--) {
					ls = ls[0].map((val, index) => ls.map(row => row[index]).reverse());
				}
			}

			if (Mine.rewardNumbers.includes(reward.value)) {
				let space = Array.from(UndergroundItem.list.find(v => v.id === reward.value).space)
				if (space[0][0].rotations !== reward.rotations) {
					rotate(space, Math.abs(reward.rotations - space[0][0].rotations))
				}
				let X, Y;
				for (let j = 0; j < space.length; j++) {
					for (let i = 0; i < space[0].length; i++) {
						if (reward.x === space[j][i].x && reward.y === space[j][i].y) {
							[X, Y] = [j, i]
						}
					}
				}
				for (let j = 0; j < space.length; j++) {
					for (let i = 0; i < space[0].length; i++) {
						if (space[j][i].value !== 0) {
							this.mine(x + j - X, y + i - Y)
						}
					}
				}
			}
		},

		_intervalTime: 1000 * App.game.underground.getEnergyRegenTime(),

		get intervalTime() {
			return this._intervalTime;
		},

		set intervalTime(val) {
			if (Number.isInteger(val)) {
				this._intervalTime = val;
				this.Start();
			} else {
				console.log("Not a whole number");
			}
		},
		Start: function () {
			clearInterval(this.interval.pop());
			this.interval.push(this.intervalFunction());
		},

		Stop: function () {
			clearInterval(this.interval.pop());
		}
	}
	Autopoke.underground = AutoUnderground;
})();