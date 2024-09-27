import getBattleSides from "../../../modules/battle-sides/getBattleSides";
import aggregateBattle from "../../../modules/battles/aggregateBattle";
import getBattleById from "../../../modules/battles/getBattleById";

export default async function getBattle (battleId: string) {
    const battle = await getBattleById(battleId);

    return await aggregateBattle(battle);
}
