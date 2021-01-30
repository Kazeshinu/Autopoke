var lastCompatibleVersion = "0.7.5";
if (versionCompare(App.game.update.version,lastCompatibleVersion)==1) {
	Notifier.notify({
		title: 'WARNING: Pokéclicker version is newer than this version of Autopoke',
        message: 'Last tested version for Autopoke is: '+ lastCompatibleVersion,
        type: 2,
        timeout: GameConstants.DAY,
    });
}
var Autopoke = {};

var base = 'https://raw.githubusercontent.com/Kazeshinu/Autopoke/dev/'
  , module = 'modules/'
var modules = ['breeding', 'clicking', 'dungeon', 'farming', 'underground'];
for (var i=0,len=modules.length; i<len; i++) {
	document.head.appendChild(document.createElement('script')).src = base + module + modules[i] + '.js';
	Autopoke[modules[i]].Start();
}	
function versionCompare(v1, v2, options) {
    var lexicographical = options && options.lexicographical,
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
    for (var i = 0; i < v1parts.length; ++i) {
        if (v2parts.length == i) {
            return 1;
        }
        if (v1parts[i] == v2parts[i]) {
            continue;
        }
        else if (v1parts[i] > v2parts[i]) {
            return 1;
        }
        else {
            return -1;
        }
    }
    if (v1parts.length != v2parts.length) {
        return -1;
    }
    return 0;
}
