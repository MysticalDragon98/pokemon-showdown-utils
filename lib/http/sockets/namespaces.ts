import { log } from "termx";
import Namespace from "./namespace";

export const CurrentBattleNamespace = new Namespace('/currentBattle');

CurrentBattleNamespace.on('connection', (socket) => { log('New connection to /currentBattle'); });
CurrentBattleNamespace.on('disconnect', (socket) => { log('Disconnected from /currentBattle'); });export const BattlesNamespace = new Namespace('/battles');
