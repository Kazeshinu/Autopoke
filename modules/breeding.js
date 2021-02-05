//  Auto Breeding

if (!Autopoke) var Autopoke = {};

(function () {

	const AutoBreeding = {

		interval: [],

		intervalFunction: function () {
			return setInterval(() => {
				if (App.game.breeding.queueList().length === 0) {
					App.game.breeding.hatchPokemonEgg(0);
					App.game.breeding.hatchPokemonEgg(1);
					App.game.breeding.hatchPokemonEgg(2);
					App.game.breeding.hatchPokemonEgg(3);

				}
				if ((App.game.breeding.queueList().length < Math.min(this._maxQueueSlots,App.game.breeding.queueSlots())) || App.game.breeding.hasFreeEggSlot()) {
					if (this._priorityEgg && this.helpFunctions.hasEgg()) {
						if (App.game.breeding.hasFreeEggSlot()) {
							ItemList[this.helpFunctions.nextEgg()].use();
						}
					}
					else {
						let nextPokemon = App.game.party.caughtPokemon.filter(
							partyPokemon => BreedingController.visible(partyPokemon)()
						)[0];
						if (nextPokemon) {
							App.game.breeding.addPokemonToHatchery(nextPokemon);
						}
					}
				}
			}, this.intervalTime);
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
		_maxQueueSlots:2,
		get maxQueueSlots() {
			return this._maxQueueSlots;
		},

		set maxQueueSlots(val) {
			if (Number.isInteger(val)) {
				this._maxQueueSlots = val;
			} else {
				console.log("Not a whole number");
			}
		},
		_priorityEgg:true,
		get prioritiseEggs() {
			return this._priorityEgg;
		},

		set prioritiseEggs(val) {
			if (val === true || val === false) {
				this._priorityEgg = val;
			} else {
				console.log("Use true or false");
			}
		},
		helpFunctions: {
			hasEgg: function () {
				let allowedEggs = GameHelper.enumStrings(GameConstants.EggItemType);
				return 0<allowedEggs.filter(X=>player.itemList[X]()>0).length;
			},
			nextEgg: function () {
				let allowedEggs = GameHelper.enumStrings(GameConstants.EggItemType);
				return allowedEggs.find(X=>player.itemList[X]()>0);
			}




		},


		Start: function () {
			clearInterval(this.interval.pop());
			this.interval.push(this.intervalFunction());
		},

		Stop: function () {
			clearInterval(this.interval.pop());
		}
	}
	Autopoke.breeding = AutoBreeding;
})();
