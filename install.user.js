// ==UserScript==
// @name         AutoPoke
// @version      0.5
// @namespace    https://Kazeshinu.github.io/Autopoke/
// @updateURL    https://Kazeshinu.github.io/Autopoke/install.user.js
// @description  Automate pokéclicker
// @author       Kazeshinu
// @grant        none
// ==/UserScript==


(function () {
	const checkReady = setInterval(function () {
		if (typeof App.game !== 'undefined') {
			if (typeof App.game.interval !== 'undefined') {
				let script = document.createElement('script');
				script.id = 'AutoPoke';
				script.src = 'https://Kazeshinu.github.io/Autopoke/Autopoke.js';
				script.setAttribute('crossorigin', "anonymous");
				document.head.appendChild(script);
				clearInterval(checkReady);
			}
		}
	}, 1000);
})();
