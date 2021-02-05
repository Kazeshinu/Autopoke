//  Auto Breeding

if (!Autopoke) Autopoke = {};

(function () {
	Autopoke.breeding = {
		interval: [],

		intervalFunction: function () {
			return setInterval(() => {
				if (App.game.breeding.queueList().length === 0) {
					App.game.breeding.hatchPokemonEgg(0);
					App.game.breeding.hatchPokemonEgg(1);
					App.game.breeding.hatchPokemonEgg(2);
					App.game.breeding.hatchPokemonEgg(3);
				}
				if (
					App.game.breeding.queueList().length <
					Math.min(this._maxQueueSlots, App.game.breeding.queueSlots()) ||
					App.game.breeding.hasFreeEggSlot()
				) {
					if (
						this._priorityEgg &&
						(this.helpFunctions.nextEgg() || this.helpFunctions.nextFossil())
					) {
						if (App.game.breeding.hasFreeEggSlot()) {
							if (this.helpFunctions.nextEgg()) {
								ItemList[this.helpFunctions.nextEgg(this._eggCaught)].use();
							} else if (this.helpFunctions.nextFossil()) {
								let fossil = this.helpFunctions.nextFossil();
								Underground.sellMineItem(
									player.mineInventory().find((x) => x.name === fossil).id
								);
							}
						}
					} else {
						let nextPokemon = App.game.party.caughtPokemon.filter(
							(partyPokemon) => BreedingController.visible(partyPokemon)()
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
				console.log("That is not a valid number");
			}
		},
		_maxQueueSlots: 2,
		get maxQueueSlots() {
			return this._maxQueueSlots;
		},

		set maxQueueSlots(val) {
			if (Number.isInteger(val)) {
				this._maxQueueSlots = val;
			} else {
				console.log("That is not a valid number");
			}
		},
		_priorityEgg: true,
		_eggCaught: CaughtStatus.NotCaught,
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
			nextEgg: function (CaughtStatus = 0) {
				let allowedEggs = GameHelper.enumStrings(GameConstants.EggItemType);
				return allowedEggs.find(
					(X) =>
						player.itemList[X]() > 0 &&
						ItemList[X].getCaughtStatus() <= CaughtStatus
				);
			},
			nextFossil: function (CaughtStatus = 0) {
				return Object.keys(GameConstants.FossilToPokemon).find((f) =>
					player
						.mineInventory()
						.find(
							(i) =>
								i.name === f &&
								i.amount() &&
								PokemonHelper.calcNativeRegion(
									GameConstants.FossilToPokemon[f]
								) <= player.highestRegion() &&
								PartyController.getCaughtStatusByName(
									GameConstants.FossilToPokemon[f]
								) <= CaughtStatus
						)
				);
			},
		},

		Start: function () {
			clearInterval(this.interval.pop());
			this.interval.push(this.intervalFunction());
		},

		Stop: function () {
			clearInterval(this.interval.pop());
		},
	};
})();
