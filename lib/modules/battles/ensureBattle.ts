import { BattleModel } from "../../db/models/battle.model";

export default async function ensureBattle (id: string) {
    await BattleModel.updateOne({ id }, { id }, { upsert: true });
}
