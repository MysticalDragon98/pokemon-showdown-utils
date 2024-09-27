import { Battle } from "../../db/models/battle.model";
import getBattleSides from "../battle-sides/getBattleSides";

export default async function aggregateBattle (battle: Battle) {
    if (!battle) return null;
    
    return {
        id: battle.id,
        format: battle.format,
        players: battle.players,
        winner: battle.winner,
        loser: battle.loser,
        replay: battle.replay,
        current: battle.current,
        sides: await getBattleSides(battle.id),
    }
}
