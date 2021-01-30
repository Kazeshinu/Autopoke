//Auto Underground
if (typeof Autopoke === 'undefined') {
	var Autopoke={}
}
if (typeof Autopoke.underground === 'undefined') {
	Autopoke.underground={}
}
Object.defineProperties(Autopoke.underground, {
	_intervalTime: {
		value:1000*App.game.underground.getEnergyRegenTime(),
		writable:true
	},
	intervalTime: {
		get:function() {
			return this._intervalTime;
		},
		set: function(val) {
			if (Number.isInteger(val)) {
				this._intervalTime=val;
				this.Stop();
				this.Start();
			}
			else {
				console.log("Not a int number");
			}
		}
	}	
});
// for some reason X is down and Y is right
Autopoke.underground.smartMine=function(x,y) {
	while (Mine.grid[x][y]() > 0&&App.game.underground.energy>=Underground.CHISEL_ENERGY) {
		Mine.chisel(x,y);
	}
	const reward = Mine.rewardGrid[x][y];
	if (Mine.rewardNumbers.includes(reward.value)) {		
		if (reward.revealed==1&&Mine.grid[Mine.normalizeY(x-1)][y]() > 0) {
			this.smartMine(Mine.normalizeY(x-1),y);
		}
		if (reward.revealed==1&&Mine.grid[Mine.normalizeY(x+1)][y]() > 0) {
			this.smartMine(Mine.normalizeY(x+1),y);
		}
		if (reward.revealed==1&&Mine.grid[x][Mine.normalizeX(y+1)]() > 0) {
			this.smartMine(x,Mine.normalizeX(y+1));
		}
		if (reward.revealed==1&&Mine.grid[x][Mine.normalizeX(y-1)]() > 0) {
			this.smartMine(x,Mine.normalizeX(y-1));
		}	
	}	
}
Autopoke.underground.intervalFunction = function() {
	return setInterval(() => {
		if (App.game.underground.energy >= App.game.underground.getMaxEnergy()-App.game.underground.getEnergyGain()) {
			while (App.game.underground.energy >= App.game.underground.getMaxEnergy()-App.game.underground.getEnergyGain()) {
				const x = GameConstants.randomIntBetween(0, App.game.underground.getSizeY() - 1);
				const y = GameConstants.randomIntBetween(0, Underground.sizeX - 1);
				this.smartMine(x,y);
			}
		}
	}, this.intervalTime);
}
Autopoke.underground.Start = function() {this.interval=this.intervalFunction();};
Autopoke.underground.Stop = function() {clearInterval(this.interval);}
Autopoke.underground.Start();