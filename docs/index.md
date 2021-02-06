---
#
# By default, content added below the "---" mark will appear in the home page
# between the top bar and the list of recent posts.
# To change the home page layout, edit the _layouts/home.html file.
# See: https://jekyllrb.com/docs/themes/#overriding-theme-defaults
#
title: Autopoke
layout: home
permalink: /about/
---

Autopoke is a hobby automation script collection for [![GitHub package.json version (branch)](https://img.shields.io/github/package-json/v/pokeclicker/pokeclicker/master?label=Pokeclicker.com)](https://www.pokeclicker.com/)<br/>
Also works on the Desktop version CTRL+SHIFT+I to open Console  
  ```js
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
  ```
  
Desktop version available at GitHub: [![GitHub release (latest by date)](https://img.shields.io/github/v/release/RedSparr0w/Pokeclicker-desktop?label=Pokeclicker-desktop&logo=Github)](https://github.com/RedSparr0w/Pokeclicker-desktop/releases)
