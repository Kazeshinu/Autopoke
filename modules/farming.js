// Auto Farming

if (!Autopoke) Autopoke = {};

(function () {
	Autopoke.farming = {

		interval: [],

		intervalFunction: function () {
			return setInterval(() => {
				App.game.farming.harvestAll();
				App.game.farming.plantAll(this.berry.type);
			}, this.berry.growthTime[3] + this.intervalTime);
		},

		_berry: App.game.farming.berryData[BerryType.Cheri],

		get berry() {
			return this._berry;
		},
		set berry(val) {
			if (BerryType[val] !== undefined) {
				this._berry = App.game.farming.berryData[BerryType[val]];
				this.Start();
			} else {
				console.log("No berry with that name (Case sensitive)");
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