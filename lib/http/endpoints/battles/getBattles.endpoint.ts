import { BattleModel } from "../../../db/models/battle.model";

export default async function getBattles (filter: any, options: any) {
    return await BattleModel.find(filter, null, options);
}
