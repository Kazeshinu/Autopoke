//  Auto Breeding

if (!Autopoke) var Autopoke = {};

(function () {
  let AB = App.game.breeding;

  Autopoke.breeding = {
    interval: [],

    intervalFunction: function () {
      return setInterval(() => {
        if (AB.queueList().length === 0) {
          AB.hatchPokemonEgg(0);
          AB.hatchPokemonEgg(1);
          AB.hatchPokemonEgg(2);
          AB.hatchPokemonEgg(3);
        }
        if (
          AB.queueList().length <
            Math.min(this._maxQueueSlots, AB.queueSlots()) ||
          AB.hasFreeEggSlot()
        ) {
          let fossil = this.helpFunctions.nextFossil();
          if (
            this._priorityEgg &&
            (this.helpFunctions.nextEgg() ||
              (fossil &&
                !AB.eggList.find(
                  (f) => f().pokemon === GameConstants.FossilToPokemon[fossil]
                )))
          ) {
            if (AB.hasFreeEggSlot()) {
              if (this.helpFunctions.nextEgg()) {
                ItemList[this.helpFunctions.nextEgg(this._eggCaught)].use();
              } else if (fossil) {
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
              AB.addPokemonToHatchery(nextPokemon);
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

    _eggCaught: CaughtStatus.NotCaught,
    _priorityEgg: true,
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
