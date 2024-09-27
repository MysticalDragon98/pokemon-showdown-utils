import { BattleModel } from "../../db/models/battle.model";

export default async function getBattleById (id: string) {
    return await BattleModel.findOne({ id });
}
