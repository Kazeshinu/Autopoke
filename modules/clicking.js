// Auto Clicking

if (!Autopoke) var Autopoke = {};


	//Create Clicking UI
	(function () {
		let battleContainer=document.getElementById("battleContainer");
		let elem = document.createElement("div");
		elem.id="kazeClickingUI";
		elem.innerHTML=`<div id="kazeClickingUI" class="row p-0 no-gutters">
		<button id="kazeClickingUIButton" class="btn btn-block btn-danger col-md-3">Auto Click [<span>OFF</span>]</button>
		<div class="input-group-prepend col-6 col-md-4"><span class="input-group-text">CPS:</span>
		<input type="number" id="kazeCPS" class="form-control" min="1" max="20" value="20" style="height: 100%;">
		</div>
		<button id="kazeClickOneBtn" class="btn btn-info btn-block col-6 col-md-5">Oneclick (<span id="kazeClickOne"></span>)</button>
		</div>		
		`;
		battleContainer.children[0].after(elem);

		setInterval(()=> {
			let r=Autopoke.clicking.helpFunctions.highestAvailableOneClickRoute();
			document.getElementById("kazeClickOne").innerHTML=Routes.getName(r[1],r[0]);
		},1000);



	})();
(function () {




	Autopoke.clicking = {

		interval: null,

		intervalFunction: function () {
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
		},


		get cps() {
			return 1000 / this._intervalTime;
		},
		set cps(val) {
			if (Number.isInteger(val)) {
				this._intervalTime = Math.floor(1000 / val);
				if(this.isRunning)
					this.Start();
			} else {
				console.log(val+ " is not a valid number");
			}
		},


		_intervalTime: 40,
		get intervalTime() {
			return this._intervalTime;
		},
		set intervalTime(val) {
			if (Number.isInteger(val)) {
				this._intervalTime = val;
				this.Start();
			} else {
				console.log(val+" is not a valid number");
			}
		},
		
		isRunning: false,
		Start: function () {
			if(this.interval) 
				clearInterval(this.interval);
		    this.isRunning=true;
			let button = document.getElementById('kazeClickingUIButton');
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
			let button = document.getElementById('kazeClickingUIButton');
			button.classList.remove("btn-success");
			button.classList.add("btn-danger");
			button.children[0].innerHTML="OFF";
			}
		},
		helpFunctions: {
			latestDockUnlocked: function () {
				return TownList[
				  GameConstants.DockTowns[player.highestRegion()]
				].isUnlocked();
			  },
			  accessToRoute: function (route, region) {
				return (
				  MapHelper.accessToRoute(route, region) &&
				  (this.latestDockUnlocked()
					? region <= player.highestRegion()
					: region === player.highestRegion())
				);
			  },
			highestAvailableOneClickRoute: function () {
				const routes = Routes.regionRoutes
				  .map((r) => [r.region, r.number])
				  .filter((r) => this.accessToRoute(r[1], r[0]));
				const attack = App.game.party.calculateClickAttack();
				const found = routes
				  .reverse()
				  .find((r) => PokemonFactory.routeHealth(r[1], r[0]) < attack);
				return found || 0;
			  },


		}
	};
})();

let button = document.getElementById('kazeClickingUIButton');

function handleClick() {
  if(Autopoke.clicking.isRunning) {

	Autopoke.clicking.Stop();
  }
  else {
	Autopoke.clicking.Start();
  }
}

button.addEventListener('click', handleClick);
document.getElementById('kazeClickOneBtn').addEventListener('click',function() {
	let route=Autopoke.clicking.helpFunctions.highestAvailableOneClickRoute();
	MapHelper.moveToRoute(route[1], route[0]);
})

document.getElementById("kazeCPS").addEventListener('input',function() {Autopoke.clicking.cps=parseInt(this.value,10)});
