import { BattleModel } from "../../db/models/battle.model";

export default async function getCurrentBattle () {
    return await BattleModel.findOne({ current: true });
}
