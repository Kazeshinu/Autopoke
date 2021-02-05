//Auto Quests

if (!Autopoke) var Autopoke = {};

(function () {

	const AutoQuests = {

		interval: [],
		intervalFunction: function () {
			return setInterval(() => {

				//Try to claim Quests
				App.game.quests.currentQuests().filter(quest => quest.isCompleted()).forEach(quest => App.game.quests.claimQuest(quest.index));

				App.game.pokeballs.alreadyCaughtSelection = this._pokeballs.alreadyCaughtSelection;
				App.game.pokeballs.alreadyCaughtShinySelection = this._pokeballs.alreadyCaughtShinySelection;
				let failsafe = 0 //fixes infinite loop while gaining new questslot
				//If Questslots Start new quests
				while (App.game.quests.canStartNewQuest() && failsafe < 10) {
					let nextQuest = App.game.quests.questList().find(quest => !quest.isCompleted() && !quest.inProgress());
					if (nextQuest) {
						App.game.quests.beginQuest(nextQuest.index);
					}
					failsafe++;
				}


				// TODO: Some sort of priority system.
				//some quest optimization
				let shardQuest = false;
				let useBallQuest = false;
				var highestPrio = 0;
				for (let i = 0; i < App.game.quests.currentQuests().length; i++) {
					let index = this._questPriorityList.indexOf(App.game.quests.currentQuests()[i].constructor.name);
					highestPrio = index > highestPrio ? index : highestPrio;
					if (this._currentQuest instanceof GainShardsQuest) {
						shardQuest = true;
					}
					if (this._currentQuest instanceof UsePokeballQuest) {
						useBallQuest = true;
					}

					// highestPrio === this._questPriorityList.indexOf("NAME")
				}

				if (!shardQuest) {
					this._mostEfficientPlace = [];
				}

				let route;
				let itemName = "";
				let setBalls = false;
				for (let i = 0; i < App.game.quests.currentQuests().length; i++) {
					this._currentQuest = App.game.quests.currentQuests()[i];

					switch (this._currentQuest.constructor) {
						case BuyPokeballsQuest:
							itemName = GameConstants.Pokeball[this._currentQuest.pokeball];
							let towns = this.helpFunctions.getAvailableShopsByItemName(itemName);
							let item = towns[0].shop.items.filter(item => item.name === itemName)[0];
							if (App.game.wallet.hasAmount(new Amount(item.totalPrice(this._currentQuest.amount), item.currency)) && this._autoMove) {
								MapHelper.moveToTown(towns[0].name);
								player.region = player.town().region;
								item.buy(this._currentQuest.amount);
							} else {
								console.log(`Need more gold before buying ${this._currentQuest.amount} ${itemName} or autoMove is false`);
								console.log(`Missing ${item.totalPrice(this._currentQuest.amount)}` - App.game.wallet.currencies[item.currency]());
							}
							break;
						case DefeatDungeonQuest:
							if (App.game.gameState === 4) {
								return;
							}
							if (Autopoke.dungeon !== undefined) {
								if (this.helpFunctions.betterAccessToTown(this._currentQuest.dungeon) &&
									App.game.wallet.hasAmount(new Amount(dungeonList[this._currentQuest.dungeon].tokenCost, GameConstants.Currency.dungeonToken)) &&
									this._autoMove && highestPrio === this._questPriorityList.indexOf(this._currentQuest.constructor.name)) {
									Autopoke.dungeon._runs = 1;
									MapHelper.moveToTown(this._currentQuest.dungeon);
									player.region = player.town().region;
									DungeonRunner.initializeDungeon(player.town().dungeon);
								} else {
									console.log("Not enough tokens or no access to the dungeon or autoMove is false");
								}
							} else {
								console.log("Missing dungeon module");
							}
							break;
						case DefeatGymQuest:
							if (App.game.gameState === 3) {
								return;
							}
							if (this.helpFunctions.betterAccessToTown(TownList[this._currentQuest.gymTown].name) &&
								this._autoMove && highestPrio === this._questPriorityList.indexOf(this._currentQuest.constructor.name)) {
								if (Autopoke.gym !== undefined) {
									Autopoke.gym._runs = 1;
								}
								MapHelper.moveToTown(TownList[this._currentQuest.gymTown].name);
								player.region = player.town().region;
								GymRunner.startGym(gymList[this._currentQuest.gymTown]);
							} else {
								console.log(`Can't access ${this._currentQuest.gymTown.name} or autoMove is false`);
							}
							break;
						case UsePokeballQuest:
						case GainTokensQuest:
						case CatchShiniesQuest:
						case CapturePokemonsQuest:


							if (!setBalls) {
								this._pokeballs.alreadyCaughtSelection = App.game.pokeballs._alreadyCaughtSelection();
								this._pokeballs._alreadyCaughtShinySelection = App.game.pokeballs._alreadyCaughtShinySelection();
								setBalls = true;

							}

							itemName = ""
							let buyAmount = 100;

							if ((this._currentQuest instanceof UsePokeballQuest) || useBallQuest) {
								App.game.pokeballs._alreadyCaughtSelection(this._currentQuest.pokeball);
								itemName = GameConstants.Pokeball[this._currentQuest.pokeball];
								buyAmount = (this._currentQuest.focus() - this._currentQuest.initial() + this._currentQuest.amount);
							} else if (this._currentQuest instanceof CapturePokemonsQuest) {
								App.game.pokeballs._alreadyCaughtSelection(this._captureBall);
								itemName = GameConstants.Pokeball[this._captureBall];
								buyAmount = (this._currentQuest.focus() - this._currentQuest.initial() + this._currentQuest.amount) * 2;
							} else if (this._currentQuest instanceof GainTokensQuest) {
								App.game.pokeballs._alreadyCaughtSelection(this._captureBall);
								itemName = GameConstants.Pokeball[this._captureBall];
							}
							if (this._currentQuest instanceof CatchShiniesQuest) {
								App.game.pokeballs._alreadyCaughtShinySelection(this._captureShinyBall);
								itemName = GameConstants.Pokeball[this._captureShinyBall];
								buyAmount = (this._currentQuest.focus() - this._currentQuest.initial() + this._currentQuest.amount) * 10;
							}
							if (itemName !== "") {
								if (App.game.pokeballs.getBallQuantity(GameConstants.Pokeball[itemName]) === 0) {
									let towns = this.helpFunctions.getAvailableShopsByItemName(itemName);
									let item = towns[0].shop.items.filter(item => item.name === itemName)[0];
									if (App.game.wallet.hasAmount(new Amount(item.totalPrice(buyAmount), item.currency)) && this._autoMove) {
										MapHelper.moveToTown(towns[0].name);
										player.region = player.town().region;
										item.buy(buyAmount);
									} else {
										console.log("All out of Balls and cant afford them or autoMove is false");
									}
								}
							}
						case GainMoneyQuest:
							route = 0;
							if (Autopoke.clicking.interval.length !== 0) {
								route = this.helpFunctions.highestAvailableOneClickRoute();
								if (route === 0) {
									console.log("No one-tappable routes are accessible");
								}
							}
							if (route === 0) {
								route = this.helpFunctions.highestAvailableOneShotRoute();
								if (route === 0) {
									console.log("No oneshot routes available");
								}
							}
							if (route !== 1 && this._autoMove && highestPrio === this._questPriorityList.indexOf(this._currentQuest.constructor.name)) {
								MapHelper.moveToRoute(route[1], route[0]);
							}
							break;

						case DefeatPokemonsQuest:
							route = [this._currentQuest.region, this._currentQuest.route];
							if (this.helpFunctions.accessToRoute(route[1], route[0]) &&
								this._autoMove && highestPrio === this._questPriorityList.indexOf(this._currentQuest.constructor.name)) {
								MapHelper.moveToRoute(route[1], route[0]);
							} else {
								console.log("Route is not available or autoMove is false");
							}
							break;
						case GainShardsQuest:
							if (this._mostEfficientPlace.length === 0) {
								this._mostEfficientPlace = this.helpFunctions.mostEfficientPlaceForShardType(this._currentQuest.type);
							}
							if (typeof this._mostEfficientPlace === "string") {
								if (App.game.gameState === 3) {
									return;
								}
								if (this.helpFunctions.betterAccessToTown(this._mostEfficientPlace) &&
									this._autoMove && highestPrio === this._questPriorityList.indexOf(this._currentQuest.constructor.name)) {
									if (Autopoke.gym !== undefined) {
										Autopoke.gym._runs = 1;
									}
									MapHelper.moveToTown(this._mostEfficientPlace);
									player.region = player.town().region;
									GymRunner.startGym(gymList[this._mostEfficientPlace]);

								} else {
									console.log("Not enough tokens or no access to dungeon or autoMove is false");
								}

							} else {
								let route = this._mostEfficientPlace;
								if (this._autoMove && highestPrio === this._questPriorityList.indexOf(this._currentQuest.constructor.name)) {
									MapHelper.moveToRoute(route[1], route[0]);
								}

							}

							break;
						case HarvestBerriesQuest:
							if (Autopoke.farming !== undefined) {
								if (Autopoke.farming.berry.type !== this._currentQuest.berryType && Autopoke.farming.interval.length !== 0) {
									Autopoke.farming.berry = BerryType[this._currentQuest.berryType];
								}
								if (this._autoMove && highestPrio === this._questPriorityList.indexOf(this._currentQuest.constructor.name)) {
									let route = 0;
									if (Autopoke.clicking.interval.length !== 0) {
										route = this.helpFunctions.highestAvailableOneClickRoute();
										if (route === 0) {
											console.log("No one-tappable routes are accessible");
										}
									}
									if (route === 0) {
										route = this.helpFunctions.highestAvailableOneShotRoute();
										if (route === 0) {
											console.log("No oneshot routes available");
										}
									}
									if (route !== 1) {
										MapHelper.moveToRoute(route[1], route[0]);
									}
								}
							} else {
								console.log("Enable farming module please");
							}
							break;
						case HatchEggsQuest:
							if (Autopoke.breeding !== undefined) {
								if (this._autoMove && highestPrio === this._questPriorityList.indexOf(this._currentQuest.constructor.name)) {
									let r = this.helpFunctions.highestAvailableOneClickRoute();
									if (r === 0 || Autopoke.clicking.interval.length === 0) {
										let r = this.helpFunctions.highestAvailableOneShotRoute();
										if (r !== 0) {
											MapHelper.moveToRoute(r[1], r[0]);
										}
									} else {
										MapHelper.moveToRoute(r[1], r[0]);
									}
								}
							} else {
								console.log("Enable breeding module please");
							}
							break;
						case MineLayersQuest:
							if (Autopoke.underground === undefined) {
								console.log("Enable underground module please");
							} else {
								if (this._autoMove && highestPrio === this._questPriorityList.indexOf(this._currentQuest.constructor.name)) {
									let route = 0;
									if (Autopoke.clicking.interval.length !== 0) {
										route = this.helpFunctions.highestAvailableOneClickRoute();
										if (route === 0) {
											console.log("No one-tappable routes are accessible");
										}
									}
									if (route === 0) {
										route = this.helpFunctions.highestAvailableOneShotRoute();
										if (route === 0) {
											console.log("No oneshot routes available");
										}
									}
									if (route !== 1) {
										MapHelper.moveToRoute(route[1], route[0]);
									}
								}
							}
							break;
						case UseOakItemQuest:
							let oakItem = this._currentQuest.item;
							if (!App.game.oakItems.isActive(oakItem)) {
								if (!App.game.oakItems.hasAvailableSlot()) {
									App.game.oakItems.deactivate(App.game.oakItems.itemList.find(p => p.isActive && p.name !== oakItem).name);
								}
								App.game.oakItems.activate(oakItem);
							}
							switch (oakItem) {
								case OakItems.OakItem.Magic_Ball:

									if (!setBalls) {
										this._pokeballs.alreadyCaughtSelection = App.game.pokeballs._alreadyCaughtSelection();
										this._pokeballs._alreadyCaughtShinySelection = App.game.pokeballs._alreadyCaughtShinySelection();
										setBalls = true;
									}
									App.game.pokeballs._alreadyCaughtSelection(this._captureBall);
									let itemName = GameConstants.Pokeball[this._captureBall];
									let buyAmount = (this._currentQuest.focus() - this._currentQuest.initial());
									if (itemName !== "") {
										if (App.game.pokeballs.getBallQuantity(GameConstants.Pokeball[itemName]) === 0) {
											let towns = this.helpFunctions.getAvailableShopsByItemName(itemName);
											let item = towns[0].shop.items.filter(item => item.name === itemName)[0];
											if (App.game.wallet.hasAmount(new Amount(item.totalPrice(buyAmount), item.currency)) && this._autoMove) {
												MapHelper.moveToTown(towns[0].name)
												player.region = player.town().region;
												item.buy(buyAmount);
											} else {
												console.log("All out of Balls and can't afford them or autoMove is false");
											}
										}
									}
								case OakItems.OakItem.Amulet_Coin:
								case OakItems.OakItem.Exp_Share:

									if (this._autoMove && highestPrio === this._questPriorityList.indexOf(this._currentQuest.constructor.name)) {
										let route = 0;
										if (Autopoke.clicking.interval.length !== 0) {
											route = this.helpFunctions.highestAvailableOneClickRoute();
											if (route === 0) {
												console.log("No one-tappable routes are accessible");
											}
										}
										if (route === 0) {
											route = this.helpFunctions.highestAvailableOneShotRoute();
											if (route === 0) {
												console.log("No oneshot routes available");
											}
										}
										if (route !== 1) {
											MapHelper.moveToRoute(route[1], route[0]);
										}
									}
									break;
							}
							break;
					}
				}

			}, this.intervalTime);
		},
		helpFunctions: {
			getAvailableShopsByItemName: function (itemName) {
				const shops = [];
				Object.entries(TownList).forEach(([, town]) => {
					if (town.shop && town.shop.items) {
						const hasItem = town.shop.items.find(item => item !== undefined ? item.name === itemName : false);
						if (hasItem) {
							shops.push(town);
						}
					}
				});
				return shops.filter(town => this.betterAccessToTown(town.name));
			},
			latestDockUnlocked: function () {
				return TownList[GameConstants.DockTowns[player.highestRegion()]].isUnlocked();
			},
			accessToRoute: function (route, region) {
				return MapHelper.accessToRoute(route, region) && (this.latestDockUnlocked()
					? region <= player.highestRegion() : region === player.highestRegion())
			},
			betterAccessToTown: function (townName) {
				const town = TownList[townName];
				return this.latestDockUnlocked() ? town.isUnlocked() : (town.isUnlocked() && (town.region === player.highestRegion))
			},
			highestAvailableOneShotRoute: function () {
				const routes = Routes.regionRoutes.map(r => [r.region, r.number]).filter(r => this.accessToRoute(r[1], r[0]));
				const found = routes.reverse()
					.find(r => PokemonFactory.routeHealth(r[1], r[0]) < Math.max(1,
						App.game.party.calculatePokemonAttack(PokemonType.None, PokemonType.None,
							false, r[0], true, false, false)));
				return found || 0;
			},
			highestAvailableOneClickRoute: function () {
				const routes = Routes.regionRoutes.map(r => [r.region, r.number]).filter(r => this.accessToRoute(r[1], r[0]));
				const attack = App.game.party.calculateClickAttack();
				const found = routes.reverse().find(r => PokemonFactory.routeHealth(r[1], r[0]) < attack);
				return found || 0;
			},
			gymShardsRateForType: function (type) {
				return Object.values(gymList)
					.filter(g => Gym.isUnlocked(g))
					.map(g => [g.town, (g.pokemons
						.map(p => PokemonHelper.getPokemonByName(p.name)))
						.filter(p => p.type1 === type || p.type2 === type).length / g.pokemons.length * GameConstants.GYM_SHARDS])
					.filter(r => r[1] > 0)
			},
			routeShardsRateForType: function (type) {
				let availableRoutes = Routes.regionRoutes.filter(r => this.accessToRoute(r.number, r.region))
				return availableRoutes.map(r => [
					[r.region, r.number],
					Object.values(r.pokemon).flat()
						.map(p => PokemonHelper.getPokemonByName(p))
						.filter(p => p.type1 === type || p.type2 === type).length / Object.values(r.pokemon).flat().length
				]).filter(r => r[1] > 0)
			},
			routeCalculatePerSec: function (routes) {
				let average = (ls) => ls.reduce((a, b) => a + b, 0) / ls.length
				return routes.map(r => {
					let [[region, route], rate] = r
					let pokemon = Object.values(Routes.getRoute(region, route).pokemon).flat().map(p => PokemonHelper.getPokemonByName(p))
					let hits = pokemon.map(p => App.game.party.calculatePokemonAttack(p.type1, p.type2))
						.map(d => Math.ceil(PokemonFactory.routeHealth(route, region) / d))
					let clicks = pokemon.map(() => App.game.party.calculateClickAttack())
						.map(d => Math.ceil(PokemonFactory.routeHealth(route, region) / d))
					return [[region, route], rate / Math.min(average(hits), average(clicks) / 20)]
				})
			},
			gymCalculatePerSec: function (gyms) {
				let average = (ls) => ls.reduce((a, b) => a + b, 0) / ls.length
				return gyms.map(r => {
					let [gym, rate] = r
					let hits = gymList[gym].pokemons.map(p => {
						let poke = PokemonHelper.getPokemonByName(p.name)
						return Math.ceil(p.maxHealth / App.game.party.calculatePokemonAttack(poke.type1, poke.type2))
					})
					let clicks = gymList[gym].pokemons.map(p => Math.ceil(p.maxHealth / App.game.party.calculateClickAttack()))
					return [gym, rate / Math.min(average(hits), average(clicks) / 20)]
				})
			},
			calculateBest: function (routes, gyms, n = 1) {
				let both = routes.concat(gyms)
				both.sort((r1, r2) => r2[1] - r1[1])
				if (n === 1)
					return both[0]
				return both.slice(0, n)
			},
			mostEfficientPlaceForShardType: function (type, n = 1) {
				let routeShards = this.routeShardsRateForType(type)
				let gymShards = this.gymShardsRateForType(type)
				let routeShardsPerSec = this.routeCalculatePerSec(routeShards)
				let gymShardsPerSec = this.gymCalculatePerSec(gymShards)
				return this.calculateBest(routeShardsPerSec, gymShardsPerSec, n)
			},
			mostEfficientPlaceForMoney: function (n = 1) {
				let average = (ls) => ls.reduce((a, b) => a + b, 0) / ls.length
				let availableRoutes = Routes.regionRoutes.filter(r => this.accessToRoute(r.number, r.region))
				let availableGyms = Object.values(gymList).filter(g => Gym.isUnlocked(g) && this.betterAccessToTown(g.town))
				const bonus = App.game.wallet.multiplier.getBonus('money', true)
				let routeMoney = availableRoutes.map(r => {
					let arr = Array(100).fill(0).map(() => PokemonFactory.routeMoney(r.number, r.region))
					return [[r.region, r.number], bonus * average(arr)]
				})
				let gymMoney = availableGyms.map(g => [g.town, bonus * g.moneyReward / g.pokemons.length])
				let routeMoneyPerSec = this.routeCalculatePerSec(routeMoney)
				let gymMoneyPerSec = this.gymCalculatePerSec(gymMoney)
				return this.calculateBest(routeMoneyPerSec, gymMoneyPerSec, n)
			}
		},
		_questPriorityList: [
			"MineLayersQuest",
			"HarvestBerriesQuest",
			"CatchShiniesQuest",
			"UseOakItemQuest",
			"HatchEggsQuest",
			"GainTokensQuest",
			"GainMoneyQuest",
			"UsePokeballQuest",
			"GainShardsQuest",
			"CapturePokemonsQuest",
			"DefeatPokemonsQuest",
			"DefeatGymQuest",
			"DefeatDungeonQuest"
		],

		_mostEfficientPlace: [],
		_autoMove: true,
		_captureShinyBall: 2,
		_captureBall: 0,
		_pokeballs: {
			alreadyCaughtShinySelection: App.game.pokeballs.alreadyCaughtShinySelection,
			alreadyCaughtSelection: App.game.pokeballs.alreadyCaughtSelection
		},
		_currentQuest: {},

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
			clearInterval(this.interval.pop());
		}

	}
	Autopoke.quests = AutoQuests;

	App.game.pokeballs._alreadyCaughtSelection.subscribe(function (newValue) {
		if (!((Autopoke.quests._currentQuest instanceof UsePokeballQuest) ||
			(Autopoke.quests._currentQuest instanceof CapturePokemonsQuest) ||
			(Autopoke.quests._currentQuest instanceof GainTokensQuest) ||
			((Autopoke.quests._currentQuest instanceof UseOakItemQuest) && Autopoke.quests._currentQuest.item === 0))) {
			Autopoke.quests._pokeballs.alreadyCaughtSelection = newValue;
		}
	});
	App.game.pokeballs._alreadyCaughtShinySelection.subscribe(function (newValue) {
		if (!(Autopoke.quests._currentQuest instanceof CatchShiniesQuest)) {
			Autopoke.quests._pokeballs.alreadyCaughtShinySelection = newValue;
		}
	});

})();