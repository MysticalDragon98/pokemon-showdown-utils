// ==UserScript==
// @name         Extended Move Tooltip
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Extends move tooltip to a new level (Including Move Raw Power)
// @author       You
// @match        https://play.pokemonshowdown.com/*
// @match        https://replay.pokemonshowdown.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tampermonkey.net
// @grant        none
// ==/UserScript==

function calculateRawPower (move, stats, basePower) {
    if (move.category === 'Status') return 0;

    const offensiveStat = move.category === 'Physical' ? 'atk' : 'spa';
    let offensiveStatValue = stats[offensiveStat];

    return basePower * offensiveStatValue;
}

function prettyPrintNumber (value) {
    if (value >= 1000) {
        return Math.round(value / 1000) + 'k';
    }

    return value;
}

BattleTooltips.prototype.showMoveTooltip = function (move, isZOrMax, pokemon, serverPokemon, gmaxMove) {
    let text = '';

    let zEffect = '';
    let foeActive = pokemon.side.foe.active;
    if (this.battle.gameType === 'freeforall') {
        foeActive = [...foeActive, ...pokemon.side.active].filter(active => active !== pokemon);
    }
    // TODO: move this somewhere it makes more sense
    if (pokemon.ability === '(suppressed)') serverPokemon.ability = '(suppressed)';
    let ability = toID(serverPokemon.ability || pokemon.ability || serverPokemon.baseAbility);
    let item = this.battle.dex.items.get(serverPokemon.item);

    let value = new ModifiableValue(this.battle, pokemon, serverPokemon);
    let [moveType, category] = this.getMoveType(move, value, gmaxMove || isZOrMax === 'maxmove');

    if (isZOrMax === 'zmove') {
        if (item.zMoveFrom === move.name) {
            move = this.battle.dex.moves.get(item.zMove);
        } else if (move.category === 'Status') {
            move = new Move(move.id, "", {
                ...move,
                name: 'Z-' + move.name,
            });
            zEffect = this.getStatusZMoveEffect(move);
        } else {
            let moveName = BattleTooltips.zMoveTable[item.zMoveType];
            let zMove = this.battle.dex.moves.get(moveName);
            let movePower = move.zMove.basePower;
            // the different Hidden Power types don't have a Z power set, fall back on base move
            if (!movePower && move.id.startsWith('hiddenpower')) {
                movePower = this.battle.dex.moves.get('hiddenpower').zMove.basePower;
            }
            if (move.id === 'weatherball') {
                switch (this.battle.weather) {
                case 'sunnyday':
                case 'desolateland':
                    zMove = this.battle.dex.moves.get(BattleTooltips.zMoveTable['Fire']);
                    break;
                case 'raindance':
                case 'primordialsea':
                    zMove = this.battle.dex.moves.get(BattleTooltips.zMoveTable['Water']);
                    break;
                case 'sandstorm':
                    zMove = this.battle.dex.moves.get(BattleTooltips.zMoveTable['Rock']);
                    break;
                case 'hail':
                case 'snow':
                    zMove = this.battle.dex.moves.get(BattleTooltips.zMoveTable['Ice']);
                    break;
                }
            }
            move = new Move(zMove.id, zMove.name, {
                ...zMove,
                category: move.category,
                basePower: movePower,
            });
        }
    } else if (isZOrMax === 'maxmove') {
        if (move.category === 'Status') {
            move = this.battle.dex.moves.get('Max Guard');
        } else {
            let maxMove = this.getMaxMoveFromType(moveType, gmaxMove);
            const basePower = ['gmaxdrumsolo', 'gmaxfireball', 'gmaxhydrosnipe'].includes(maxMove.id) ?
                maxMove.basePower : move.maxMove.basePower;
            move = new Move(maxMove.id, maxMove.name, {
                ...maxMove,
                category: move.category,
                basePower,
            });
        }
    }

    text += '<h2>' + move.name + '<br />';

    text += Dex.getTypeIcon(moveType);
    text += ` ${Dex.getCategoryIcon(category)}</h2>`;

    // Check if there are more than one active Pokémon to check for multiple possible BPs.
    let showingMultipleBasePowers = false;
    if (category !== 'Status' && foeActive.length > 1) {
        // We check if there is a difference in base powers to note it.
        // Otherwise, it is just shown as in singles.
        // The trick is that we need to calculate it first for each Pokémon to see if it changes.
        let prevBasePower = null;
        let basePower = '';
        let difference = false;
        let basePowers = [];
        for (const active of foeActive) {
            if (!active) continue;
            value = this.getMoveBasePower(move, moveType, value, active);
            basePower = '' + value;
            if (prevBasePower === null) prevBasePower = basePower;
            if (prevBasePower !== basePower) difference = true;
            basePowers.push('Base power vs ' + active.name + ': ' + basePower);
        }
        if (difference) {
            text += '<p>' + basePowers.join('<br />') + '</p>';
            showingMultipleBasePowers = true;
        }
        // Falls through to not to repeat code on showing the base power.
    }
    if (!showingMultipleBasePowers && category !== 'Status') {
        let activeTarget = foeActive[0] || foeActive[1] || foeActive[2];
        value = this.getMoveBasePower(move, moveType, value, activeTarget);
        
        console.log({
            pokemon,
            serverPokemon,
            move,
            value: parseInt(value.toString())
        });

        const rawPower = calculateRawPower(move, this.calculateModifiedStats(pokemon, serverPokemon), parseInt(value.toString()));
        text += '<p>Base power: ' + value + '</p>';
        text += '<p>Raw power: ' + prettyPrintNumber(rawPower) + '</p>';
    }

    let accuracy = this.getMoveAccuracy(move, value);

    // Deal with Nature Power special case, indicating which move it calls.
    if (move.id === 'naturepower') {
        let calls;
        if (this.battle.gen > 5) {
            if (this.battle.hasPseudoWeather('Electric Terrain')) {
                calls = 'Thunderbolt';
            } else if (this.battle.hasPseudoWeather('Grassy Terrain')) {
                calls = 'Energy Ball';
            } else if (this.battle.hasPseudoWeather('Misty Terrain')) {
                calls = 'Moonblast';
            } else if (this.battle.hasPseudoWeather('Psychic Terrain')) {
                calls = 'Psychic';
            } else {
                calls = 'Tri Attack';
            }
        } else if (this.battle.gen > 3) {
            // In gens 4 and 5 it calls Earthquake.
            calls = 'Earthquake';
        } else {
            // In gen 3 it calls Swift, so it retains its normal typing.
            calls = 'Swift';
        }
        let calledMove = this.battle.dex.moves.get(calls);
        text += 'Calls ' + Dex.getTypeIcon(this.getMoveType(calledMove, value)[0]) + ' ' + calledMove.name;
    }

    text += '<p>Accuracy: ' + accuracy + '</p>';
    if (zEffect) text += '<p>Z-Effect: ' + zEffect + '</p>';

    if (this.battle.hardcoreMode) {
        text += '<p class="section">' + move.shortDesc + '</p>';
    } else {
        text += '<p class="section">';
        if (move.priority > 1) {
            text += 'Nearly always moves first <em>(priority +' + move.priority + ')</em>.</p><p>';
        } else if (move.priority <= -1) {
            text += 'Nearly always moves last <em>(priority &minus;' + (-move.priority) + ')</em>.</p><p>';
        } else if (move.priority === 1) {
            text += 'Usually moves first <em>(priority +' + move.priority + ')</em>.</p><p>';
        } else {
            if (move.id === 'grassyglide' && this.battle.hasPseudoWeather('Grassy Terrain')) {
                text += 'Usually moves first <em>(priority +1)</em>.</p><p>';
            }
        }

        text += '' + (move.desc || move.shortDesc || '') + '</p>';

        if (this.battle.gameType === 'doubles' || this.battle.gameType === 'multi') {
            if (move.target === 'allAdjacent') {
                text += '<p>&#x25ce; Hits both foes and ally.</p>';
            } else if (move.target === 'allAdjacentFoes') {
                text += '<p>&#x25ce; Hits both foes.</p>';
            }
        } else if (this.battle.gameType === 'triples') {
            if (move.target === 'allAdjacent') {
                text += '<p>&#x25ce; Hits adjacent foes and allies.</p>';
            } else if (move.target === 'allAdjacentFoes') {
                text += '<p>&#x25ce; Hits adjacent foes.</p>';
            } else if (move.target === 'any') {
                text += '<p>&#x25ce; Can target distant Pok&eacute;mon in Triples.</p>';
            }
        } else if (this.battle.gameType === 'freeforall') {
            if (move.target === 'allAdjacent' || move.target === 'allAdjacentFoes') {
                text += '<p>&#x25ce; Hits all foes.</p>';
            } else if (move.target === 'adjacentAlly') {
                text += '<p>&#x25ce; Can target any foe in Free-For-All.</p>';
            }
        }

        if (move.flags.defrost) {
            text += `<p class="movetag">The user thaws out if it is frozen.</p>`;
        }
        if (!move.flags.protect && !['self', 'allySide'].includes(move.target)) {
            text += `<p class="movetag">Not blocked by Protect <small>(and Detect, King's Shield, Spiky Shield)</small></p>`;
        }
        if (move.flags.bypasssub) {
            text += `<p class="movetag">Bypasses Substitute <small>(but does not break it)</small></p>`;
        }
        if (!move.flags.reflectable && !['self', 'allySide'].includes(move.target) && move.category === 'Status') {
            text += `<p class="movetag">&#x2713; Not bounceable <small>(can't be bounced by Magic Coat/Bounce)</small></p>`;
        }

        if (move.flags.contact) {
            text += `<p class="movetag">&#x2713; Contact <small>(triggers Iron Barbs, Spiky Shield, etc)</small></p>`;
        }
        if (move.flags.sound) {
            text += `<p class="movetag">&#x2713; Sound <small>(doesn't affect Soundproof pokemon)</small></p>`;
        }
        if (move.flags.powder && this.battle.gen > 5) {
            text += `<p class="movetag">&#x2713; Powder <small>(doesn't affect Grass, Overcoat, Safety Goggles)</small></p>`;
        }
        if (move.flags.punch && ability === 'ironfist') {
            text += `<p class="movetag">&#x2713; Fist <small>(boosted by Iron Fist)</small></p>`;
        }
        if (move.flags.pulse && ability === 'megalauncher') {
            text += `<p class="movetag">&#x2713; Pulse <small>(boosted by Mega Launcher)</small></p>`;
        }
        if (move.flags.bite && ability === 'strongjaw') {
            text += `<p class="movetag">&#x2713; Bite <small>(boosted by Strong Jaw)</small></p>`;
        }
        if ((move.recoil || move.hasCrashDamage) && ability === 'reckless') {
            text += `<p class="movetag">&#x2713; Recoil <small>(boosted by Reckless)</small></p>`;
        }
        if (move.flags.bullet) {
            text += `<p class="movetag">&#x2713; Bullet-like <small>(doesn't affect Bulletproof pokemon)</small></p>`;
        }
        if (move.flags.slicing) {
            text += `<p class="movetag">&#x2713; Slicing <small>(boosted by Sharpness)</small></p>`;
        }
        if (move.flags.wind) {
            text += `<p class="movetag">&#x2713; Wind <small>(activates Wind Power and Wind Rider)</small></p>`;
        }
    }
    return text;
}

BattleTooltips.prototype.getMoveBasePower = function(move, moveType, value, target) {
    const pokemon = value.pokemon;
    const serverPokemon = value.serverPokemon;
    let species = this.battle.dex.species.get(value.serverPokemon.speciesForme);

    // console.log(species)

    // apply modifiers for moves that depend on the actual stats
    const modifiedStats = this.calculateModifiedStats(pokemon, serverPokemon);

    value.reset(move.basePower);

    // Check STAB & Teras
    if (species.types.includes(moveType)) {
        if (pokemon.terastallized === moveType) {
            value.modify(2, 'STAB');
        } else {
            value.modify(1.5, 'STAB');
        }
    } else {
        if (pokemon.terastallized === moveType) {
            value.modify(1.5, 'Terastal');
        }
    }

    if (move.id === 'acrobatics') {
        if (!serverPokemon.item) {
            value.modify(2, "Acrobatics + no item");
        }
    }
    if (['crushgrip', 'wringout'].includes(move.id) && target) {
        value.set(
            Math.floor(Math.floor((120 * (100 * Math.floor(target.hp * 4096 / target.maxhp)) + 2048 - 1) / 4096) / 100) || 1,
            'approximate'
        );
    }
    if (move.id === 'brine' && target && target.hp * 2 <= target.maxhp) {
        value.modify(2, 'Brine + target below half HP');
    }
    if (move.id === 'eruption' || move.id === 'waterspout' || move.id === 'dragonenergy') {
        value.set(Math.floor(150 * pokemon.hp / pokemon.maxhp) || 1);
    }
    if (move.id === 'facade' && !['', 'slp', 'frz'].includes(pokemon.status)) {
        value.modify(2, 'Facade + status');
    }
    if (move.id === 'flail' || move.id === 'reversal') {
        let multiplier;
        let ratios;
        if (this.battle.gen > 4) {
            multiplier = 48;
            ratios = [2, 5, 10, 17, 33];
        } else {
            multiplier = 64;
            ratios = [2, 6, 13, 22, 43];
        }
        let ratio = pokemon.hp * multiplier / pokemon.maxhp;
        let basePower;
        if (ratio < ratios[0]) basePower = 200;
        else if (ratio < ratios[1]) basePower = 150;
        else if (ratio < ratios[2]) basePower = 100;
        else if (ratio < ratios[3]) basePower = 80;
        else if (ratio < ratios[4]) basePower = 40;
        else basePower = 20;
        value.set(basePower);
    }
    if (['hex', 'infernalparade'].includes(move.id) && target?.status) {
        value.modify(2, move.name + ' + status');
    }
    if (move.id === 'lastrespects') {
        value.set(Math.min(50 + 50 * pokemon.side.faintCounter));
    }
    if (move.id === 'punishment' && target) {
        let boostCount = 0;
        for (const boost of Object.values(target.boosts)) {
            if (boost > 0) boostCount += boost;
        }
        value.set(Math.min(60 + 20 * boostCount, 200));
    }
    if (move.id === 'smellingsalts' && target) {
        if (target.status === 'par') {
            value.modify(2, 'Smelling Salts + Paralysis');
        }
    }
    if (['storedpower', 'powertrip'].includes(move.id) && target) {
        let boostCount = 0;
        for (const boost of Object.values(pokemon.boosts)) {
            if (boost > 0) boostCount += boost;
        }
        value.set(20 + 20 * boostCount);
    }
    if (move.id === 'trumpcard') {
        const ppLeft = 5 - this.ppUsed(move, pokemon);
        let basePower = 40;
        if (ppLeft === 1) basePower = 200;
        else if (ppLeft === 2) basePower = 80;
        else if (ppLeft === 3) basePower = 60;
        else if (ppLeft === 4) basePower = 50;
        value.set(basePower);
    }
    if (move.id === 'magnitude') {
        value.setRange(10, 150);
    }
    if (['venoshock', 'barbbarrage'].includes(move.id) && target) {
        if (['psn', 'tox'].includes(target.status)) {
            value.modify(2, move.name + ' + Poison');
        }
    }
    if (move.id === 'wakeupslap' && target) {
        if (target.status === 'slp') {
            value.modify(2, 'Wake-Up Slap + Sleep');
        }
    }
    if (move.id === 'weatherball') {
        if (this.battle.weather !== 'deltastream') {
            value.weatherModify(2);
        }
    }
    if (move.id === 'hydrosteam') {
        value.weatherModify(1.5, 'Sunny Day');
    }
    if (move.id === 'psyblade' && this.battle.hasPseudoWeather('Electric Terrain')) {
        value.modify(1.5, 'Electric Terrain');
    }
    if (move.id === 'terrainpulse' && pokemon.isGrounded(serverPokemon)) {
        if (
            this.battle.hasPseudoWeather('Electric Terrain') ||
            this.battle.hasPseudoWeather('Grassy Terrain') ||
            this.battle.hasPseudoWeather('Misty Terrain') ||
            this.battle.hasPseudoWeather('Psychic Terrain')
        ) {
            value.modify(2, 'Terrain Pulse boost');
        }
    }
    if (
        move.id === 'watershuriken' && pokemon.getSpeciesForme() === 'Greninja-Ash' && pokemon.ability === 'Battle Bond'
    ) {
        value.set(20, 'Battle Bond');
    }
    // Moves that check opponent speed
    if (move.id === 'electroball' && target) {
        let [minSpe, maxSpe] = this.getSpeedRange(target);
        let minRatio = (modifiedStats.spe / maxSpe);
        let maxRatio = (modifiedStats.spe / minSpe);
        let min;
        let max;

        if (minRatio >= 4) min = 150;
        else if (minRatio >= 3) min = 120;
        else if (minRatio >= 2) min = 80;
        else if (minRatio >= 1) min = 60;
        else min = 40;

        if (maxRatio >= 4) max = 150;
        else if (maxRatio >= 3) max = 120;
        else if (maxRatio >= 2) max = 80;
        else if (maxRatio >= 1) max = 60;
        else max = 40;

        value.setRange(min, max);
    }
    if (move.id === 'gyroball' && target) {
        let [minSpe, maxSpe] = this.getSpeedRange(target);
        let min = (Math.floor(25 * minSpe / modifiedStats.spe) || 1);
        if (min > 150) min = 150;
        let max = (Math.floor(25 * maxSpe / modifiedStats.spe) || 1);
        if (max > 150) max = 150;
        value.setRange(min, max);
    }
    // Moves which have base power changed due to items
    if (serverPokemon.item) {
        let item = Dex.items.get(serverPokemon.item);
        if (move.id === 'fling' && item.fling) {
            value.itemModify(item.fling.basePower);
        }
        if (move.id === 'naturalgift') {
            value.itemModify(item.naturalGift.basePower);
        }
    }
    // Moves which have base power changed according to weight
    if (['lowkick', 'grassknot', 'heavyslam', 'heatcrash'].includes(move.id)) {
        let isGKLK = ['lowkick', 'grassknot'].includes(move.id);
        if (target) {
            let targetWeight = target.getWeightKg();
            let pokemonWeight = pokemon.getWeightKg(serverPokemon);
            let basePower;
            if (isGKLK) {
                basePower = 20;
                if (targetWeight >= 200) basePower = 120;
                else if (targetWeight >= 100) basePower = 100;
                else if (targetWeight >= 50) basePower = 80;
                else if (targetWeight >= 25) basePower = 60;
                else if (targetWeight >= 10) basePower = 40;
            } else {
                basePower = 40;
                if (pokemonWeight >= targetWeight * 5) basePower = 120;
                else if (pokemonWeight >= targetWeight * 4) basePower = 100;
                else if (pokemonWeight >= targetWeight * 3) basePower = 80;
                else if (pokemonWeight >= targetWeight * 2) basePower = 60;
            }
            if (target.volatiles['dynamax']) {
                value.set(0, 'blocked by target\'s Dynamax');
            } else {
                value.set(basePower);
            }
        } else {
            value.setRange(isGKLK ? 20 : 40, 120);
        }
    }
    // Base power based on times hit
    if (move.id === 'ragefist') {
        value.set(Math.min(350, 50 + 50 * pokemon.timesAttacked),
            pokemon.timesAttacked > 0
                ? `Hit ${pokemon.timesAttacked} time${pokemon.timesAttacked > 1 ? 's' : ''}`
                : undefined);
    }
    if (!value.value) return value;

    // Other ability boosts
    if (pokemon.status === 'brn' && move.category === 'Special') {
        value.abilityModify(1.5, "Flare Boost");
    }
    if (move.flags['punch']) {
        value.abilityModify(1.2, 'Iron Fist');
    }
    if (move.flags['pulse']) {
        value.abilityModify(1.5, "Mega Launcher");
    }
    if (move.flags['bite']) {
        value.abilityModify(1.5, "Strong Jaw");
    }
    if (value.value <= 60) {
        value.abilityModify(1.5, "Technician");
    }
    if (['psn', 'tox'].includes(pokemon.status) && move.category === 'Physical') {
        value.abilityModify(1.5, "Toxic Boost");
    }
    if (this.battle.gen > 2 && serverPokemon.status === 'brn' && move.id !== 'facade' && move.category === 'Physical') {
        if (!value.tryAbility("Guts")) value.modify(0.5, 'Burn');
    }
    if (['Rock', 'Ground', 'Steel'].includes(moveType) && this.battle.weather === 'sandstorm') {
        if (value.tryAbility("Sand Force")) value.weatherModify(1.3, "Sandstorm", "Sand Force");
    }
    if (move.secondaries) {
        value.abilityModify(1.3, "Sheer Force");
    }
    if (move.flags['contact']) {
        value.abilityModify(1.3, "Tough Claws");
    }
    if (move.flags['sound']) {
        value.abilityModify(1.3, "Punk Rock");
    }
    if (move.flags['slicing']) {
        value.abilityModify(1.5, "Sharpness");
    }
    for (let i = 1; i <= 5 && i <= pokemon.side.faintCounter; i++) {
        if (pokemon.volatiles[`fallen${i}`]) {
            value.abilityModify(1 + 0.1 * i, "Supreme Overlord");
        }
    }
    if (target) {
        if (["MF", "FM"].includes(pokemon.gender + target.gender)) {
            value.abilityModify(0.75, "Rivalry");
        } else if (["MM", "FF"].includes(pokemon.gender + target.gender)) {
            value.abilityModify(1.25, "Rivalry");
        }
    }
    const noTypeOverride = [
        'judgment', 'multiattack', 'naturalgift', 'revelationdance', 'struggle', 'technoblast', 'terrainpulse', 'weatherball',
    ];
    const allowTypeOverride = !noTypeOverride.includes(move.id) && (move.id !== 'terablast' || !pokemon.terastallized);
    if (
        move.category !== 'Status' && allowTypeOverride && !move.isZ && !move.isMax &&
        !move.id.startsWith('hiddenpower')
    ) {
        if (move.type === 'Normal') {
            value.abilityModify(this.battle.gen > 6 ? 1.2 : 1.3, "Aerilate");
            value.abilityModify(this.battle.gen > 6 ? 1.2 : 1.3, "Galvanize");
            value.abilityModify(this.battle.gen > 6 ? 1.2 : 1.3, "Pixilate");
            value.abilityModify(this.battle.gen > 6 ? 1.2 : 1.3, "Refrigerate");
        }
        if (this.battle.gen > 6) {
            value.abilityModify(1.2, "Normalize");
        }
    }
    if (move.recoil || move.hasCrashDamage) {
        value.abilityModify(1.2, 'Reckless');
    }

    if (move.category !== 'Status') {
        let auraBoosted = '';
        let auraBroken = false;
        for (const ally of pokemon.side.active) {
            if (!ally || ally.fainted) continue;
            let allyAbility = this.getAllyAbility(ally);
            if (moveType === 'Fairy' && allyAbility === 'Fairy Aura') {
                auraBoosted = 'Fairy Aura';
            } else if (moveType === 'Dark' && allyAbility === 'Dark Aura') {
                auraBoosted = 'Dark Aura';
            } else if (allyAbility === 'Aura Break') {
                auraBroken = true;
            } else if (allyAbility === 'Battery' && ally !== pokemon && move.category === 'Special') {
                value.modify(1.3, 'Battery');
            } else if (allyAbility === 'Power Spot' && ally !== pokemon) {
                value.modify(1.3, 'Power Spot');
            } else if (allyAbility === 'Steely Spirit' && moveType === 'Steel') {
                value.modify(1.5, 'Steely Spirit');
            }
        }
        for (const foe of pokemon.side.foe.active) {
            if (!foe || foe.fainted) continue;
            if (foe.ability === 'Fairy Aura' && moveType === 'Fairy') {
                auraBoosted = 'Fairy Aura';
            } else if (foe.ability === 'Dark Aura' && moveType === 'Dark') {
                auraBoosted = 'Dark Aura';
            } else if (foe.ability === 'Aura Break') {
                auraBroken = true;
            }
        }
        if (auraBoosted) {
            if (auraBroken) {
                value.modify(0.75, auraBoosted + ' + Aura Break');
            } else {
                value.modify(1.33, auraBoosted);
            }
        }
    }

    // Terrain
    if ((this.battle.hasPseudoWeather('Electric Terrain') && moveType === 'Electric') ||
        (this.battle.hasPseudoWeather('Grassy Terrain') && moveType === 'Grass') ||
        (this.battle.hasPseudoWeather('Psychic Terrain') && moveType === 'Psychic')) {
        if (pokemon.isGrounded(serverPokemon)) {
            value.modify(this.battle.gen > 7 ? 1.3 : 1.5, 'Terrain boost');
        }
    } else if (this.battle.hasPseudoWeather('Misty Terrain') && moveType === 'Dragon') {
        if (target ? target.isGrounded() : true) {
            value.modify(0.5, 'Misty Terrain + grounded target');
        }
    } else if (
        this.battle.hasPseudoWeather('Grassy Terrain') && ['earthquake', 'bulldoze', 'magnitude'].includes(move.id)
    ) {
        if (target ? target.isGrounded() : true) {
            value.modify(0.5, 'Grassy Terrain + grounded target');
        }
    }
    if (
        move.id === 'expandingforce' &&
        this.battle.hasPseudoWeather('Psychic Terrain') &&
        pokemon.isGrounded(serverPokemon)
    ) {
        value.modify(1.5, 'Expanding Force + Psychic Terrain boost');
    }
    if (move.id === 'mistyexplosion' && this.battle.hasPseudoWeather('Misty Terrain')) {
        value.modify(1.5, 'Misty Explosion + Misty Terrain boost');
    }
    if (move.id === 'risingvoltage' && this.battle.hasPseudoWeather('Electric Terrain') && target?.isGrounded()) {
        value.modify(2, 'Rising Voltage + Electric Terrain boost');
    }
    if (
        move.id === 'steelroller' &&
        !this.battle.hasPseudoWeather('Electric Terrain') &&
        !this.battle.hasPseudoWeather('Grassy Terrain') &&
        !this.battle.hasPseudoWeather('Misty Terrain') &&
        !this.battle.hasPseudoWeather('Psychic Terrain')
    ) {
        value.set(0, 'no Terrain');
    }

    // Item
    value = this.getItemBoost(move, value, moveType);

    return value;
}