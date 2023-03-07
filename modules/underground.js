//Auto Underground

if (!Autopoke) var Autopoke = {};

(function () {
	let AU = App.game.underground;

	Autopoke.underground = {

		interval: [],
		intervalFunction: function () {
			return setInterval(() => {
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
								if (AU.energy < this._minEnergy || Mine.rewardNumbers.length===0) {
									return
								}
								this.smartMine(x, y)
								
							}
						}
					}
					
					// mine random spots if the grid is done but the layer isn't
					let maxT=10;
					while (AU.energy >= this._minEnergy &&maxT--) {
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
				let maxT=10;
			while (Mine.grid[x][y]() > 0 && AU.energy >= Underground.CHISEL_ENERGY&&maxT--) {
				Mine.chisel(x, y);
			}
		}
		}
		},
		smartMine: function (x, y) {
			if(Mine.rewardNumbers.length===0) return;
			this.mine(x, y)
			const reward = Mine.rewardGrid[x][y];

	


			if(Mine.rewardNumbers.includes(reward.value)) {


				
				let X,Y,xsize,ysize;
				{
				const {x,y,sizeY,sizeX,rotations} = reward;
				[Y,X,xsize,ysize] = [
					[x, y,sizeX,sizeY],
					[sizeY - 1 - y, x,sizeY,sizeX],
					[y, sizeX - 1 - x,sizeY,sizeX],
					[sizeX - 1 - x, sizeY - 1 - y,sizeX,sizeY],
					
				  ][rotations % 4];
				}


				  for(var i =0;i<ysize;i++) {
					for(var j=0;j<xsize;j++) {
						if(Mine.rewardGrid[x-X+i][y-Y+j]!==0) {
							this.mine(x-X+i,y-Y+j);
						}
					}
				  }



			}

			



		},
		_potionArray: ['LargeRestore', 'MediumRestore', 'SmallRestore'],

		_minEnergy: 10,
		get minEnergy() {
			return this._minEnergy;
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
