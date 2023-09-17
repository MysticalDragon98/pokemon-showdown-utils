// ==UserScript==
// @name         Replay Saver
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Automatically saves & upload replays
// @author       You
// @match        https://play.pokemonshowdown.com/*
// @match        https://replay.pokemonshowdown.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tampermonkey.net
// @grant        none
// ==/UserScript==

{//* Variables
    var URL = 'https://ps-assistant:3001';
}

{//* Hooks

    BattleRoom.prototype.updateControls = function () {
        if (this.battle.scene.customControls) return;
        var controlsShown = this.controlsShown;
        var switchSidesButton = '<p><button class="button" name="switchSides"><i class="fa fa-random"></i> Switch sides</button></p>';
        this.controlsShown = false;

        if (this.battle.seeking !== null) {

            // battle is seeking
            this.$controls.html('');
            return;

        } else if (!this.battle.atQueueEnd) {

            // battle is playing or paused
            if (!this.side || this.battleEnded) {
                // spectator
                if (this.battle.paused) {
                    // paused
                    this.$controls.html('<p><button class="button" name="resume"><i class="fa fa-play"></i><br />Play</button> <button class="button" name="rewindTurn"><i class="fa fa-step-backward"></i><br />Last turn</button><button class="button" name="skipTurn"><i class="fa fa-step-forward"></i><br />Skip turn</button> <button class="button" name="instantReplay"><i class="fa fa-undo"></i><br />First turn</button><button class="button" name="goToEnd"><i class="fa fa-fast-forward"></i><br />Skip to end</button></p>' + switchSidesButton);
                } else {
                    // playing
                    this.$controls.html('<p><button class="button" name="pause"><i class="fa fa-pause"></i><br />Pause</button> <button class="button" name="rewindTurn"><i class="fa fa-step-backward"></i><br />Last turn</button><button class="button" name="skipTurn"><i class="fa fa-step-forward"></i><br />Skip turn</button> <button class="button" name="instantReplay"><i class="fa fa-undo"></i><br />First turn</button><button class="button" name="goToEnd"><i class="fa fa-fast-forward"></i><br />Skip to end</button></p>' + switchSidesButton);
                }
            } else {
                // is a player
                this.$controls.html('<p>' + this.getTimerHTML() + '<button class="button" name="skipTurn"><i class="fa fa-step-forward"></i><br />Skip turn</button> <button class="button" name="goToEnd"><i class="fa fa-fast-forward"></i><br />Skip to end</button></p>');
            }
            return;

        }

        if (this.battle.ended) {
            this.send('/savereplay silent');
            setTimeout(() => {
                reportReplay(this.battle.id);
            }, 1000);
            var replayDownloadButton = '<span style="float:right;"><a href="//' + Config.routes.replays + '/" class="button replayDownloadButton"><i class="fa fa-download"></i> Download replay</a><br /><br /><button class="button" name="saveReplay"><i class="fa fa-upload"></i> Upload and share replay</button></span>';

            // battle has ended
            if (this.side) {
                // was a player
                this.closeNotification('choice');
                this.$controls.html('<div class="controls"><p>' + replayDownloadButton + '<button class="button" name="instantReplay"><i class="fa fa-undo"></i><br />Instant replay</button></p><p><button class="button" name="closeAndMainMenu"><strong>Main menu</strong><br /><small>(closes this battle)</small></button> <button class="button" name="closeAndRematch"><strong>Rematch</strong><br /><small>(closes this battle)</small></button></p></div>');
            } else {
                this.$controls.html('<div class="controls"><p>' + replayDownloadButton + '<button class="button" name="instantReplay"><i class="fa fa-undo"></i><br />Instant replay</button></p>' + switchSidesButton + '</div>');
            }

        } else if (this.side) {

            // player
            this.controlsShown = true;
            if (!controlsShown || this.choice === undefined || this.choice && this.choice.waiting) {
                // don't update controls (and, therefore, side) if `this.choice === null`: causes damage miscalculations
                this.updateControlsForPlayer();
            } else {
                this.updateTimer();
            }

        } else if (!this.battle.nearSide.name || !this.battle.farSide.name) {

            // empty battle
            this.$controls.html('<p><em>Waiting for players...</em></p>');

        } else {

            // full battle
            if (this.battle.paused) {
                // paused
                this.$controls.html('<p><button class="button" name="resume"><i class="fa fa-play"></i><br />Play</button> <button class="button" name="rewindTurn"><i class="fa fa-step-backward"></i><br />Last turn</button><button class="button disabled" disabled><i class="fa fa-step-forward"></i><br />Skip turn</button> <button class="button" name="instantReplay"><i class="fa fa-undo"></i><br />First turn</button><button class="button disabled" disabled><i class="fa fa-fast-forward"></i><br />Skip to end</button></p>' + switchSidesButton + '<p><em>Waiting for players...</em></p>');
            } else {
                // playing
                this.$controls.html('<p><button class="button" name="pause"><i class="fa fa-pause"></i><br />Pause</button> <button class="button" name="rewindTurn"><i class="fa fa-step-backward"></i><br />Last turn</button><button class="button disabled" disabled><i class="fa fa-step-forward"></i><br />Skip turn</button> <button class="button" name="instantReplay"><i class="fa fa-undo"></i><br />First turn</button><button class="button disabled" disabled><i class="fa fa-fast-forward"></i><br />Skip to end</button></p>' + switchSidesButton + '<p><em>Waiting for players...</em></p>');
            }

        }

        // This intentionally doesn't happen if the battle is still playing,
        // since those early-return.
        app.topbar.updateTabbar();
    };  

};

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
    var reportReplay = async function reportReplay(battleId) {
        console.log("[Replay-saver] Reporting replay for",  battleId, `https://replay.pokemonshowdown.com${window.location.pathname}`);

        await post("battles/notifyReplay", {
            battleId,
            replay: `https://replay.pokemonshowdown.com${window.location.pathname}`,
        });
    }
};

(function () {

})();