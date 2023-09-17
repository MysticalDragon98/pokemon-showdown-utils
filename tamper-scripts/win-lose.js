// ==UserScript==
// @name         Win / Lose counter
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Detects winners & losers and keeps track of it in remote server
// @author       You
// @match        https://play.pokemonshowdown.com/*
// @match        https://replay.pokemonshowdown.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tampermonkey.net
// @grant        none
// ==/UserScript==

{//* Variables
    var URL = 'https://ps-assistant:3001';
}

{//* Server functions
    var reportWin = async function reportWin(battleId, winner, loser, tier) {
        console.log("[Win-Lose] Reporting win for " + winner + " against " + loser + " in battle " + battleId);

        await post("battles/notifyResult", {
            battleId: battleId,
            winner: winner,
            loser: loser,
            format: tier
        });
    }
}

{//* Hooks

	BattleScene.prototype.getSidebarHTML = function (side, posStr) {
		let noShow = this.battle.hardcoreMode && this.battle.gen < 7;

		let speciesOverage = this.battle.speciesClause ? Infinity : Math.max(side.pokemon.length - side.totalPokemon, 0);
		const sidebarIcons = [];
		const speciesTable = [];
		let zoroarkRevealed = false;
		let hasIllusion = false;
		if (speciesOverage) {
			for (let i = 0; i < side.pokemon.length; i++) {
				const species = side.pokemon[i].getBaseSpecies().baseSpecies;
				if (speciesOverage && speciesTable.includes(species)) {
					for (const sidebarIcon of sidebarIcons) {
						if (side.pokemon[sidebarIcon[1]].getBaseSpecies().baseSpecies === species) {
							sidebarIcon[0] = 'pokemon-illusion';
						}
					}
					hasIllusion = true;
					speciesOverage--;
				} else {
					sidebarIcons.push(['pokemon', i]);
					speciesTable.push(species);
					if (['Zoroark', 'Zorua'].includes(species)) {
						zoroarkRevealed = true;
					}
				}
			}
		} else {
			for (let i = 0; i < side.pokemon.length; i++) {
				sidebarIcons.push(['pokemon', i]);
			}
		}
		if (!zoroarkRevealed && hasIllusion && sidebarIcons.length < side.totalPokemon) {
			sidebarIcons.push(['pseudo-zoroark', null]);
		}
		while (sidebarIcons.length < side.totalPokemon) {
			sidebarIcons.push(['unrevealed', null]);
		}
		while (sidebarIcons.length < 6) {
			sidebarIcons.push(['empty', null]);
		}

		let pokemonhtml = '';
		for (let i = 0; i < sidebarIcons.length; i++) {
			const [iconType, pokeIndex] = sidebarIcons[i];
			const poke = pokeIndex !== null ? side.pokemon[pokeIndex] : null;
			const tooltipCode = ` class="picon has-tooltip" data-tooltip="pokemon|${side.n}|${pokeIndex}${iconType === 'pokemon-illusion' ? '|illusion' : ''}"`;
			if (iconType === 'empty') {
				pokemonhtml += `<span class="picon" style="` + Dex.getPokemonIcon('pokeball-none') + `"></span>`;
			} else if (noShow) {
				if (poke?.fainted) {
					pokemonhtml += `<span${tooltipCode} style="` + Dex.getPokemonIcon('pokeball-fainted') + `" aria-label="Fainted"></span>`;
				} else if (poke?.status) {
					pokemonhtml += `<span${tooltipCode} style="` + Dex.getPokemonIcon('pokeball-statused') + `" aria-label="Statused"></span>`;
				} else {
					pokemonhtml += `<span${tooltipCode} style="` + Dex.getPokemonIcon('pokeball') + `" aria-label="Non-statused"></span>`;
				}
			} else if (iconType === 'pseudo-zoroark') {
				pokemonhtml += `<span class="picon" style="` + Dex.getPokemonIcon('zoroark') + `" title="Unrevealed Illusion user" aria-label="Unrevealed Illusion user"></span>`;
			} else if (!poke) {
				pokemonhtml += `<span class="picon" style="` + Dex.getPokemonIcon('pokeball') + `" title="Not revealed" aria-label="Not revealed"></span>`;
			} else if (!poke.ident && this.battle.teamPreviewCount && this.battle.teamPreviewCount < side.pokemon.length) {
				// in VGC (bring 6 pick 4) and other pick-less-than-you-bring formats, this is
				// a pokemon that's been brought but not necessarily picked
				const details = this.getDetailsText(poke);
				pokemonhtml += `<span${tooltipCode} style="` + Dex.getPokemonIcon(poke, !side.isFar) + `;opacity:0.6" aria-label="${details}"></span>`;
			} else {
				const details = this.getDetailsText(poke);
				pokemonhtml += `<span${tooltipCode} style="` + Dex.getPokemonIcon(poke, !side.isFar) + `" aria-label="${details}"></span>`;
			}
			if (i % 3 === 2) pokemonhtml += `</div><div class="teamicons">`;
		}
		pokemonhtml = '<div class="teamicons">' + pokemonhtml + '</div>';
		const ratinghtml = side.rating ? ` title="Rating: ${BattleLog.escapeHTML(side.rating)}"` : ``;
		const faded = side.name ? `` : ` style="opacity: 0.4"`;
		return `<div class="trainer trainer-${posStr}"${faded}><strong>[${
			side.leaderboard? side.leaderboard.category[0].toUpperCase() + side.leaderboard.category.substring(1) : ""
		}] ${BattleLog.escapeHTML(side.name)} (${side.marker})</strong><div class="trainersprite"${ratinghtml} style="background-image:url(${Dex.resolveAvatar(side.avatar)})"></div>${pokemonhtml}</div>`;
	}

	Battle.prototype.ensureMarker = async function () {
		if (!this.p1.name || !this.p2.name || !this.tier || this.p1.marker !== undefined || this.p2.marker !== undefined) return;

		console.log("[Win-Lose] Loading marker for battle", this);
		const player1 = this.p1.name;
		const player2 = this.p2.name;

		const data = await post('battles/marker', {
			player1: player1,
			player2: player2,
			format: this.tier
		});

		const [ p1Data, p2Data ] = await Promise.all([this.p1, this.p2].map(async side => {
			const data = await post('ladder/getPlayerLadderData', {
				player: side.id,
				format: this.tier
			});

			return data ?? {
				rank: "?",
				id: side.id,
				elo: "?",
				glicko: "?",
				gxe: "?",
				category: "rookie"
			};
		}))

		console.log("[Win-Lose] Loaded player data", {
			p1Data: p1Data,
			p2Data: p2Data
		})

		this.marker = data;

		this.p1.leaderboard = p1Data;
		this.p2.leaderboard = p2Data;

		[this.p1, this.p2].forEach(side => {
			side.marker = data[side.id];
		});

		console.log("[Win-Lose] Loaded marker for " + player1 + " vs " + player2 + " in " + this.tier, this.p1, this.p2);
		this.scene.updateSidebars();
	}

	Battle.prototype.resetStep = function resetStep() {
		// battle state
		this.turn = -1;
		this.started = !this.paused;
		this.ended = false;
		this.atQueueEnd = false;
		this.weather = '';
		this.weatherTimeLeft = 0;
		this.weatherMinTimeLeft = 0;
		this.pseudoWeather = [];
		this.lastMove = '';

		for (const side of this.sides) {
			if (side) side.reset();
		}
		this.myPokemon = null;
		this.myAllyPokemon = null;

		// DOM state
		this.scene.reset();

		// activity queue state
		this.activeMoveIsSpread = null;
		this.currentStep = 0;
		this.resetTurnsSinceMoved();
		this.nextStep();
	}

    Battle.prototype.runMajor = function runMajor(args, kwArgs, preempt) {
		console.log("[Win-Lose] Running major", args, kwArgs, preempt);
		switch (args[0]) {
		case 'start': {
			this.nearSide.active[0] = null;
			this.farSide.active[0] = null;
			this.scene.resetSides();
			this.start();
			break;
		}
		case 'upkeep': {
			this.usesUpkeep = true;
			this.updateTurnCounters();
			break;
		}
		case 'turn': {
			this.setTurn(parseInt(args[1], 10));
			this.log(args);
			break;
		}
		case 'tier': {
			this.tier = args[1];
			if (this.tier.slice(-13) === 'Random Battle') {
				this.speciesClause = true;
			}
			if (this.tier.slice(-8) === ' (Blitz)') {
				this.messageFadeTime = 40;
				this.isBlitz = true;
			}
			if (this.tier.includes(`Let's Go`)) {
				this.dex = Dex.mod('gen7letsgo' );
			}

			this.ensureMarker();
			this.log(args);

			break;
		}
		case 'gametype': {
			this.gameType = args[1];
			switch (args[1]) {
			case 'multi':
			case 'freeforall':
				this.pokemonControlled = 1;
				if (!this.p3) this.p3 = new Side(this, 2);
				if (!this.p4) this.p4 = new Side(this, 3);
				this.p3.foe = this.p2;
				this.p4.foe = this.p1;

				if (args[1] === 'multi') {
					this.p4.ally = this.p2;
					this.p3.ally = this.p1;
					this.p1.ally = this.p3;
					this.p2.ally = this.p4;
				}

				this.p3.isFar = this.p1.isFar;
				this.p4.isFar = this.p2.isFar;
				this.sides = [this.p1, this.p2, this.p3, this.p4];
				// intentionally sync p1/p3 and p2/p4's active arrays
				this.p1.active = this.p3.active = [null, null];
				this.p2.active = this.p4.active = [null, null];
				break;
			case 'doubles':
				this.nearSide.active = [null, null];
				this.farSide.active = [null, null];
				break;
			case 'triples':
			case 'rotation':
				this.nearSide.active = [null, null, null];
				this.farSide.active = [null, null, null];
				break;
			default:
				for (const side of this.sides) side.active = [null];
				break;
			}
			if (!this.pokemonControlled) this.pokemonControlled = this.nearSide.active.length;
			this.scene.updateGen();
			this.scene.resetSides();
			break;
		}
		case 'rule': {
			let ruleName = args[1].split(': ')[0];
			if (ruleName === 'Species Clause') this.speciesClause = true;
			if (ruleName === 'Blitz') {
				this.messageFadeTime = 40;
				this.isBlitz = true;
			}
			this.rules[ruleName] = 1;
			this.log(args);
			break;
		}
		case 'rated': {
			this.rated = args[1] || true;
			this.scene.updateGen();
			this.log(args);
			break;
		}
		case 'inactive': {
			if (!this.kickingInactive) this.kickingInactive = true;
			if (args[1].slice(0, 11) === "Time left: ") {
				let [time, totalTime, graceTime] = args[1].split(' | ');
				this.kickingInactive = parseInt(time.slice(11), 10) || true;
				this.totalTimeLeft = parseInt(totalTime, 10);
				this.graceTimeLeft = parseInt(graceTime || '', 10) || 0;
				if (this.totalTimeLeft === this.kickingInactive) this.totalTimeLeft = 0;
				return;
			} else if (args[1].slice(0, 9) === "You have ") {
				// this is ugly but parseInt is documented to work this way
				// so I'm going to be lazy and not chop off the rest of the
				// sentence
				this.kickingInactive = parseInt(args[1].slice(9), 10) || true;
				return;
			} else if (args[1].slice(-14) === ' seconds left.') {
				let hasIndex = args[1].indexOf(' has ');
				let userid = window.app?.user?.get('userid');
				if (toID(args[1].slice(0, hasIndex)) === userid) {
					this.kickingInactive = parseInt(args[1].slice(hasIndex + 5), 10) || true;
				}
			} else if (args[1].slice(-27) === ' 15 seconds left this turn.') {
				if (this.isBlitz) return;
			}
			this.log(args, undefined, preempt);
			break;
		}
		case 'inactiveoff': {
			this.kickingInactive = false;
			this.log(args, undefined, preempt);
			break;
		}
		case 'join': case 'j': case 'J': {
			if (this.roomid) {
				let room = app.rooms[this.roomid];
				let user = BattleTextParser.parseNameParts(args[1]);
				let userid = toUserid(user.name);
				if (!room.users[userid]) room.userCount.users++;
				room.users[userid] = user;
				room.userList.add(userid);
				room.userList.updateUserCount();
				room.userList.updateNoUsersOnline();
			}
			this.log(args, undefined, preempt);
			break;
		}
		case 'leave': case 'l': case 'L': {
			if (this.roomid) {
				let room = app.rooms[this.roomid];
				let user = args[1];
				let userid = toUserid(user);
				if (room.users[userid]) room.userCount.users--;
				delete room.users[userid];
				room.userList.remove(userid);
				room.userList.updateUserCount();
				room.userList.updateNoUsersOnline();
			}
			this.log(args, undefined, preempt);
			break;
		}
		case 'name': case 'n': case 'N': {
			if (this.roomid) {
				let room = app.rooms[this.roomid];
				let user = BattleTextParser.parseNameParts(args[1]);
				let oldid = args[2];
				if (toUserid(oldid) === app.user.get('userid')) {
					app.user.set({
						away: user.away,
						status: user.status,
					});
				}
				let userid = toUserid(user.name);
				room.users[userid] = user;
				room.userList.remove(oldid);
				room.userList.add(userid);
			}
			if (!this.ignoreSpects) {
				this.log(args, undefined, preempt);
			}
			break;
		}
		case 'player': {
			let side = this.getSide(args[1]);
			side.setName(args[2]);
			if (args[3]) side.setAvatar(args[3]);
			if (args[4]) side.rating = args[4];
			if (this.joinButtons) this.scene.hideJoinButtons();
			
			console.log("[Win-Lose] Detected player", {
				side: side,
				args: args,
				p1Name: this.p1.name,
				p2Name: this.p2.name
			});

			this.ensureMarker();

			this.log(args);
			this.scene.updateSidebar(side);
			break;
		}
		case 'teamsize': {
			let side = this.getSide(args[1]);
			side.totalPokemon = parseInt(args[2], 10);
			this.scene.updateSidebar(side);
			break;
		}
		case 'win': case 'tie': {
            reportWin(this.id, args[1], this.p1.name === args[1] ? this.p2.name : this.p1.name, this.tier);
			this.winner(args[0] === 'tie' ? undefined : args[1]);
			break;
		}
		case 'prematureend': {
			this.prematureEnd();
			break;
		}
		case 'clearpoke': {
			this.p1.clearPokemon();
			this.p2.clearPokemon();
			break;
		}
		case 'poke': {
			let pokemon = this.rememberTeamPreviewPokemon(args[1], args[2]);
			if (args[3] === 'mail') {
				pokemon.item = '(mail)';
			} else if (args[3] === 'item') {
				pokemon.item = '(exists)';
			}
			break;
		}
		case 'updatepoke': {
			const {siden} = this.parsePokemonId(args[1]);
			const side = this.sides[siden];
			for (let i = 0; i < side.pokemon.length; i++) {
				const pokemon = side.pokemon[i];
				if (pokemon.details !== args[2] && pokemon.checkDetails(args[2])) {
					side.addPokemon('', '', args[2], i);
					break;
				}
			}
			break;
		}
		case 'teampreview': {
			this.teamPreviewCount = parseInt(args[1], 10);
			this.scene.teamPreview();
			break;
		}
		case 'switch': case 'drag': case 'replace': {
			this.endLastTurn();
			let poke = this.getSwitchedPokemon(args[1], args[2]);
			let slot = poke.slot;
			poke.healthParse(args[3]);
			poke.removeVolatile('itemremoved' );
			poke.terastallized = args[2].match(/tera:([a-z]+)$/i)?.[1] || '';
			if (args[0] === 'switch') {
				if (poke.side.active[slot]) {
					poke.side.switchOut(poke.side.active[slot], kwArgs);
				}
				poke.side.switchIn(poke, kwArgs);
			} else if (args[0] === 'replace') {
				poke.side.replace(poke);
			} else {
				poke.side.dragIn(poke);
			}
			this.scene.updateWeather();
			this.log(args, kwArgs);
			break;
		}
		case 'faint': {
			let poke = this.getPokemon(args[1]);
			poke.side.faint(poke);
			this.log(args, kwArgs);
			break;
		}
		case 'swap': {
			if (isNaN(Number(args[2]))) {
				const poke = this.getPokemon(args[1]);
				poke.side.swapWith(poke, this.getPokemon(args[2]), kwArgs);
			} else {
				const poke = this.getPokemon(args[1]);
				const targetIndex = parseInt(args[2], 10);
				if (kwArgs.from) {
					const target = poke.side.active[targetIndex];
					if (target) args[2] = target.ident;
				}
				poke.side.swapTo(poke, targetIndex);
			}
			this.log(args, kwArgs);
			break;
		}
		case 'move': {
			this.endLastTurn();
			this.resetTurnsSinceMoved();
			let poke = this.getPokemon(args[1]);
			let move = Dex.moves.get(args[2]);
			if (this.checkActive(poke)) return;
			let poke2 = this.getPokemon(args[3]);
			this.scene.beforeMove(poke);
			this.useMove(poke, move, poke2, kwArgs);
			this.animateMove(poke, move, poke2, kwArgs);
			this.log(args, kwArgs);
			this.scene.afterMove(poke);
			break;
		}
		case 'cant': {
			this.endLastTurn();
			this.resetTurnsSinceMoved();
			let poke = this.getPokemon(args[1]);
			let effect = Dex.getEffect(args[2]);
			let move = Dex.moves.get(args[3]);
			this.cantUseMove(poke, effect, move, kwArgs);
			this.log(args, kwArgs);
			break;
		}
		case 'gen': {
			this.gen = parseInt(args[1], 10);
			this.dex = Dex.forGen(this.gen);
			this.scene.updateGen();
			this.log(args);
			break;
		}
		case 'callback': {
			this.subscription?.('callback');
			break;
		}
		case 'fieldhtml': {
			this.scene.setFrameHTML(BattleLog.sanitizeHTML(args[1]));
			break;
		}
		case 'controlshtml': {
			this.scene.setControlsHTML(BattleLog.sanitizeHTML(args[1]));
			break;
		}
		default: {
			this.log(args, kwArgs, preempt);
			break;
		}}
	}
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

(function() {
    
})();