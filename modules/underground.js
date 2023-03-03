//Auto Underground

if (!Autopoke) var Autopoke = {};

(function () {
	let AU = App.game.underground;

	Autopoke.underground = {

		interval: [],
		intervalFunction: function () {
			return setInterval(() => {
				if (Mine.loadingNewLayer) {
					return;
				}
				if (this._useRestores) {
					for (let potion of this._potionArray) {
						while (player._itemList[potion]() > 0 && ((AU.energy + AU.calculateItemEffect(GameConstants.EnergyRestoreSize[potion])) <= AU.getMaxEnergy())) {
							ItemList[potion].use();
						}
					}
				}
				(function () {
					let starts = [{x: 1, y: 1}, {x: 0, y: 2}, {x: 2, y: 0}]
					for (let s of starts) {
						for (let y = s.y; y < Underground.sizeX; y += 3) { // these two are swapped so that y goes vertical and x goes horizontal
							for (let x = s.x; x < AU.getSizeY(); x += 3) {
								if (AU.energy < this._minEnergy) {
									return
								}
								this.smartMine(x, y)
							}
						}
					}
					// mine random spots if the grid is done but the layer isn't
					while (AU.energy >= this._minEnergy) {
						const x = Rand.intBetween(0, AU.getSizeY() - 1);
						const y = Rand.intBetween(0, Underground.sizeX - 1);
						this.smartMine(x, y);
					}
				}).bind(this)()
			}, this.intervalTime);
		},

		// for some reason X is down and Y is right
		mine: function (x, y) {
			if(Mine.grid[x]){
			if(Mine.grid[x][y]){
			while (Mine.grid[x][y]() > 0 && AU.energy >= Underground.CHISEL_ENERGY) {
				Mine.chisel(x, y);
			}
		}
		}
		},
		smartMine: function (x, y) {
			if(Mine.loadingNewLayer) return;
			this.mine(x, y)
			const reward = Mine.rewardGrid[x][y];

			function rotate(ls, N) {
				while (N--) {
					ls = ls[0].map((val, index) => ls.map(row => row[index]).reverse());
				}
				return ls
			}

			if (Mine.rewardNumbers.includes(reward.value)) {
				let space = Array.from(UndergroundItems.list.find(v => v.id === reward.value).space)
				if (space[0][0].rotations !== reward.rotations) {
					space = rotate(space, [0, 1, 3, 2].indexOf(reward.rotations))
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
		_potionArray: ['LargeRestore', 'MediumRestore', 'SmallRestore'],

		_minEnergy: 10,
		get minEnergy() {
			return this._intervalTime;
		},
		set minEnergy(val) {
			if (Number.isInteger(val)) {
				this._minEnergy = val;
			} else {
				console.log("That is not a valid number");
			}
		},

		_useRestores: false,
		get useRestores() {
			return this._useRestores;
		},
		set useRestores(val) {
			if (val === true || val === false) {
				this._useRestores = val;
			} else {
				console.log("Not true or false");
			}
		},
		_intervalTime: 1000,
		get intervalTime() {
			return this._intervalTime;
		},

		set intervalTime(val) {
			if (Number.isInteger(val)) {
				this._intervalTime = val;
				this.Start();
			} else {
				console.log("That is not a valid number");
			}
		},
		Start: function () {
			clearInterval(this.interval.pop());
			this.interval.push(this.intervalFunction());
		},

		Stop: function () {
			clearInterval(this.interval.pop());
		}
	};
})();