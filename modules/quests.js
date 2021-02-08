//Auto Quests

if (!Autopoke) var Autopoke = {};

(function () {
  let AQ = App.game.quests;

  Autopoke.quests = {
    interval: [],
    intervalFunction: function () {
      return setInterval(() => {
        //Try to claim Quests
        let nowCompleted = AQ.currentQuests().filter((quest) =>
          quest.isCompleted()
        );
        if (nowCompleted.length > 0) {
          nowCompleted.forEach((X) => AQ.claimQuest(X.index));
          this._firstRun = true;
        }

        let failsafe = 0; //fixes infinite loop while gaining new questslot
        let newQuestAdded = false;
        //If Questslots Start new quests
        while (AQ.canStartNewQuest() && failsafe < 10) {
          let nextQuest = AQ.questList().find(
            (quest) => !quest.isCompleted() && !quest.inProgress()
          );
          if (nextQuest) {
            AQ.beginQuest(nextQuest.index);
            newQuestAdded = true;
          }
          failsafe++;
        }

        if (!newQuestAdded && !this._firstRun) {
          return;
        }
        this._firstRun = false;
        App.game.pokeballs.alreadyCaughtSelection = this._pokeballs.alreadyCaughtSelection;
        App.game.pokeballs.alreadyCaughtShinySelection = this._pokeballs.alreadyCaughtShinySelection;

        //some quest optimization
        let shardQuest = false;
        let useBallQuest = false;
        this._highestPrio = 0;

        for (let i = 0; i < AQ.currentQuests().length; i++) {
          let index = this._questPriorityList.indexOf(
            AQ.currentQuests()[i].constructor.name
          );
          this._highestPrio =
            index > this._highestPrio ? index : this._highestPrio;
          if (this._currentQuest instanceof GainShardsQuest) {
            shardQuest = true;
          }
          if (this._currentQuest instanceof UsePokeballQuest) {
            useBallQuest = true;
          }
        }
        if (!shardQuest) {
          this._mostEfficientPlace = [];
        }
        let route;
        let itemName = "";
        let setBalls = false;
        for (let i = 0; i < AQ.currentQuests().length; i++) {
          this._currentQuest = AQ.currentQuests()[i];

          switch (this._currentQuest.constructor) {
            case BuyPokeballsQuest:
              itemName = GameConstants.Pokeball[this._currentQuest.pokeball];
              this.helpFunctions.restockItem(
                itemName,
                this._currentQuest.amount,
                9999999999
              );
              break;
            case DefeatDungeonQuest:
              if (App.game.gameState === 4) {
                return;
              }
              if (Autopoke.dungeon !== undefined) {
                if (
                  this.helpFunctions.betterAccessToTown(
                    this._currentQuest.dungeon
                  ) &&
                  App.game.wallet.hasAmount(
                    new Amount(
                      dungeonList[this._currentQuest.dungeon].tokenCost,
                      GameConstants.Currency.dungeonToken
                    )
                  ) &&
                  this._autoMove &&
                  this._highestPrio ===
                    this._questPriorityList.indexOf(
                      this._currentQuest.constructor.name
                    )
                ) {
                  Autopoke.dungeon._runs =
                    this._currentQuest.amount -
                    (this._currentQuest.focus() - this._currentQuest.initial());
                  MapHelper.moveToTown(this._currentQuest.dungeon);
                  player.region = player.town().region;
                  DungeonRunner.initializeDungeon(player.town().dungeon);
                }
              }
              break;
            case DefeatGymQuest:
              if (App.game.gameState === 3) {
                return;
              }
              if (
                this.helpFunctions.betterAccessToTown(
                  TownList[this._currentQuest.gymTown].name
                ) &&
                this._autoMove &&
                this._highestPrio ===
                  this._questPriorityList.indexOf(
                    this._currentQuest.constructor.name
                  )
              ) {
                if (Autopoke.gym !== undefined) {
                  Autopoke.gym._runs =
                    this._currentQuest.amount -
                    (this._currentQuest.focus() - this._currentQuest.initial());
                }
                MapHelper.moveToTown(TownList[this._currentQuest.gymTown].name);
                player.region = player.town().region;
                GymRunner.startGym(gymList[this._currentQuest.gymTown]);
              }
              break;
            case UsePokeballQuest:
            case GainTokensQuest:
            case CatchShiniesQuest:
            case CapturePokemonsQuest:
              if (!setBalls) {
                this._pokeballs.alreadyCaughtSelection = App.game.pokeballs._alreadyCaughtSelection();
                this._pokeballs.alreadyCaughtShinySelection = App.game.pokeballs._alreadyCaughtShinySelection();
                setBalls = true;
              }

              itemName = "";
              let buyAmount = 100;

              if (
                this._currentQuest instanceof UsePokeballQuest ||
                useBallQuest
              ) {
                App.game.pokeballs._alreadyCaughtSelection(
                  this._currentQuest.pokeball
                );
                itemName = GameConstants.Pokeball[this._currentQuest.pokeball];
                buyAmount =
                  this._currentQuest.amount -
                  (this._currentQuest.focus() - this._currentQuest.initial());
              } else if (this._currentQuest instanceof CapturePokemonsQuest) {
                App.game.pokeballs._alreadyCaughtSelection(this._captureBall);
                itemName = GameConstants.Pokeball[this._captureBall];
                buyAmount =
                  this._currentQuest.amount -
                  (this._currentQuest.focus() - this._currentQuest.initial()) *
                    2;
              } else if (this._currentQuest instanceof GainTokensQuest) {
                App.game.pokeballs._alreadyCaughtSelection(this._captureBall);
                itemName = GameConstants.Pokeball[this._captureBall];
              }
              if (this._currentQuest instanceof CatchShiniesQuest) {
                App.game.pokeballs._alreadyCaughtShinySelection(
                  this._captureShinyBall
                );
                itemName = GameConstants.Pokeball[this._captureShinyBall];
                buyAmount =
                  this._currentQuest.amount -
                  (this._currentQuest.focus() - this._currentQuest.initial()) *
                    10;
              }
              if (itemName !== "") {
                this.helpFunctions.restockItem(itemName, buyAmount);
              }
            case GainMoneyQuest:
              this.helpFunctions.moveToHighestOneshotRoute(
                this,
                this._currentQuest,
                false
              );
              break;

            case DefeatPokemonsQuest:
              route = [this._currentQuest.route, this._currentQuest.region];
              if (
                this.helpFunctions.accessToRoute(...route) &&
                this._autoMove &&
                this._highestPrio ===
                  this._questPriorityList.indexOf(
                    this._currentQuest.constructor.name
                  )
              ) {
                MapHelper.moveToRoute(...route);
              }
              break;
            case GainShardsQuest:
              if (this._mostEfficientPlace.length === 0) {
                this._mostEfficientPlace = this.helpFunctions.mostEfficientPlaceForShardType(
                  this._currentQuest.type
                );
              }
              if (typeof this._mostEfficientPlace[0] === "string") {
                if (App.game.gameState === 3) {
                  return;
                }
                if (
                  this.helpFunctions.betterAccessToTown(
                    this._mostEfficientPlace[0]
                  ) &&
                  this._autoMove &&
                  this._highestPrio ===
                    this._questPriorityList.indexOf(
                      this._currentQuest.constructor.name
                    )
                ) {
                  if (Autopoke.gym !== undefined) {
                    Autopoke.gym._runs = Math.ceil(
                      (this._currentQuest.amount -
                        (this._currentQuest.focus() -
                          this._currentQuest.initial())) /
                        (this.helpFunctions
                          .gymShardsRateForType(this._currentQuest.type)
                          .find((X) => X[0] === this._mostEfficientPlace[0])[1] *
                          gymList[this._mostEfficientPlace[0]].pokemons.length)
                    );
                  }
                  MapHelper.moveToTown(this._mostEfficientPlace[0]);
                  player.region = player.town().region;
                  GymRunner.startGym(gymList[this._mostEfficientPlace[0]]);
                }
              } else {
                let route = this._mostEfficientPlace[0];
                if (
                  this._autoMove &&
                  this._highestPrio ===
                    this._questPriorityList.indexOf(
                      this._currentQuest.constructor.name
                    )
                ) {
                  MapHelper.moveToRoute(route[1], route[0]);
                }
              }

              break;
            case HarvestBerriesQuest:
              if (Autopoke.farming !== undefined) {
                if (
                  Autopoke.farming.berry.type !==
                    this._currentQuest.berryType &&
                  Autopoke.farming.interval.length !== 0
                ) {
                  Autopoke.farming.berry =
                    BerryType[this._currentQuest.berryType];
                }
              }
              this.helpFunctions.moveToHighestOneshotRoute(
                this,
                this._currentQuest
              );
              break;
            case HatchEggsQuest:
              if (Autopoke.breeding !== undefined) {
              }
              this.helpFunctions.moveToHighestOneshotRoute(
                this,
                this._currentQuest
              );
              break;
            case MineLayersQuest:
              if (Autopoke.underground !== undefined) {
              }
              this.helpFunctions.moveToHighestOneshotRoute(
                this,
                this._currentQuest
              );
              break;
            case UseOakItemQuest:
              let oakItem = this._currentQuest.item;
              if (!App.game.oakItems.isActive(oakItem)) {
                if (!App.game.oakItems.hasAvailableSlot()) {
                  App.game.oakItems.deactivate(
                    App.game.oakItems.itemList.find(
                      (p) => p.isActive && p.name !== oakItem
                    ).name
                  );
                }
                App.game.oakItems.activate(oakItem);
              }
              switch (oakItem) {
                case OakItems.OakItem.Magic_Ball:
                  if (!setBalls) {
                    this._pokeballs.alreadyCaughtSelection = App.game.pokeballs._alreadyCaughtSelection();
                    this._pokeballs.alreadyCaughtShinySelection = App.game.pokeballs._alreadyCaughtShinySelection();
                    setBalls = true;
                  }
                  if (!useBallQuest) {
                    App.game.pokeballs._alreadyCaughtSelection(
                      this._captureBall
                    );
                  }
                  let itemName = GameConstants.Pokeball[this._captureBall];
                  let buyAmount =
                    this._currentQuest.amount -
                    this._currentQuest.focus() +
                    this._currentQuest.initial();
                  if (itemName !== "") {
                    this.helpFunctions.restockItem(itemName, buyAmount);
                  }
                case OakItems.OakItem.Amulet_Coin:
                case OakItems.OakItem.Exp_Share:
                  this.helpFunctions.moveToHighestOneshotRoute(
                    this,
                    this._currentQuest
                  );
                  break;
              }
              break;
          }
        }
      }, this.intervalTime);
    },
    helpFunctions: {
      restockItem: function (itemName, amount = 100, min = 0) {
        if (itemName === undefined) {
          return;
        }
        if (GameConstants.Pokeball[itemName] !== undefined) {
          min =
            min -
            App.game.pokeballs.getBallQuantity(
              GameConstants.Pokeball[itemName]
            );
        }
        if (player.itemList[itemName]() <= min) {
          let towns = Autopoke.quests.helpFunctions.getAvailableShopsByItemName(
            itemName
          );
          let item = towns[0].shop.items.filter(
            (item) => item.name === itemName
          )[0];
          if (
            App.game.wallet.hasAmount(
              new Amount(item.totalPrice(amount), item.currency)
            ) &&
            Autopoke.quests._autoMove
          ) {
            let tempRoute = [player.route(), player.region];
            if (towns[0].name !== "Poké Mart") {
              MapHelper.moveToTown(towns[0].name);
              if (tempRoute[0]!==0) {
				  player.region = player.town().region;
			  }
            }
            item.buy(amount);
            MapHelper.moveToRoute(...tempRoute);
          }
        }
      },
      moveToHighestOneshotRoute: function (self, quest, couldClick = true) {
        if (
          !(
            self._autoMove &&
            self._highestPrio ===
              self._questPriorityList.indexOf(quest.constructor.name)
          )
        ) {
          return;
        }
        let route = 0;
        if (Autopoke.clicking !== undefined) {
          if (Autopoke.clicking.interval.length !== 0 && couldClick) {
            route = self.helpFunctions.highestAvailableOneClickRoute();
          }
        }
        if (route === 0) {
          route = self.helpFunctions.highestAvailableOneShotRoute();
        }
        if (route !== 1) {
          MapHelper.moveToRoute(route[1], route[0]);
        }
      },
      getAvailableShopsByItemName: function (itemName) {
        const shops = [];
        Object.entries(TownList).forEach(([, town]) => {
          if (town.shop && town.shop.items) {
            const hasItem = town.shop.items.find((item) =>
              item !== undefined ? item.name === itemName : false
            );
            if (hasItem) {
              shops.push(town);
            }
          }
        });
        shops.unshift({ shop: pokeMartShop, name: "Poké Mart" });

        return shops.filter((town) => this.betterAccessToTown(town.name));
      },
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
        if (townName === "Poké Mart") {
          return App.game.statistics.gymsDefeated[
            GameConstants.getGymIndex("Champion Lance")
          ]();
        }
        const town = TownList[townName];
        return this.latestDockUnlocked()
          ? town.isUnlocked() && town.region <= player.highestRegion()
          : town.isUnlocked() && town.region === player.highestRegion();
      },
      highestAvailableOneShotRoute: function () {
        const routes = Routes.regionRoutes
          .map((r) => [r.region, r.number])
          .filter((r) => this.accessToRoute(r[1], r[0]));
        const found = routes
          .reverse()
          .find(
            (r) =>
              PokemonFactory.routeHealth(r[1], r[0]) <
              Math.max(
                1,
                App.game.party.calculatePokemonAttack(
                  PokemonType.None,
                  PokemonType.None,
                  false,
                  r[0],
                  true,
                  false,
                  false
                )
              )
          );
        return found || 0;
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
      gymShardsRateForType: function (type) {
        return Object.values(gymList)
          .filter((g) => Gym.isUnlocked(g) && this.betterAccessToTown(g.town))
          .map((g) => [
            g.town,
            type === -1
              ? 1
              : (g.pokemons
                  .map((p) => PokemonHelper.getPokemonByName(p.name))
                  .filter((p) => p.type1 === type || p.type2 === type).length /
                  g.pokemons.length) *
                GameConstants.GYM_SHARDS,
          ])
          .filter((r) => r[1] > 0);
      },
      routeShardsRateForType: function (type) {
        let availableRoutes = Routes.regionRoutes.filter((r) =>
          this.accessToRoute(r.number, r.region)
        );
        return availableRoutes
          .map((r) => [
            [r.region, r.number],
            type === -1
              ? 1
              : Object.values(r.pokemon)
                  .flat()
                  .map((p) => PokemonHelper.getPokemonByName(p))
                  .filter((p) => p.type1 === type || p.type2 === type).length /
                Object.values(r.pokemon).flat().length,
          ])
          .filter((r) => r[1] > 0);
      },
      routeCalculatePerSec: function (routes) {
        let average = (ls) => ls.reduce((a, b) => a + b, 0) / ls.length;
        return routes.map((r) => {
          let [[region, route], rate] = r;
          let pokemon = Object.values(Routes.getRoute(region, route).pokemon)
            .flat()
            .map((p) => PokemonHelper.getPokemonByName(p));
          let hits = pokemon
            .map((p) => App.game.party.calculatePokemonAttack(p.type1, p.type2))
            .map((d) =>
              Math.ceil(PokemonFactory.routeHealth(route, region) / d)
            );
          let clicks = pokemon
            .map(() => App.game.party.calculateClickAttack())
            .map((d) =>
              Math.ceil(PokemonFactory.routeHealth(route, region) / d)
            );
          return [
            [region, route],
            rate / Math.min(average(hits), average(clicks) / 20),
          ];
        });
      },
      gymCalculatePerSec: function (gyms) {
        let average = (ls) => ls.reduce((a, b) => a + b, 0) / ls.length;
        return gyms.map((r) => {
          let [gym, rate] = r;
          let hits = gymList[gym].pokemons.map((p) => {
            let poke = PokemonHelper.getPokemonByName(p.name);
            return Math.ceil(
              p.maxHealth /
                App.game.party.calculatePokemonAttack(poke.type1, poke.type2)
            );
          });
          let clicks = gymList[gym].pokemons.map((p) =>
            Math.ceil(p.maxHealth / App.game.party.calculateClickAttack())
          );
          return [gym, rate / Math.min(average(hits), average(clicks) / 20)];
        });
      },
      calculateBest: function (routes, gyms, n = 1) {
        let both = routes.concat(gyms);
        both.sort((r1, r2) => r2[1] - r1[1]);
        if (n === 1) return both[0];
        return both.slice(0, n);
      },
      mostEfficientPlaceForShardType: function (type, n = 1) {
        let routeShards = this.routeShardsRateForType(type);
        let gymShards = this.gymShardsRateForType(type);
        let routeShardsPerSec = this.routeCalculatePerSec(routeShards);
        let gymShardsPerSec = this.gymCalculatePerSec(gymShards);
        return this.calculateBest(routeShardsPerSec, gymShardsPerSec, n);
      },
      mostEfficientPlaceForMoney: function (n = 1) {
        let average = (ls) => ls.reduce((a, b) => a + b, 0) / ls.length;
        let availableRoutes = Routes.regionRoutes.filter((r) =>
          this.accessToRoute(r.number, r.region)
        );
        let availableGyms = Object.values(gymList).filter(
          (g) => Gym.isUnlocked(g) && this.betterAccessToTown(g.town)
        );
        const bonus = App.game.wallet.multiplier.getBonus("money");
        let routeMoney = availableRoutes.map((r) => {
          let arr = Array(100)
            .fill(0)
            .map(() => PokemonFactory.routeMoney(r.number, r.region));
          return [[r.region, r.number], bonus * average(arr)];
        });
        let gymMoney = availableGyms.map((g) => [
          g.town,
          (bonus * g.moneyReward) / g.pokemons.length,
        ]);
        let routeMoneyPerSec = this.routeCalculatePerSec(routeMoney);
        let gymMoneyPerSec = this.gymCalculatePerSec(gymMoney);
        return this.calculateBest(routeMoneyPerSec, gymMoneyPerSec, n);
      },
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
      "CapturePokemonsQuest",
      "GainShardsQuest",
      "DefeatPokemonsQuest",
      "DefeatGymQuest",
      "DefeatDungeonQuest",
    ],

    _mostEfficientPlace: [],
    _highestPrio: 0,
    _autoMove: true,
    get autoMove() {
      return this._autoMove;
    },
    set autoMove(val) {
      if (val === true || val === false) {
        this._autoMove = val;
      } else {
        console.log("Not true or false");
      }
    },
    _captureShinyBall: 2,
    get shinyCaptureBall() {
      return GameConstants.Pokeball[this._captureShinyBall];
    },
    set shinyCaptureBall(val) {
      let ball = GameHelper.enumStrings(GameConstants.Pokeball).find(X => X===val);
      if (val !== undefined) {
        this._captureShinyBall = GameConstants.Pokeball[val];
      } else {
        console.log("Not a ball: "+ GameHelper.enumStrings(GameConstants.Pokeball));
      }
    },
    _captureBall: 0,
    get captureBall() {
      return GameConstants.Pokeball[this._captureBall];
    },
    set captureBall(val) {
      let ball = GameHelper.enumStrings(GameConstants.Pokeball).find(X => X===val);
      if (val !== undefined) {
        this._captureBall = GameConstants.Pokeball[val];
      } else {
        console.log("Not a ball: "+ GameHelper.enumStrings(GameConstants.Pokeball));
      }
    },
    _pokeballs: {
      alreadyCaughtShinySelection:
        App.game.pokeballs.alreadyCaughtShinySelection,
      alreadyCaughtSelection: App.game.pokeballs.alreadyCaughtSelection,
    },
    _currentQuest: {},

    _firstRun: true,

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
      this._firstRun = true;
      this.interval.push(this.intervalFunction());
    },

    Stop: function () {
      clearInterval(this.interval.pop());
    },
  };

  App.game.pokeballs._alreadyCaughtSelection.subscribe(function (newValue) {
    if (
      !(
        Autopoke.quests._currentQuest instanceof UsePokeballQuest ||
        Autopoke.quests._currentQuest instanceof CapturePokemonsQuest ||
        Autopoke.quests._currentQuest instanceof GainTokensQuest ||
        (Autopoke.quests._currentQuest instanceof UseOakItemQuest &&
          Autopoke.quests._currentQuest.item === 0)
      )
    ) {
      Autopoke.quests._pokeballs.alreadyCaughtSelection = newValue;
    }
  });
  App.game.pokeballs._alreadyCaughtShinySelection.subscribe(function (
    newValue
  ) {
    if (!(Autopoke.quests._currentQuest instanceof CatchShiniesQuest)) {
      Autopoke.quests._pokeballs.alreadyCaughtShinySelection = newValue;
    }
  });
})();
