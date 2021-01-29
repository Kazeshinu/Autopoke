
// Auto Breeding
if (typeof Autopoke === 'undefined') {
	var Autopoke={}
}
if (typeof Autopoke.breeding === 'undefined') {
	Autopoke.breeding={}
}
Object.defineProperties(Autopoke.breeding, {
	_intervalTime: {
		value:1000,
		writable:true
	},
	intervalTime: {
		get:function() {
			return this._intervalTime;
		},
		set: function(val) {
			if (Number.isInteger(val)) {
				this._intervalTime=val;
				this.Stop();
				this.Start();
			}
			else {
				console.log("Not a int number");
			}
		}
	}	
});
Autopoke.breeding.intervalFunction = function() {
	return setInterval(() => {
		if(!App.game.breeding.queueSlots()){
			App.game.breeding.hatchPokemonEgg(0);
			App.game.breeding.hatchPokemonEgg(1);
			App.game.breeding.hatchPokemonEgg(2);
			App.game.breeding.hatchPokemonEgg(3);
		}
		if(App.game.breeding.hasFreeQueueSlot()||App.game.breeding.hasFreeEggSlot()) {
			App.game.breeding.addPokemonToHatchery(
			App.game.party.caughtPokemon
				.filter(
				(partyPokemon) => !partyPokemon.breeding && partyPokemon.level >= 100
				)
				.sort(PartyController.compareBy(6, false))[0]
			);
		}
	},this.intervalTime);
}
Autopoke.breeding.Start = function() {this.interval=this.intervalFunction();};
Autopoke.breeding.Stop = function() {clearInterval(this.interval);}
Autopoke.breeding.Start();