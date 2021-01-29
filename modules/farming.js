
// Auto Farming
if (typeof Autopoke === 'undefined') {
	var Autopoke={}
}
if (typeof Autopoke.farming === 'undefined') {
	Autopoke.farming={}
}
Object.defineProperties(Autopoke.farming, {
	_berry: {
		value:App.game.farming.berryData[BerryType.Cheri],
		writable: true
	},
	berry: {
		get:function() {
			return this._berry;
		},
		set: function(val) {
			if (BerryType[val]!=='undefined') {
				this._berry=App.game.farming.berryData[BerryType[val]];
				clearInterval(this.interval);
				this.interval=this.intervalFunction();				
			}
			else {
				console.log("No berry with that name (Case sensitive)");
			}
		}
	}
});
Autopoke.farming.intervalFunction = function() {
	return setInterval(() => {
		App.game.farming.harvestAll();
		App.game.farming.plantAll(this.berry.type);
	},this.berry.growthTime[3]+1);
}
Autopoke.farming.Start = function() {this.interval=this.intervalFunction();};
Autopoke.farming.Stop = function() {clearInterval(this.interval);}
Autopoke.farming.Start();