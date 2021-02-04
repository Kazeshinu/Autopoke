//Auto Underground

if (!Autopoke) var Autopoke = {};

(function () {

	const AutoUnderground = {

		interval: [],
		intervalFunction: function () {
			return setInterval(() => {
				
				if (Mine.loadingNewLayer == true) {
					return;
				}
				
				if (this._useRestores) {
				let potionArray=['LargeRestore','MediumRestore','SmallRestore'];
				for (var i = 0;i<potionArray.length;i++) {
					let potion = potionArray[i];
					while (player._itemList[potion]()>0&&((App.game.underground.energy+App.game.underground.calculateItemEffect(GameConstants.EnergyRestoreSize[potion]))<=App.game.underground.getMaxEnergy())) {
						ItemList[potion].use();

						
					}
				}
				}
				
				while (App.game.underground.energy >= App.game.underground.getMaxEnergy() - App.game.underground.calculateItemEffect(GameConstants.EnergyRestoreSize["SmallRestore"])) {
					const x = GameConstants.randomIntBetween(0, App.game.underground.getSizeY() - 1);
					const y = GameConstants.randomIntBetween(0, Underground.sizeX - 1);
					this.smartMine(x, y);
				}
			}, this.intervalTime);
		},

		// for some reason X is down and Y is right
		smartMine: function (x, y) {
			while (Mine.grid[x][y]() > 0 && App.game.underground.energy >= Underground.CHISEL_ENERGY) {
				Mine.chisel(x, y);
			}
			const reward = Mine.rewardGrid[x][y];
			if (Mine.rewardNumbers.includes(reward.value)) {
				if (reward.revealed === 1 && Mine.grid[Mine.normalizeY(x - 1)][y]() > 0) {
					this.smartMine(Mine.normalizeY(x - 1), y);
				}
				if (reward.revealed === 1 && Mine.grid[Mine.normalizeY(x + 1)][y]() > 0) {
					this.smartMine(Mine.normalizeY(x + 1), y);
				}
				if (reward.revealed === 1 && Mine.grid[x][Mine.normalizeX(y + 1)]() > 0) {
					this.smartMine(x, Mine.normalizeX(y + 1));
				}
				if (reward.revealed === 1 && Mine.grid[x][Mine.normalizeX(y - 1)]() > 0) {
					this.smartMine(x, Mine.normalizeX(y - 1));
				}
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
				console.log("Not a whole number");
			}
		},
		
		_useRestores: true,
		
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