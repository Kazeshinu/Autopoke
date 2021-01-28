// ==UserScript==
// @name         AutoPoke
// @version      1.0
// @namespace    https://Kazeshinu.github.io/Autopoke/
// @updateURL    https://Kazeshinu.github.io/Autopoke/.user.js
// @description  Automate pokéclicker
// @author       Kazeshinu
// @grant        none
// ==/UserScript==

var script = document.createElement('script');
script.id = 'AutoPoke';
//This can be edited to point to your own Github Repository URL.
script.src = 'https://Kazeshinu.github.io/Autopoke/Autopoke.js';
//script.setAttribute('crossorigin',"use-credentials");
script.setAttribute('crossorigin',"anonymous");
document.head.appendChild(script);
