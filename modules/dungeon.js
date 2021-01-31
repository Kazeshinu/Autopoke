//Auto Dungeon

if (!Autopoke) var Autopoke={};

(function() {
	
	const AutoDungeon = {
		
		intervalFunction: function() {
			return setInterval(() => {
				
				if (this._runs==0 && App.game.gameState!=4) { 
					clearInterval(this.interval);
				}				
				if (this._runs>0 && App.game.gameState==6 && typeof player.town().dungeon !== 'undefined') {
					DungeonRunner.initializeDungeon(player.town().dungeon);
					this._runs--;			
				}		
				if (DungeonRunner.fightingBoss() || DungeonRunner.dungeonFinished() || DungeonRunner.fighting() || DungeonBattle.catching() || typeof DungeonRunner.map==='undefined') {
					return;
				}		
				var DRmap = DungeonRunner.map;
				if (DRmap.playerPosition().x>0 && (!DRmap.board()[DungeonRunner.map.playerPosition().y][DungeonRunner.map.playerPosition().x-1].isVisible||((this.openChests) && DRmap.board()[DungeonRunner.map.playerPosition().y][DungeonRunner.map.playerPosition().x-1].type()==3))) {
					DRmap.moveLeft();
				}
				else if (DRmap.playerPosition().y>0 && (!DRmap.board()[DungeonRunner.map.playerPosition().y-1][DungeonRunner.map.playerPosition().x].isVisible||((this.openChests) && DRmap.board()[DungeonRunner.map.playerPosition().y-1][DungeonRunner.map.playerPosition().x].type()==3))) {
					DRmap.moveUp();
				}
				else if (DRmap.playerPosition().y<DRmap.size-1 && (!DRmap.board()[DungeonRunner.map.playerPosition().y+1][DungeonRunner.map.playerPosition().x].isVisible ||((this.openChests) &&  DRmap.board()[DungeonRunner.map.playerPosition().y+1][DungeonRunner.map.playerPosition().x].type()==3 ))) {
					DRmap.moveDown();
				}
				else if (DRmap.playerPosition().x<DRmap.size-1 && (!DRmap.board()[DungeonRunner.map.playerPosition().y][DungeonRunner.map.playerPosition().x+1].isVisible||((this.openChests) && DRmap.board()[DungeonRunner.map.playerPosition().y][DungeonRunner.map.playerPosition().x+1].type()==3))) {
					DRmap.moveRight();
				}
				else {
					for (p1 = 0; p1 < DRmap.size; p1++) {
						for (p2 = 0; p2 < DRmap.size; p2++) {
							if (DRmap.board()[p1][p2].type()==4) {
								DRmap.moveToCoordinates(p2,p1);
								DungeonRunner.startBossFight();
								p1 = p2 = DRmap.size;
							}
						}
					}
				}
				if (this.openChests) {
					DungeonRunner.openChest();
				}
				DungeonRunner.startBossFight();
			}, this.intervalTime);
		},
		_runs: 0,
		get runs() {
			return this._runs;
		},
		set runs(val) {
			if (Number.isInteger(val)) {
				this._runs=val;
				this.Stop();
				if(val>0) this.Start();				
			}
			else {
				console.log("Not a whole number");
			}
		},
		
		_openChests: false,
		get openChests() {
			return this._openChests;
		},
		set openChests(val) {
			if (val === true || val === false) {
				this._openChests=val;			
			}
			else {
				console.log("Not true or false");
			}
		},		
		
		_intervalTime: 100,
		
		get intervalTime() {
			return this._intervalTime;
		},	
		
		set intervalTime(val) {
			if (Number.isInteger(val)) {
				this._intervalTime=val;
				this.Stop();
				this.Start();				
			}
			else {
				console.log("Not a whole number");				
			}			
		},
		
		Start: function() {this.interval=this.intervalFunction();},		
		
		Stop: function() {clearInterval(this.interval);}
		
	}
	Autopoke.dungeon = AutoDungeon;
})();