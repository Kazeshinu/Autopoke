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