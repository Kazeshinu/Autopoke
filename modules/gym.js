//Auto Gym

if (!Autopoke) var Autopoke = {};

(function () {

	Autopoke.gym = {

		interval: [],

		intervalFunction: function () {
			return setInterval(() => {
				if (this._runs === 1 && App.game.gameState !== 3) {
					clearInterval(this.interval.pop());
					this._dummyGym.leaderName = this._gym.leaderName;
					this._dummyGym.badgeReward = this._gym.badgeReward;					//To give correct Badge
					GymRunner.gymObservable(this._dummyGym);
				}
				if (this._runs > 1 && App.game.gameState === 6) {
					GymRunner.startGym(this._gym);
					this._runs--;
				}
			}, this.intervalTime);
		},
		_gym: {},
		_dummyGym: {
			badgeReward: 1,
			defeatMessage: "",
			leaderName: "Brock",
			moneyReward: 0,
			pokemons: [],
			requirements: [],
			town: "DummyTown"
		},
		_runs: 1,
		get runs() {
			return this._runs;
		},
		set runs(val) {
			if (Number.isInteger(val)) {
				this._runs = val;
			} else {
				console.log("That is not a valid number");
			}
		},

		_intervalTime: 100,

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
			this._runs = 1
		}

	};
	Autopoke.gym._gym = Autopoke.gym._dummyGym;
	GymRunner.gymObservable(Autopoke.gym._dummyGym);
	GymRunner.gymObservable.subscribe(function (newValue) {
		if (Autopoke.gym._gym === newValue) {
			return;
		}
		Autopoke.gym._gym = newValue;
		if (newValue.town !== "DummyTown") {
			Autopoke.gym.Start();
		}
	});
})();