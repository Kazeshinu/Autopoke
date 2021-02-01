# Autopoke
------------------

Autopoke is a hobby automation script collection for [![GitHub package.json version (branch)](https://img.shields.io/github/package-json/v/pokeclicker/pokeclicker/master?label=Pokeclicker.com)](https://www.pokeclicker.com/)<br/>
Also works on the Desktop version CTRL+SHIFT+I to open Console\
\
Desktop version available at GitHub: [![GitHub release (latest by date)](https://img.shields.io/github/v/release/RedSparr0w/Pokeclicker-desktop?label=Pokeclicker-desktop&logo=Github)](https://github.com/RedSparr0w/Pokeclicker-desktop/releases)
## Modules

### breeding
------------------
Automation of adding eggs to hatching list and hatching them\
The egg added is the topmost in the hatching list so set your filter accordingly

##### Functions
-----------------
No breeding specific functions yet check Common functions

### clicking
------------------
Autoclicks in battle

##### Functions
-----------------
`Autopoke.clicking.cps=#` sets clicks per second to # fastest is 25 cps

### dungeon
------------------
Automation of dungeon by moving and repeating with the posibility to collect chests

##### Functions
-----------------
`Autopoke.dungeon.runs=#` sets next amount of runs to #\
`Autopoke.dungeon.openChests=true` opens chests in dungeons `true || false`

### farming
------------------
Automation of harvesting berries

##### Functions
-----------------
`Autopoke.farming.berry="Cheri"` sets the automatic production of berrys to Cheri, replace Cheri with desired berry name

### gym
------------------
Ability to repeat gyms # amount of times

##### Functions
-----------------
`Autopoke.gym.runs=#` sets next amount of runs to #

### underground
------------------
Automaticly digs in the underground

##### Functions
-----------------
No underground specific functions yet check Common functions

### Common
------------------
Functions shared by all modules\
\
`intervalTime=#` sets the refreshrate of the loop (ms)\
`Start()` starts the module\
`Stop()` stops the module\
`intervalFunction` this gets run on start don't edit if you don't know what you are doing.


## How to use
------------------

This needs to be run in console.\
For the Desktop version open console with CTRL+SHIFT+I

Run this in console: https://kazeshinu.github.io/Autopoke/Autopoke.js to load and start all modules
or individual modules: https://kazeshinu.github.io/Autopoke/modules/{MODULE_NAME_LOWERCASE}.js\  

Access your modules with Autopoke.module i.e `Autopoke.dungeon.runs=100` `Autopoke.farming.Stop()`  

Support / Social
------------------

![Discord](https://img.shields.io/discord/437797104786604034?color=%237289DA&label=Legends%20of%20IdleOn&logo=Discord) Created in Legends of Idleon Discord #off-topic-chat 

![GitHub issues](https://img.shields.io/github/issues/kazeshinu/Autopoke?logo=Github) Open a ticket on GitHub