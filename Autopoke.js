var AutopokeVersion = "0.4";

var AutopokeBranch = "main"; //  main || dev

var lastCompatibleVersion = "0.7.5";
if (versionCompare(App.game.update.version, lastCompatibleVersion) === 1) {
	Notifier.notify({
		title: 'WARNING: Pokéclicker version is newer than this version of Autopoke',
		message: `Last tested version for Autopoke is: ${lastCompatibleVersion}`,
		type: 2,
		timeout: GameConstants.DAY,
	});
}
var Autopoke = {};
var checkReady = {};

var base = `https://raw.githack.com/Kazeshinu/Autopoke/${AutopokeBranch}/`
	, module = 'modules/';
if (AutopokeBranch === "main") base = 'https://kazeshinu.github.io/Autopoke/'
var modules = ['breeding', 'clicking', 'dungeon', 'farming', 'underground', 'gym', 'quests'];
for (let i = 0, len = modules.length; i < len; i++) {
	document.head.appendChild(document.createElement('script')).src = `${base + module + modules[i]}.js?v=${AutopokeVersion}`;
	checkReady[modules[i]] = setInterval((function (i, x) {
		return function () {
			if (typeof Autopoke[modules[i]] !== 'undefined') {

				Autopoke[modules[i]].Start();
				console.log("Autopoke loaded module: " + modules[i]);
				Notifier.notify({
					title: 'Autopoke ',
					message: 'Loaded: ' + modules[i],
					type: 1,
					timeout: 20000,
				});
				clearInterval(checkReady[modules[i]]);
				return;
			} else {
				x = x + 1
			}
			console.log("Error loading "+modules[i]+", retries: ("+x+"/10)");
			if (x >= 10) {
				console.log("Autopoke error module: " + modules[i]);
				Notifier.notify({
					title: 'Autopoke ',
					message: 'Error loading: ' + modules[i],
					type: 3,
					timeout: 20000,
				});
				clearInterval(checkReady[modules[i]]);
			}
		};
	})(i, 0), 1000);
}

function versionCompare(v1, v2, options) {
	let lexicographical = options && options.lexicographical,
		zeroExtend = options && options.zeroExtend,
		v1parts = v1.split('.'),
		v2parts = v2.split('.');

	function isValidPart(x) {
		return (lexicographical ? /^\d+[A-Za-z]*$/ : /^\d+$/).test(x);
	}

	if (!v1parts.every(isValidPart) || !v2parts.every(isValidPart)) {
		return NaN;
	}
	if (zeroExtend) {
		while (v1parts.length < v2parts.length) v1parts.push("0");
		while (v2parts.length < v1parts.length) v2parts.push("0");
	}
	if (!lexicographical) {
		v1parts = v1parts.map(Number);
		v2parts = v2parts.map(Number);
	}
	for (let i = 0; i < v1parts.length; ++i) {
		if (v2parts.length === i) {
			return 1;
		}
		if (v1parts[i] === v2parts[i]) {
			continue;
		} else if (v1parts[i] > v2parts[i]) {
			return 1;
		} else {
			return -1;
		}
	}
	if (v1parts.length !== v2parts.length) {
		return -1;
	}
	return 0;
}
