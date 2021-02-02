// Auto Farming

if (!Autopoke) var Autopoke={};

(function() {
	const AutoFarming = {
		
		interval:[],
		
		intervalFunction: function() {
			return setInterval(() => {
				App.game.farming.harvestAll();
				App.game.farming.plantAll(this.berry.type);
			},this.berry.growthTime[3]+1);
		},

		_berry:App.game.farming.berryData[BerryType.Cheri],

		get berry() {
			return this._berry;
		},
		set berry(val) {
			if (BerryType[val]!==undefined) {
				this._berry=App.game.farming.berryData[BerryType[val]];
				clearInterval(this.interval);
				this.interval=this.intervalFunction();				
			}
			else {
				console.log("No berry with that name (Case sensitive)");
			}
		},
		
		_intervalTime: 1000,
		
		get intervalTime() {
			return this._intervalTime;
		},	
		
		set intervalTime(val) {
			if (Number.isInteger(val)) {
				this._intervalTime=val;
				this.Stop();
				this.Start();				
			}
			else {
				console.log("Not a whole number");				
			}			
		},
		Start: function() {clearInterval(this.interval.pop());this.interval.push(this.intervalFunction());},		
		
		Stop: function() {clearInterval(this.interval.pop());}
	}
	Autopoke.farming = AutoFarming;
})();