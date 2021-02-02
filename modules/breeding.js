//  Auto Breeding

if (!Autopoke) var Autopoke={};

(function() {
	
	const AutoBreeding = {
		
		interval=[],
		
		intervalFunction: function() {
			return setInterval(() => {
				if(!App.game.breeding.queueSlots()){
					App.game.breeding.hatchPokemonEgg(0);
					App.game.breeding.hatchPokemonEgg(1);
					App.game.breeding.hatchPokemonEgg(2);
					App.game.breeding.hatchPokemonEgg(3);
				}
				if(App.game.breeding.hasFreeQueueSlot()||App.game.breeding.hasFreeEggSlot()) {
					var nextPokemon = App.game.party.caughtPokemon.filter(
							partyPokemon=>BreedingController.visible(partyPokemon)()
						)[0];
					if (nextPokemon) {
						App.game.breeding.addPokemonToHatchery(nextPokemon);
					} 
					else {
						console.log("No pokemon visible in the hatching list consider checking your filter or just get more pokemons");
					}				
				}
			},this.intervalTime);
		},	
		
		_intervalTime: 1000,
		
		get intervalTime() {
			return this._intervalTime;
		},	
		
		set intervalTime(val) {
			if (Number.isInteger(val)) {
				this._intervalTime=val;
				this.Start();				
			}
			else {
				console.log("Not a whole number");				
			}			
		},
		Start: function() {clearInterval(this.interval.pop());this.interval.push(this.intervalFunction());},		
		
		Stop: function() {clearInterval(this.interval.pop());}
	}
	Autopoke.breeding = AutoBreeding;
})();
