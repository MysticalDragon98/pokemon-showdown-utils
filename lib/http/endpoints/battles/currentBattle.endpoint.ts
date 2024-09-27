import { BattleModel } from "../../../db/models/battle.model";
import aggregateBattle from "../../../modules/battles/aggregateBattle";

export default async function currentBattle () {
    const battle = await BattleModel.findOne({ current: true });

    return await aggregateBattle(battle);
}
