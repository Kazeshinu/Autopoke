// Auto Clicking

if (!Autopoke) var Autopoke = {};


(function () {




	Autopoke.clicking = {

		interval: null,

		mostEffPlace: null,



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
			return this.rollingAvgCPS.getAverageGain();
		},
		rollingAvgCPS: function rollingAverageCPS() {
			const window = [];
			let lastValue = App.game.statistics.clickAttacks();

			const intervalId = setInterval(() => {
				const currentValue = App.game.statistics.clickAttacks();
				const timestamp = new Date().getTime();
				window.push({ timestamp, value: currentValue });
				const earliestTimestamp = timestamp - 10000;
				while (window.length > 0 && window[0].timestamp < earliestTimestamp) {
					window.shift();
				}


				lastValue = currentValue;
			}, 1000); // Call the function every second (1000ms)

			function getAverageGain() {
				if (window.length > 1) {
					const timeSpan = window[window.length - 1].timestamp - window[0].timestamp;
					const valueSpan = window[window.length - 1].value - window[0].value;
					return valueSpan / timeSpan * 1000;
				}


			}
			function destroy() {
				clearInterval(intervalId);
			}
			return { getAverageGain, window, destroy }

		}(),





		_intervalTime: 40,
		get intervalTime() {
			return this._intervalTime;
		},
		set intervalTime(val) {
			if (Number.isInteger(val)) {
				this._intervalTime = val;
				this.Start();
			} else {
				console.log(val + " is not a valid number");
			}
		},

		isRunning: false,
		Start: function () {
			if (this.interval)
				clearInterval(this.interval);
			this.isRunning = true;
			let button = document.getElementById('kazeClickingUIButton');
			button.classList.remove("btn-danger");
			button.classList.add("btn-success");
			button.children[0].innerHTML = "ON";
			this.interval = this.intervalFunction();
		},
		Stop: function () {
			if (!this.interval) return;
			clearInterval(this.interval);
			this.isRunning = false;
			this.interval = null;
			let button = document.getElementById('kazeClickingUIButton');
			button.classList.remove("btn-success");
			button.classList.add("btn-danger");
			button.children[0].innerHTML = "OFF";

		},

		dmgTypeCache: {},



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
			betterAccessToTown: function (townName) {
				let town = TownList[townName];
				if (!town) { //might be gym
					town = GymList[townName];
					if (!town) return false;
					if (!town.isUnlocked()) return false;
					town = (town.parent !== undefined ? town.parent : TownList[town.town]);
				}
				return this.latestDockUnlocked()
					? town.isUnlocked() && town.region <= player.highestRegion()
					: town.isUnlocked() && town.region === player.highestRegion();
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
			mostEfficientPlaceForExp: function (n = 1) {
				let average = (ls) => ls.reduce((a, b) => a + b, 0) / ls.length;
				let availableRoutes = Routes.regionRoutes.filter((r) =>
					this.accessToRoute(r.number, r.region)
				);
				let availableGyms = Object.values(GymList).filter(
					(g) => g.isUnlocked() && this.betterAccessToTown(g.town)
				);
				const bonus = App.game.party.multiplier.getBonus('exp');
				let avgRouteExp = availableRoutes.map(r => [[r.region, r.number], Math.floor(average(RouteHelper.getAvailablePokemonList(r.number, r.region).map(p => PokemonHelper.getPokemonByName(p).exp)) * PokemonFactory.routeLevel(r.number, r.region) * bonus / 9)]);
				let avgGymExp = availableGyms.map(g => [g.town, (bonus * 1.5 * average(g.getPokemonList().map(p => PokemonHelper.getPokemonByName(p.name).exp * p.level))) / 9]);
				Autopoke.clicking.dmgTypeCache={};
				let routeExpPerSec = this.routeCalculatePerSec(avgRouteExp);
				let gymExpPerSec = this.gymCalculatePerSec(avgGymExp);

				return this.calculateBest(routeExpPerSec, gymExpPerSec, n);
			},
			mostEfficientPlaceForMoney: function (n = 1) {
				let average = (ls) => ls.reduce((a, b) => a + b, 0) / ls.length;
				let availableRoutes = Routes.regionRoutes.filter((r) =>
					this.accessToRoute(r.number, r.region)
				);
				let availableGyms = Object.values(GymList).filter(
					(g) => g.isUnlocked() && this.betterAccessToTown(g.town)
				);
				const bonus = App.game.party.multiplier.getBonus("money");
				let routeMoney = availableRoutes.map((r) => {
					let arr = Array(100)
						.fill(0)
						.map(() => PokemonFactory.routeMoney(r.number, r.region));
					return [[r.region, r.number], bonus * average(arr)];
				});
				let gymMoney = availableGyms.map((g) => [
					g.town,
					(bonus * g.moneyReward) / g.getPokemonList().length,
				]);
				Autopoke.clicking.dmgTypeCache={};
				let routeMoneyPerSec = this.routeCalculatePerSec(routeMoney);
				let gymMoneyPerSec = this.gymCalculatePerSec(gymMoney);
				return this.calculateBest(routeMoneyPerSec, gymMoneyPerSec, n);
			},
			mostEfficientPlaceForGemType: function (type, n = 1) {
				let availableRoutes = Routes.regionRoutes.filter((r) =>
					this.accessToRoute(r.number, r.region)
				);
				let availableGyms = Object.values(GymList).filter(
					(g) => g.isUnlocked() && this.betterAccessToTown(g.town)
				);
				let avgRouteGems = availableRoutes.map(r => [
					[r.region, r.number],
					RouteHelper.getAvailablePokemonList(r.number, r.region).map(p => PokemonHelper.getPokemonByName(p)).filter((p) => p.type1 === type || p.type2 === type).length / RouteHelper.getAvailablePokemonList(r.number, r.region).length
				]);
				let avgGymGems = availableGyms.map(g => [
					g.town,
					g.getPokemonList().map(p => PokemonHelper.getPokemonByName(p.name)).filter((p) => p.type1 === type || p.type2 === type).length * GameConstants.GYM_GEMS / g.getPokemonList().length
				]);
				Autopoke.clicking.dmgTypeCache={};
				let routeGemsPerSec = this.routeCalculatePerSec(avgRouteGems);
				let gymGemsPerSec = this.gymCalculatePerSec(avgGymGems);
				return this.calculateBest(routeGemsPerSec, gymGemsPerSec, n);


			},
			routeCalculatePerSec: function (routes) {			  
				const clickAttack=App.game.party.calculateClickAttack();
				const cps =Autopoke.clicking.cps;
				return routes.map(([[region, route], rate]) => {
				  const routeHealth = PokemonFactory.routeHealth(route, region);
				  let avgHits=0;
				  let c=1;
				  const avgclicks = Math.ceil(routeHealth / clickAttack)
				  Object.values(RouteHelper.getAvailablePokemonList(route, region)).forEach(p => {
					const poke = PokemonHelper.getPokemonByName(p);
					const types=[poke.type1,poke.type2].sort();
					const key = types.join(",");
					let d = Autopoke.clicking.dmgTypeCache[key];
					if (!d) {
					  d = App.game.party.calculatePokemonAttack(poke.type1, poke.type2);
					  Autopoke.clicking.dmgTypeCache[key] = d;
					}
					avgHits+=(Math.ceil(routeHealth / d)-avgHits)/c++;
				
				})
				  return [[region, route], rate / Math.min(avgHits, avgclicks / cps)];
				});
			  },
			gymCalculatePerSec: function (gyms) {
				const clickAttack=App.game.party.calculateClickAttack();
				const cps = Autopoke.clicking.cps;
				return gyms.map(([gym, rate]) => {
					let avgHits=0;
					let c=1;
					let avgClicks=0;
					const pokemonList=GymList[gym].getPokemonList();
					for (const p of pokemonList) {
						const poke = PokemonHelper.getPokemonByName(p.name);
						const types = [poke.type1, poke.type2].sort();
						const key = types.join(",");
						let d = Autopoke.clicking.dmgTypeCache[key];
						if (!d) {
						  d = App.game.party.calculatePokemonAttack(poke.type1, poke.type2);
						  Autopoke.clicking.dmgTypeCache[key] = d;
						}

						avgHits+=(Math.ceil(p.maxHealth / d)-avgHits)/c;
						avgClicks+=(Math.ceil(p.maxHealth/clickAttack)-avgClicks)/c++;
					}
					return [gym, rate / Math.min(avgHits, avgClicks / cps)];
				});
			},
			calculateBest: function (routes, gyms, n = 1) {
				let both = routes.concat(gyms);
				both.sort((r1, r2) => r2[1] - r1[1]);
				if (n === 1) return both[0];
				return both.slice(0, n);
			},
		}
	};

	Autopoke.gym = {

		selectedGym: null,


		interval: null,
		notificationValue: NotificationConstants.NotificationSetting.General.gym_won.inGameNotification.value,


		isRunning: false,
		Start: function () {

			this.isRunning = true;
			let button = document.getElementById('kazeAutoGym');
			button.classList.remove("btn-danger");
			button.classList.add("btn-success");
			button.children[0].innerHTML = "ON";

		},
		Stop: function () {

			this.selectedGym = null;
			this.isRunning = false;
			NotificationConstants.NotificationSetting.General.gym_won.inGameNotification.value = this.notificationValue;
			let button = document.getElementById('kazeAutoGym');
			button.classList.remove("btn-success");
			button.classList.add("btn-danger");
			button.children[0].innerHTML = "OFF";

		},




	}

	GymRunner.gymObservable.subscribe(function (newValue) {
		Autopoke.gym.selectedGym = newValue;
	});
	player.route.subscribe((function (newValue) {
		this.selectedGym = null;
		NotificationConstants.NotificationSetting.General.gym_won.inGameNotification.value = this.notificationValue;
	}).bind(Autopoke.gym));
	player.town.subscribe((function (newValue) {
		NotificationConstants.NotificationSetting.General.gym_won.inGameNotification.value = this.notificationValue;
		if (this.selectedGym === null) return;

		if (player.route() !== 0 || (player.town() !== (this.selectedGym.parent !== undefined ? this.selectedGym.parent : TownList[this.selectedGym.town]))) {
			this.selectedGym = null;
			return;
		}
		if (this.isRunning) {
			NotificationConstants.NotificationSetting.General.gym_won.inGameNotification.value = false;
			GymRunner.startGym(this.selectedGym);
		}



	}).bind(Autopoke.gym));
})();

//Create Clicking UI
(function () {
	if (Autopoke.clicking.ui) return;
	Autopoke.clicking.ui = true;
	let battleContainer = document.getElementById("battleContainer");
	let elem = document.createElement("div");
	elem.id = "kazeClickingUI";
	elem.innerHTML = `
		<div class="row p-0 no-gutters">
			<button id="kazeClickingUIButton" class="btn btn-block btn-danger col-4">Auto Click [<span>OFF</span>]</button>
			<div class="input-group col-8">
				<span class="input-group-text col-3">Delay</span>
				<input type="number" id="kazeCPS" class="form-control col-3" min="1" max="1000" value="40" style="height: 100%;">
				<span class="input-group-text col-2">ms</span><span class="input-group-text col-4">CPS:&nbsp;<span id="kazeCPSText">0.0</span></span>
			</div>
		</div>
		<div class="row p-0 no-gutters">
		<div class="input-group col-7">
			<span class="input-group-text col-3">Most</span>
			<select class="custom-select" style="height: 100%;" id="kazeInputGroupMostEff1">
				<option value="1" selected="">EXP</option>
				<option value="2">Money</option>
				<option value="3">Gems</option>
			</select>
			<select class="custom-select d-none" style="height: 100%;" id="kazeInputGroupMostEff2">
			</select>
		</div>
		<button id="kazeMostEffBtn" class="btn btn-info btn-block col-5"></button>
	</div>
	<div class="row p-0 no-gutters">
		<button id="kazeAutoGym" class="btn btn-danger col-6">Auto Gym [<span>OFF</span>]</button>
		<button id="kazeAutoDung" class="btn btn-danger col-6">Auto Dungeon [<span>OFF</span>]</button>
	</div>
		`;

	battleContainer.children[0].after(elem);
	let elem2 = document.getElementById("kazeInputGroupMostEff2")
	Object.values(PokemonType).filter(t => t >= 0).forEach(e => {
		let opt = document.createElement("option");
		opt.value = e;
		opt.innerHTML = PokemonType[e];
		elem2.append(opt);
	});


	setInterval(() => {
		if (Autopoke.clicking.cps !== undefined)
			document.getElementById("kazeCPSText").innerHTML = Autopoke.clicking.cps.toFixed(1);
		let selmode = document.getElementById("kazeInputGroupMostEff1").value;
		switch (selmode) {
			case "1":
				Autopoke.clicking.mostEffPlace = Autopoke.clicking.helpFunctions.mostEfficientPlaceForExp();
				break;
			case "2":
				Autopoke.clicking.mostEffPlace = Autopoke.clicking.helpFunctions.mostEfficientPlaceForMoney();
				break;
			case "3":
				Autopoke.clicking.mostEffPlace = Autopoke.clicking.helpFunctions.mostEfficientPlaceForGemType(parseInt(document.getElementById("kazeInputGroupMostEff2").value, 10));
				break;
			default:
				return;
		}
		if (typeof Autopoke.clicking.mostEffPlace[0] === "string") {
			document.getElementById("kazeMostEffBtn").innerHTML = Autopoke.clicking.mostEffPlace[0] + " (" + Autopoke.clicking.mostEffPlace[1].toFixed(0) + ")/s"
		}
		else {
			document.getElementById("kazeMostEffBtn").innerHTML = Routes.getName(Autopoke.clicking.mostEffPlace[0][1], Autopoke.clicking.mostEffPlace[0][0]) + " (" + Autopoke.clicking.mostEffPlace[1].toFixed(0) + ")/s";
		}
	}, 1000);



	document.getElementById('kazeClickingUIButton').addEventListener('click', () => { Autopoke.clicking.isRunning ? Autopoke.clicking.Stop() : Autopoke.clicking.Start(); });
	document.getElementById('kazeAutoGym').addEventListener('click', () => { Autopoke.gym.isRunning ? Autopoke.gym.Stop() : Autopoke.gym.Start(); });
	document.getElementById('kazeMostEffBtn').addEventListener('click', function () {
		if (Autopoke.clicking.mostEffPlace === null) return;
		if (typeof Autopoke.clicking.mostEffPlace[0] === "string") {
			let gym = GymList[Autopoke.clicking.mostEffPlace[0]];
			let = gymTown = (gym.parent !== undefined ? gym.parent : TownList[gym.town])
			MapHelper.moveToTown(gymTown.name);
			gym.protectedOnclick();
		}
		else {
			let route = Autopoke.clicking.mostEffPlace[0];
			MapHelper.moveToRoute(route[1], route[0]);
		}
	})

	document.getElementById("kazeCPS").addEventListener('input', function () { Autopoke.clicking.intervalTime = parseInt(this.value, 10) });


	let mostEff1 = document.getElementById("kazeInputGroupMostEff1");
	mostEff1.addEventListener("change", (event) => {
		switch (event.target.value) {
			case "3":
				document.getElementById("kazeInputGroupMostEff1").classList.add("col-4");
				document.getElementById("kazeInputGroupMostEff2").classList.remove("d-none");
				break;
			default:
				document.getElementById("kazeInputGroupMostEff1").classList.remove("col-4");
				document.getElementById("kazeInputGroupMostEff2").classList.add("d-none");
				break;
		}
	})

})();
