import { Battle, BattleModel } from "../../db/models/battle.model";
import { BattlesNamespace } from "../../http/sockets/namespaces";

export default async function updateBattle (battleId: string, options: Partial<Battle>) {
    await BattleModel.updateOne({ id: battleId }, options);
    
    BattlesNamespace.broadcast('update', battleId);
}
