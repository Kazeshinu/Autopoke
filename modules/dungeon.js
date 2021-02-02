//Auto Dungeon

if (!Autopoke) var Autopoke = {};

(function () {

	const AutoDungeon = {

		interval: [],

		intervalFunction: function () {
			return setInterval(() => {

				if (this._runs < 1) {

					clearInterval(this.interval.pop());
					return;
				}

				if (this._runs === 1 && App.game.gameState !== 4) {
					clearInterval(this.interval.pop());
					this._openChests = this._preopenChests;
					DungeonRunner.dungeonObservable(this._dummyDungeon);
				}
				if (this._runs > 1 && App.game.gameState === 6 && typeof player.town().dungeon !== 'undefined') {
					DungeonRunner.initializeDungeon(player.town().dungeon);
					this._openChests = this._preopenChests;
					this._runs--;
				}
				if (DungeonRunner.fightingBoss() || DungeonRunner.dungeonFinished() || DungeonRunner.fighting()
					|| DungeonBattle.catching() || typeof DungeonRunner.map === 'undefined') {
					return;
				}
				let DRmap = DungeonRunner.map;
				let pos = DRmap.playerPosition();
				let left = DRmap.board()[pos.y][pos.x - 1];
				let right = DRmap.board()[pos.y][pos.x + 1];
				let up = DRmap.board()[pos.y - 1][pos.x];
				let down = DRmap.board()[pos.y + 1][pos.x];
				if (pos.x > 0 && (!left.isVisible || (this.openChests && left.type() === 3))) {
					DRmap.moveLeft();
				} else if (pos.y > 0 && (!up.isVisible || (this.openChests && up.type() === 3))) {
					DRmap.moveUp();
				} else if (pos.y < DRmap.size - 1 && (!down.isVisible || (this.openChests && down.type() === 3))) {
					DRmap.moveDown();
				} else if (pos.x < DRmap.size - 1 && (!right.isVisible || (this.openChests && right.type() === 3))) {
					DRmap.moveRight();
				} else {
					for (let p1 = 0; p1 < DRmap.size; p1++) {
						for (let p2 = 0; p2 < DRmap.size; p2++) {
							if (DRmap.board()[p1][p2].type() === 4 && DRmap.board()[p1][p2].isVisible) {
								DRmap.moveToCoordinates(p2, p1);
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
		_dummyDungeon: {
			baseHealth: 102,
			bossList: [],
			difficultyRoute: 1,
			enemyList: [],
			itemList: [],
			level: 5,
			name: "DummyDungeon",
			tokenCost: 0
		},
		_runs: 1,
		get runs() {
			return this._runs;
		},
		set runs(val) {
			if (Number.isInteger(val)) {
				this._runs = val;
			} else {
				console.log("Not a whole number");
			}
		},

		_openChests: false,
		_preopenChests: false,
		get openChests() {
			return this._openChests;
		},
		set openChests(val) {
			if (val === true || val === false) {
				if (App.game.gameState !== 4) {
					this._openChests = val;
				}
				this._preopenChests = val;
			} else {
				console.log("Not true or false");
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
				console.log("Not a whole number");
			}
		},

		Start: function () {
			clearInterval(this.interval.pop());
			this.interval.push(this.intervalFunction());
		},

		Stop: function () {
			this._runs = 1
		}

	}
	Autopoke.dungeon = AutoDungeon;
	Autopoke.dungeon._dungeon = Autopoke.dungeon._dummyDungeon;
	DungeonRunner.dungeonObservable = ko.observable(Autopoke.dungeon._dummyDungeon);
	DungeonRunner.initializeDungeon = (function () {
		let old_function = DungeonRunner.initializeDungeon;
		return function () {
			let result = old_function.apply(this, arguments);
			this.dungeonObservable(this.dungeon);
			return result;
		};
	})();
	DungeonRunner.dungeonObservable.subscribe(function (newValue) {
		if (Autopoke.dungeon._dungeon === newValue) {
			return;
		}
		Autopoke.dungeon._dungeon = newValue;
		if (newValue.name !== "DummyDungeon" && Autopoke.dungeon.runs > 0) {
			Autopoke.dungeon.Start();
		}


	});
})();