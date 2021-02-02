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
				
				if (!(this._currentQuest instanceof GainShardsQuest)) {
					this._mostEfficientPlace=[];
				}
				
				switch (this._currentQuest.constructor) {
					case BuyPokeballsQuest:
						var itemName = GameConstants.Pokeball[this._currentQuest.pokeball];
						var towns = this.helpFunctions.getAvailableShopsByItemName(itemName);
						var item = towns[0].shop.items.filter(item => item.name==itemName)[0];
						if (App.game.wallet.hasAmount(new Amount(item.totalPrice(this._currentQuest.amount), item.currency))&&this._autoMove) {
							MapHelper.moveToTown(towns[0].name)
							item.buy(this._currentQuest.amount);					
						}
						else {
							Console.log("Need more gold before buying "+this._currentQuest.amount+" "+itemName+" or autoMove is false");
							Console.log("Missing "+item.totalPrice(this._currentQuest.amount)-App.game.wallet.currencies[item.currency]());
						}
						break;
					case DefeatDungeonQuest:
					
						if (App.game.gameState==4) {
							return;
						}					
						if(Autopoke.dungeon!==undefined) {
							
							if(this.helpFunctions.betterAccessToTown(this._currentQuest.dungeon) && App.game.wallet.hasAmount(new Amount(dungeonList[this._currentQuest.dungeon].tokenCost, GameConstants.Currency.dungeonToken))&&this._autoMove) {
								Autopoke.dungeon._runs=1;
								MapHelper.moveToTown(this._currentQuest.dungeon);
								DungeonRunner.initializeDungeon(player.town().dungeon);
								
							}
							else {
								console.log("Not enoght tokens or no access to the dungeon or autoMove is false");								
							}
						}						
						else {
							console.log("Missing dungeon module");			
						}						
						break;
					case DefeatGymQuest:
					
						if (App.game.gameState==3) {
							return;
						}					
						if(this.helpFunctions.betterAccessToTown(TownList[this._currentQuest.gymTown].name)&&this._autoMove) {
							if(Autopoke.gym!==undefined) {
								Autopoke.gym._runs=1;
							}
							MapHelper.moveToTown(TownList[this._currentQuest.gymTown].name);
							GymRunner.startGym(gymList[this._currentQuest.gymTown]);
							
						}
						else {
							console.log("Not enoght tokens or no access to dungeon or autoMove is false");								
						}						
					
						break;
					case UsePokeballQuest:
					case GainTokensQuest:
					case CatchShiniesQuest:
					case CapturePokemonsQuest:
					case GainMoneyQuest:
					
					var itemName =""
					var buyAmount=100;
					
						if(this._currentQuest instanceof UsePokeballQuest) {
							App.game.pokeballs._alreadyCaughtSelection(this._currentQuest.pokeball);
							itemName = GameConstants.Pokeball[this._currentQuest.pokeball];
							buyAmount = (this._currentQuest.focus()-this._currentQuest.initial()+this._currentQuest.amount);
						}									
						else if(this._currentQuest instanceof CapturePokemonsQuest) {
							App.game.pokeballs._alreadyCaughtSelection(this._captureBall);
							itemName = GameConstants.Pokeball[this._captureBall];
							buyAmount=(this._currentQuest.focus()-this._currentQuest.initial()+this._currentQuest.amount)*2;	
						}
						else if(this._currentQuest instanceof GainTokensQuest) {
							App.game.pokeballs._alreadyCaughtSelection(this._captureBall);
							itemName = GameConstants.Pokeball[this._captureBall];	
						}
						 
						else if(this._currentQuest instanceof CatchShiniesQuest) {
							App.game.pokeballs._alreadyCaughtShinySelection(this._captureShinyBall);
							itemName = GameConstants.Pokeball[this._captureShinyBall];
							buyAmount=(this._currentQuest.focus()-this._currentQuest.initial()+this._currentQuest.amount)*10;	
						}
						if (itemName!="") {
							if (App.game.pokeballs.getBallQuantity(GameConstants.Pokeball[itemName])==0) {
								var towns = this.helpFunctions.getAvailableShopsByItemName(itemName);
								var item = towns[0].shop.items.filter(item => item.name==itemName)[0];
								if (App.game.wallet.hasAmount(new Amount(item.totalPrice(buyAmount), item.currency))&&this._autoMove) {
									MapHelper.moveToTown(towns[0].name)
									item.buy(buyAmount);					
								}
								else {
									console.log("All out of Balls and cant affort them or autoMove is false");									
								}
							}
						}
						var route=0;
						if (Autopoke.clicking.interval.length!=0) {
							route = this.helpFunctions.highestAvailableOneClickRoute();
							if (route==0) {
								console.log("no route that are one tappable is accessable");
							}
						}
						if (route==0) {
							route = this.helpFunctions.highestAvailableOneShotRoute();
							if (route==0) {
								console.log("no oneshot routes available");
							}
						}
						if (route!=1&&this._autoMove) {
							MapHelper.moveToRoute(route[1],route[0]);
						}
						break;
						
					case DefeatPokemonsQuest:
							var route = [this._currentQuest.region,this._currentQuest.route];
							if(MapHelper.accessToRoute(route[1],route[0])&&(this.helpFunctions.latestDockUnlocked()?route[0]<=player.highestRegion():route[0]==player.highestRegion())&&this._autoMove) {
								MapHelper.moveToRoute(route[1],route[0]);
							}
							else {
								console.log("route is not available or autoMove is false");
							}					
						break;
						
					case GainShardsQuest:
						if (this._mostEfficientPlace.length==0) {
							this._mostEfficientPlace=this.helpFunctions.mostEfficientPlaceForShardType(this._currentQuest.type);
						}
						if (typeof this._mostEfficientPlace === "string") {
							if (App.game.gameState==3) {
								return;
							}					
							if(this.helpFunctions.betterAccessToTown(this._mostEfficientPlace)&&this._autoMove) {
								if(Autopoke.gym!==undefined) {
									Autopoke.gym._runs=1;
								}
								MapHelper.moveToTown(this._mostEfficientPlace);
								GymRunner.startGym(gymList[this._mostEfficientPlace]);
							
							}
							else {
								console.log("Not enoght tokens or no access to dungeon or autoMove is false");								
							}	
							
						}
						else {
							var route=this._mostEfficientPlace;
							MapHelper.moveToRoute(route[1],route[0]);
							
						}
					
						break;					
					case HarvestBerriesQuest:
						if(Autopoke.farming!==undefined) {
							if(Autopoke.farming.berry.type!=this._currentQuest.berryType&&Autopoke.farming.interval.length!=0) {
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
							if (r==0 || Autopoke.clicking===undefined) {
								var r = this.helpFunctions.highestAvailableOneShotRoute();
								if(r!=0) {
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
						if(Autopoke.underground!==undefined) {
													
						}
						else {
							console.log("Enable underground module please");	
						}					
						break;
					case UseOakItemQuest:
						oakItem = this._currentQuest.item;
						if (!App.game.oakItems.isActive(oakItem)) {
							App.game.oakItems.deactivate(App.game.oakItems.itemList.find(p => p.isActive&&p.name!=oakItem).name);
							App.game.oakItems.activate(oakItem);
						}
						switch (oakItem) {
							case OakItems.OakItem.Magic_Ball:
								App.game.pokeballs._alreadyCaughtSelection(this._captureBall);
								var itemName = GameConstants.Pokeball[this._captureBall];
								var buyAmount = (this._currentQuest.focus() - this._currentQuest.initial());
								if (itemName!="") {
									if (App.game.pokeballs.getBallQuantity(GameConstants.Pokeball[itemName])==0) {
										var towns = this.helpFunctions.getAvailableShopsByItemName(itemName);
										var item = towns[0].shop.items.filter(item => item.name==itemName)[0];
										if (App.game.wallet.hasAmount(new Amount(item.totalPrice(buyAmount), item.currency))&&this._autoMove) {
											MapHelper.moveToTown(towns[0].name)
											item.buy(buyAmount);					
										}
										else {
											console.log("All out of Balls and cant affort them or autoMove is false");									
										}
									}
								}							
							case OakItems.OakItem.Amulet_Coin:
							case OakItems.OakItem.Exp_Share:
								var route=0;
								if (this._highestClicking) {
									route = this.helpFunctions.highestAvailableOneClickRoute();
									if (route==0) {
										console.log("no route that are one tappable is accessable");
									}
								}
								if (route==0) {
									route = this.helpFunctions.highestAvailableOneShotRoute();
									if (route==0) {
										console.log("no oneshot routes available");
									}
								}
								if (route!=1&&this._autoMove) {
									MapHelper.moveToRoute(route[1],route[0]);
								}
								break;
						}					
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
				return shops.filter(town => this.betterAccessToTown(town.name));
			},
			latestDockUnlocked: function() {
				return TownList[GameConstants.DockTowns[player.highestRegion()]].isUnlocked();		
			},
			betterAccessToTown: function(townName) {
				var town = TownList[townName];
				return this.latestDockUnlocked()?town.isUnlocked():(town.isUnlocked()&&(town.region==player.highestRegion))
			},
			highestAvailableOneShotRoute: function() {
				const routes = Routes.regionRoutes.map(r => [r.region,r.number]).filter(r => MapHelper.accessToRoute(r[1],r[0])&&(this.latestDockUnlocked()?r[0]<=player.highestRegion():r[0]==player.highestRegion()));
				const found = routes.reverse().find(r => PokemonFactory.routeHealth(r[1], r[0]) < Math.max(1, App.game.party.calculatePokemonAttack(PokemonType.None, PokemonType.None, false, r[0], true, false, false)));
				return found || 0;
			},
			highestAvailableOneClickRoute: function() {
				const routes = Routes.regionRoutes.map(r => [r.region,r.number]).filter(r => MapHelper.accessToRoute(r[1],r[0])&&(this.latestDockUnlocked()?r[0]<=player.highestRegion():r[0]==player.highestRegion()));
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
				let routeShards = this.routeShardsRateForType(type)
				let gymShards = this.gymShardsRateForType(type)
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
		_mostEfficientPlace: [],
		_autoMove: true,
		_captureShinyBall: 2,
		_captureBall: 0,
		_pokeballs: {
			alreadyCaughtShinySelection: App.game.pokeballs.alreadyCaughtShinySelection,
			alreadyCaughtSelection:App.game.pokeballs.alreadyCaughtSelection			
		},
		_highestClicking: true,
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

	App.game.pokeballs._alreadyCaughtSelection.subscribe(function(newValue) {
		if (!((Autopoke.quests._currentQuest instanceof UsePokeballQuest) ||
			  (Autopoke.quests._currentQuest instanceof CapturePokemonsQuest) ||
			  (Autopoke.quests._currentQuest instanceof GainTokensQuest) || 
			  ((Autopoke.quests._currentQuest instanceof UseOakItemQuest)&& Autopoke.quests._currentQuest.item==0))) {
			Autopoke.quests._pokeballs.alreadyCaughtSelection = newValue;
		}
	});
	App.game.pokeballs._alreadyCaughtShinySelection.subscribe(function(newValue) {
		if (!(Autopoke.quests._currentQuest instanceof CatchShiniesQuest)) {
			Autopoke.quests._pokeballs.alreadyCaughtShinySelection = newValue;
		}
	});
	
})();