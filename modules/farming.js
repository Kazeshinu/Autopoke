// Auto Farming

if (!Autopoke) var Autopoke = {};

(function () {
	let AF = App.game.farming;

	Autopoke.farming = {

		interval: [],

		intervalFunction: function () {
			return setInterval(() => {
				AF.harvestAll();
				AF.plantAll(this.berry.type);
			}, this.berry.growthTime[3] + this.intervalTime);
		},

		_berry: AF.berryData[BerryType.Cheri],

		get berry() {
			return this._berry;
		},
		set berry(val) {
			if (BerryType[val] !== undefined) {
				this._berry = AF.berryData[BerryType[val]];
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