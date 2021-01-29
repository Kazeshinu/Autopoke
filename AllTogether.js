
//Auto Dungeon
if (typeof Autopoke === 'undefined') {
	var Autopoke={}
}
if (typeof Autopoke.dungeon === 'undefined') {
	Autopoke.dungeon={}
}
Object.defineProperties(Autopoke.dungeon, {
	_runs: {
		value:0,
		writable: true
	},
	runs: {
		get:function() {
			return this._runs;
		},
		set: function(val) {
			if (Number.isInteger(val)) {
				this._runs=val;
				this.Stop();
				if(val>0) this.Start();				
			}
			else {
				console.log("Not a number");
			}
		}
	},
	_openChests: {
		value:false,
		writable: true
	},
	openChests: {
		get:function() {
			return this._openChests;
		},
		set: function(val) {
			if (val === true || val === false) {
				this._openChests=val;			
			}
			else {
				console.log("Not a boolean");
			}
		}
	},
	_intervalTime: {
		value:100,
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
Autopoke.dungeon.intervalFunction = function() {
	return setInterval(() => {
		
		if (this._runs==0 && App.game.gameState!=4) clearInterval(this.autoDungeon);
		
		
		if (this._runs>0 && App.game.gameState==6 && typeof player.town().dungeon !== 'undefined') {
			DungeonRunner.initializeDungeon(player.town().dungeon);
			this._runs--;			
		}		
        if (DungeonRunner.dungeonFinished() || DungeonRunner.fighting() || DungeonBattle.catching() || typeof DungeonRunner.map==='undefined') {
            return;
        }		
		var DRmap = DungeonRunner.map;
		if (DRmap.playerPosition().x>0 && (!DRmap.board()[DungeonRunner.map.playerPosition().y][DungeonRunner.map.playerPosition().x-1].isVisible||DRmap.board()[DungeonRunner.map.playerPosition().y][DungeonRunner.map.playerPosition().x-1].type()==3)) {
				DRmap.moveLeft();
		}
		else if (DRmap.playerPosition().y>0 && (!DRmap.board()[DungeonRunner.map.playerPosition().y-1][DungeonRunner.map.playerPosition().x].isVisible||DRmap.board()[DungeonRunner.map.playerPosition().y-1][DungeonRunner.map.playerPosition().x].type()==3)) {
				DRmap.moveUp();
		}
		else if (DRmap.playerPosition().y<DRmap.size-1 && (!DRmap.board()[DungeonRunner.map.playerPosition().y+1][DungeonRunner.map.playerPosition().x].isVisible || DRmap.board()[DungeonRunner.map.playerPosition().y+1][DungeonRunner.map.playerPosition().x].type()==3 )) {
				DRmap.moveDown();
		}
		else if (DRmap.playerPosition().x<DRmap.size-1 && (!DRmap.board()[DungeonRunner.map.playerPosition().y][DungeonRunner.map.playerPosition().x+1].isVisible||DRmap.board()[DungeonRunner.map.playerPosition().y][DungeonRunner.map.playerPosition().x+1].type()==3)) {
				DRmap.moveRight();
		}
		else {
			for (p1 = 0; p1 < DRmap.size; p1++) {
				for (p2 = 0; p2 < DRmap.size; p2++) {
					if (DRmap.board()[p1][p2].type()==4) {
						DRmap.moveToCoordinates(p2,p1);
						DungeonRunner.startBossFight();
						p1 = p2 = -1;
					}
				}
			}
		}
		if (this.openChests) DungeonRunner.openChest();
		DungeonRunner.startBossFight();
		
	}, this.intervalTime);
}
Autopoke.dungeon.Start = function() {this.interval=this.intervalFunction();};
Autopoke.dungeon.Stop = function() {clearInterval(this.interval);}
Autopoke.dungeon.Start();



// Auto Clicking
if (typeof Autopoke === 'undefined') {
	var Autopoke={}
}
if (typeof Autopoke.clicking === 'undefined') {
	Autopoke.clicking={}
}
Object.defineProperties(Autopoke.clicking, {
	_cps: {
		value:50,
		writable: true
	},
	cps: {
		get:function() {
			return this._cps;
		},
		set: function(val) {
			if (Number.isInteger(val)) {
				this._cps=Math.floor(1000/val);
				this.Stop();
				this.Start();			
			}
			else {
				console.log("Not a number");
			}
		}
	},
	intervalTime: {
		get:function() {
			return this._cps;
		},
		set: function(val) {
			if (Number.isInteger(val)) {
				this._cps=val;
				this.Stop();
				this.Start();			
			}
			else {
				console.log("Not a int number");
			}
		}
	}
});
Autopoke.clicking.intervalFunction = function() {
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
}
Autopoke.clicking.Start = function() {this.interval=this.intervalFunction();};
Autopoke.clicking.Stop = function() {clearInterval(this.interval);}
Autopoke.clicking.Start();



// Auto Farming
if (typeof Autopoke === 'undefined') {
	var Autopoke={}
}
if (typeof Autopoke.farming === 'undefined') {
	Autopoke.farming={}
}
Object.defineProperties(Autopoke.farming, {
	_berry: {
		value:App.game.farming.berryData[BerryType.Cheri],
		writable: true
	},
	berry: {
		get:function() {
			return this._berry;
		},
		set: function(val) {
			if (BerryType[val]!=='undefined') {
				this._berry=App.game.farming.berryData[BerryType[val]];
				clearInterval(this.interval);
				this.interval=this.intervalFunction();				
			}
			else {
				console.log("No berry with that name (Case sensitive)");
			}
		}
	}
});
Autopoke.farming.intervalFunction = function() {
	return setInterval(() => {
		App.game.farming.harvestAll();
		App.game.farming.plantAll(this.berry.type);
	},this.berry.growthTime[3]+1);
}
Autopoke.farming.Start = function() {this.interval=this.intervalFunction();};
Autopoke.farming.Stop = function() {clearInterval(this.interval);}
Autopoke.farming.Start();





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

//Auto Underground
if (typeof Autopoke === 'undefined') {
	var Autopoke={}
}
if (typeof Autopoke.underground === 'undefined') {
	Autopoke.underground={}
}
Object.defineProperties(Autopoke.underground, {
	_intervalTime: {
		value:1000*60,
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
// for some reason X is down and Y is right
Autopoke.underground.smartMine=function(x,y) {
	while (Mine.grid[x][y]() > 0&&App.game.underground.energy>=Underground.CHISEL_ENERGY) {
		Mine.chisel(x,y);
	}
	const reward = Mine.rewardGrid[x][y];
	if (Mine.rewardNumbers.includes(reward.value)) {		
		if (reward.revealed==1&&Mine.grid[Mine.normalizeY(x-1)][y]() > 0) {
			this.smartMine(Mine.normalizeY(x-1),y);
		}
		if (reward.revealed==1&&Mine.grid[Mine.normalizeY(x+1)][y]() > 0) {
			this.smartMine(Mine.normalizeY(x+1),y);
		}
		if (reward.revealed==1&&Mine.grid[x][Mine.normalizeX(y+1)]() > 0) {
			this.smartMine(x,Mine.normalizeX(y+1));
		}
		if (reward.revealed==1&&Mine.grid[x][Mine.normalizeX(y-1)]() > 0) {
			this.smartMine(x,Mine.normalizeX(y-1));
		}	
	}	
}
Autopoke.underground.intervalFunction = function() {
	return setInterval(() => {
		if (App.game.underground.energy >= Underground.BASE_ENERGY_MAX-Underground.BASE_ENERGY_GAIN) {
			while (App.game.underground.energy >= Underground.BASE_ENERGY_MAX-Underground.BASE_ENERGY_GAIN) {
				const x = GameConstants.randomIntBetween(0, App.game.underground.getSizeY() - 1);
				const y = GameConstants.randomIntBetween(0, Underground.sizeX - 1);
				this.smartMine(x,y);
			}
		}
	}, this.intervalTime);
}
Autopoke.underground.Start = function() {this.interval=this.intervalFunction();};
Autopoke.underground.Stop = function() {clearInterval(this.interval);}
Autopoke.underground.Start();