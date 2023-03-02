//  Auto Breeding

if (!Autopoke) var Autopoke = {};


	//Create Breeding UI
	(function () {
		let breedContainer=document.getElementById("breedingDisplay");
		let elem = document.createElement("div");
		elem.id="kazeBreedUI";
		elem.innerHTML=`<button id="kazeBreedUIButton" class="btn btn-sm btn-danger " style="
    position: absolute;
    top: 0px;
    height: 41px;
    left: 0px;
    font-size: 8pt;
    width: 60px;">
    Auto [<span style="
    line-height: 0;
">OFF</span>]</button>
		`;
		breedContainer.insertBefore(elem,breedContainer.firstChild);



	})();

(function () {
  let AB = App.game.breeding;

  Autopoke.breeding = {
    interval: null,

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

		isRunning: false,
		Start: function () {
			if(this.interval) 
				clearInterval(this.interval);
		    this.isRunning=true;
			let button = document.getElementById('kazeBreedUIButton');
			button.classList.remove("btn-danger");
			button.classList.add("btn-success");
			button.children[0].innerHTML="ON";
			this.interval = this.intervalFunction();
		},
		Stop: function () {
			if(this.interval) {
			clearInterval(this.interval);
			this.isRunning=false;
			this.interval=null;
			let button = document.getElementById('kazeBreedUIButton');
			button.classList.remove("btn-success");
			button.classList.add("btn-danger");
			button.children[0].innerHTML="OFF";
			}
		},
  };
})();
let button = document.getElementById('kazeBreedUIButton');

function handleClick() {
  if(Autopoke.breeding.isRunning) {

	Autopoke.breeding.Stop();
  }
  else {
	Autopoke.breeding.Start();
  }
}

button.addEventListener('click', handleClick);