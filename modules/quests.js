//Auto Quests

if (!Autopoke) var Autopoke={};

(function() {
	
	const AutoQuests = {
		
		interval:[],
		intervalFunction: function() {
			return setInterval(() => {				
			
			
				
				//Try to claim Quests
				App.game.quests.currentQuests().filter(quest => quest.isCompleted()).forEach(quest => App.game.quests.claimQuest(quest.index));
				
				App.game.pokeballs.alreadyCaughtSelection=this._pokeballs.alreadyCaughtSelection;
				App.game.pokeballs.alreadyCaughtShinySelection=this._pokeballs.alreadyCaughtShinySelection;
				
				//If Questslots Start new quests
				while (App.game.quests.currentQuests().length<App.game.quests.questSlots()&&App.game.quests.incompleteQuests().length>0) {
					App.game.quests.beginQuest(App.game.quests.incompleteQuests()[0].index);
				}
				
				
				
				//Get quest and depending on what quest do stuff
				this._currentQuest=App.game.quests.currentQuests()[0];
				
				switch (this._currentQuest.constructor) {
					case BuyPokeballsQuest:
						var itemName = GameConstants.Pokeball[this_currentQuest.pokeball];
						var towns = this.getAvailableShopsByItemName(itemName);
						var item = towns[0].shop.items.filter(item => item.name==itemName)[0];
						if (App.game.wallet.hasAmount(new Amount(item.totalPrice(this._currentQuest.amount), item.currency))) {
							MapHelper.moveToTown(towns[0].name)
							item.buy(this._currentQuest.amount);					
						}
						else {
							Console.log("Need more gold before buying "+this._currentQuest.amount+" "+itemName);
							Console.log("Missing "+item.totalPrice(this._currentQuest.amount)-App.game.wallet.currencies[item.currency]())
						}
						break;
					case DefeatDungeonQuest:
					
						if (App.game.gameState==4) {
							return;
						}					
						if(Autopoke.dungeon!==undefined) {
							
							if(this.betterAccessToTown(this._currentQuest.dungeon.name) && App.game.wallet.hasAmount(new Amount(this._currentQuest.dungeon.tokenCost, GameConstants.Currency.dungeonToken))) {
								Autopoke.dungeon._runs=1;
								MapHelper.moveToTown(this._currentQuest.dungeon.name);
								DungeonRunner.initializeDungeon(player.town().dungeon);
								
							}
							else {
								console.log("Not enoght tokens or no access to dungeon");								
							}
						}						
						else {
							console.log("Missing dungeon module");			
						}						
						break;
					case DefeatGymQuests:
					
						if (App.game.gameState==3) {
							return;
						}					
						if(this.betterAccessToTown(this._currentQuest.gymTown.name)) {
							if(Autopoke.gym!==undefined) {
								Autopoke.gym._runs=1;
							}
							MapHelper.moveToTown(this._currentQuest.gymTown.name);
							GymRunner.startGym(this._currentQuest.gymTown.gym);
							
						}
						else {
							console.log("Not enoght tokens or no access to dungeon");								
						}						
					
						break;
					case DefeatPokemonsQuest:
					case GainMoneyQuest:
					case UsePokeballQuest:
					case GainTokenQuest:
					case CatchShiniesQuest:
					case CapturePokemonsQuest:
					
					
						var r = this.helpFunctions.highestAvailableOneShotRoute();
						MapHelper.moveToRoute(r[1],r[0]);
					
						if(this._currentQuest instanceof UsePokeballQuest) {
							this._pokeballs.alreadyCaughtSelection=App.game.pokeballs.alreadyCaughtSelection;
							App.game.pokeballs.alreadyCaughtSelection=this._currentQuest.pokeball;
							if (App.game.pokeballs.getBallQuantity(this._currentQuest.pokeball)==0) {
								var itemName = GameConstants.Pokeball[this_currentQuest.pokeball];
								var towns = this.getAvailableShopsByItemName(itemName);
								var item = towns[0].shop.items.filter(item => item.name==itemName)[0];
								if (App.game.wallet.hasAmount(new Amount(item.totalPrice(this._currentQuest.amount-this._currentQuest.progress()), item.currency))) {
									MapHelper.moveToTown(towns[0].name)
									item.buy(this._currentQuest.amount-this._currentQuest.progress());					
								}
								else {
									console.log("All out of Balls and cant affort them");									
								}
							}							
						}						
						else if(this._currentQuest instanceof CapturePokemonsQuest || this._currentQuest instanceof GainTokenQuest) {
							this._pokeballs.alreadyCaughtSelection=App.game.pokeballs.alreadyCaughtSelection;
							App.game.pokeballs.alreadyCaughtSelection=this._captureBall;
							if (App.game.pokeballs.getBallQuantity(this._captureBall)==0) {
								var itemName = GameConstants.Pokeball[this._captureBall];
								var towns = this.getAvailableShopsByItemName(itemName);
								var item = towns[0].shop.items.filter(item => item.name==itemName)[0];
								if (App.game.wallet.hasAmount(new Amount(item.totalPrice((this._currentQuest.amount-this._currentQuest.progress())*2), item.currency))) {
									MapHelper.moveToTown(towns[0].name)
									item.buy((this._currentQuest.amount-this._currentQuest.progress())*2);					
								}
								else {
									console.log("All out of Balls and cant affort them");									
								}
							}		
						}
						else if(this._currentQuest instanceof CatchShiniesQuest) {
							this._pokeballs.alreadyCaughtShinySelection=App.game.pokeballs.alreadyCaughtShinySelection;
							App.game.pokeballs.alreadyCaughtShinySelection=this._captureShinyBall;
							if (App.game.pokeballs.getBallQuantity(this._captureShinyBall)==0) {
								var itemName = GameConstants.Pokeball[this._captureShinyBall];
								var towns = this.getAvailableShopsByItemName(itemName);
								var item = towns[0].shop.items.filter(item => item.name==itemName)[0];
								if (App.game.wallet.hasAmount(new Amount(item.totalPrice((this._currentQuest.amount-this._currentQuest.progress())*2), item.currency))) {
									MapHelper.moveToTown(towns[0].name)
									item.buy((this._currentQuest.amount-this._currentQuest.progress())*2);					
								}
								else {
									console.log("All out of Balls and cant affort them");									
								}
							}		
						}
						
						var r = this.helpFunctions.highestAvailableOneShotRoute();
						if(r==0) {
							MapHelper.moveToRoute(r[1],r[0]);
						}
						break;
					case GainShardsQuest:
						Console.log("GainShards NYI");
					
						break;					
					case HarvestBerriesQuest:
						if(Autopoke.farming!==undefined) {
							if(Autopoke.farming.berry.type==this._currentQuest.berryType&&Autopoke.farming.interval!=[]) {
								Autopoke.farming.berry=BerryType[this._currentQuest.berryType];
							}							
						}
						else {
							console.log("Enable farming module please");
						}					
						break;
					case HatchEggsQuest:
						if(Autopoke.breeding!==undefined) {
							var r = this.helpFunctions.highestAvailableOneClickRoute();
							if (r==0) {
								var r = this.helpFunctions.highestAvailableOneShotRoute();
								if(r==0) {
									MapHelper.moveToRoute(r[1],r[0]);
								}
							}
							else {
								MapHelper.moveToRoute(r[1],r[0]);
							}
						}
						else {
							console.log("Enable breeding module please");
						}					
						break;
					case MineLayersQuest:
						if(Autopoke.breeding!==undefined) {
													
						}
						else {
							console.log("Enable underground module please");	
						}					
						break;
					case UseOakItemQuest:
						console.log("OakItemQuest NYI");
					
					break;
				}
				
				
				
				
			}, this.intervalTime);
		},
		helpFunctions: {
			getAvailableShopsByItemName: function(itemName) {
				const shops = [];
				Object.entries(TownList).forEach(([townName, town]) => {
					if (town.shop && town.shop.items) {
						const hasItem = town.shop.items.find(item => item!==undefined?item.name == itemName:false);
						if (hasItem) {
							shops.push(town);
						}
					}
				});
				return shops.filter(town => betterAccessToTown(town.name));
			},
			latestDockUnlocked: function() {
				return TownList[GameConstants.DockTowns[player.highestRegion()]].isUnlocked();		
			},
			betterAccessToTown: function(townName) {
				var town = TownList[townName];
				return latestDockUnlocked()?town.isUnlocked():(town.isUnlocked()&&(town.region==player.highestRegion))
			},
			highestAvailableOneShotRoute: function() {
				const routes = Routes.regionRoutes.map(r => [r.region,r.number]).filter(r => MapHelper.accessToRoute(r[1],r[0])&&(latestDockUnlocked()?r[0]<=player.highestRegion():r[0]==player.highestRegion()));
				const found = routes.reverse().find(r => PokemonFactory.routeHealth(r[1], r[0]) < Math.max(1, App.game.party.calculatePokemonAttack(PokemonType.None, PokemonType.None, false, r[0], true, false, false)));
				return found || 0;
			},
			highestAvailableOneClickRoute: function() {
				const routes = Routes.regionRoutes.map(r => [r.region,r.number]).filter(r => MapHelper.accessToRoute(r[1],r[0])&&(latestDockUnlocked()?r[0]<=player.highestRegion():r[0]==player.highestRegion()));
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
				let availableRoutes = Routes.regionRoutes.filter(r =>
					MapHelper.accessToRoute(r.number, r.region) &&
					(this.latestDockUnlocked ? r.region <= player.highestRegion() : r.region === player.highestRegion())
				)
				return availableRoutes.map(r => [
					[r.region, r.number],
					Object.values(r.pokemon).flat()
						.map(p => PokemonHelper.getPokemonByName(p))
						.filter(p => p.type1 === type || p.type2 === type).length / Object.values(r.pokemon).flat().length
				]).filter(r => r[1] > 0)
			},
			mostEfficientPlaceForShardType: function (type) {
				let average = (ls) => ls.reduce((a, b) => a + b, 0) / ls.length
				let routeShards = routeShardsRateForType(type)
				let gymShards = gymShardsRateForType(type)
				let routeShardsPerSec = routeShards.map(r => {
					let [[region, route], rate] = r
					let pokemon = Object.values(Routes.getRoute(region, route).pokemon).flat().map(p => PokemonHelper.getPokemonByName(p))
					let hits = pokemon.map(p => App.game.party.calculatePokemonAttack(p.type1, p.type2))
						.map(d => Math.ceil(PokemonFactory.routeHealth(route, region) / d))
					let clicks = pokemon.map(p => App.game.party.calculateClickAttack())
						.map(d => Math.ceil(PokemonFactory.routeHealth(route, region) / d))
					return [[region, route], rate / Math.min(average(hits), average(clicks) / 20)]
				})
				let gymShardsPerSec = gymShards.map(r => {
					let [gym, rate] = r
					let hits = gymList[gym].pokemons.map(p => {
						let poke = PokemonHelper.getPokemonByName(p.name)
						return Math.ceil(p.maxHealth / App.game.party.calculatePokemonAttack(poke.type1, poke.type2))
					})
					let clicks = gymList[gym].pokemons.map(p => Math.ceil(p.maxHealth / App.game.party.calculateClickAttack()))
					return [gym, rate / Math.min(average(hits), average(clicks) / 20)]
				})

				let bestRoute = routeShardsPerSec.sort((r1, r2) => r2[1] - r1[1])[0]
				let bestGym = gymShardsPerSec.sort((r1, r2) => r2[1] - r1[1])[0]
				return bestGym[1] > bestRoute[1] ? bestGym[0] : bestRoute[0]
			},

		},
		_captureShinyBall: 2,
		_captureBall: 0,
		_pokeballs: {
			alreadyCaughtShinySelection: App.game.pokeballs.alreadyCaughtShinySelection,
			alreadyCaughtSelection:App.game.pokeballs.alreadyCaughtSelection			
		},
		_shardLocations: [],
		_currentQuest: {},
		
		_intervalTime: 100,
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
	Autopoke.quests = AutoQuests;
	
})();

