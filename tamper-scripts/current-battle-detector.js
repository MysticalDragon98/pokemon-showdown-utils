// ==UserScript==
// @name         Current battle detector
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Detects current battles and notifies to server
// @author       You
// @match        https://play.pokemonshowdown.com/*
// @match        https://replay.pokemonshowdown.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tampermonkey.net
// @grant        none
// ==/UserScript==

{//* Variables
    var URL = 'https://ps-assistant:3001';
}

{//* Utils
    var post = function post (url, data) {
        return fetch(URL + "/" + url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }).then(res => res.json()).then(res => res.result);
    }
};

{//* Server functions
    var notifyCurrentBattle = function notifyCurrentBattle (battleId) {
        return post("battles/notifyCurrentBattle", { battleId });
    }
}


(function() {
    let lastUrl = null;

    setTimeout(() => {
        setInterval(() => {
            if (window.location.href === lastUrl) return;
            const battleId = window.location.pathname.substring(1);
            lastUrl = window.location.href;
            
            if (battleId.startsWith("battle-")) {
                console.log("[CurrentBattleDetector]", "New URL: " + lastUrl);
                notifyCurrentBattle(battleId);
            } else {
                console.log("[CurrentBattleDetector]", "Not a battle: " + lastUrl);
                notifyCurrentBattle(null);
            }
        }, 100);
    }, 5000);
})();