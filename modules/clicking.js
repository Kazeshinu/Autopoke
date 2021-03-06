// Auto Clicking

if (!Autopoke) var Autopoke = {};

(function () {

	Autopoke.clicking = {

		interval: [],

		intervalFunction: function () {
			return setInterval(() => {
				switch (App.game.gameState) {
					case 2:
						Battle.clickAttack();
						break;
					case 3:
						GymBattle.clickAttack();
						break;
					case 4:
						DungeonBattle.clickAttack();
						break;
				}
			}, this.intervalTime);
		},
		get cps() {
			return 1000 / this._intervalTime;
		},
		set cps(val) {
			if (Number.isInteger(val)) {
				this._intervalTime = Math.floor(1000 / val);
				this.Start();
			} else {
				console.log("That is not a valid number");
			}
		},
		_intervalTime: 40,
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