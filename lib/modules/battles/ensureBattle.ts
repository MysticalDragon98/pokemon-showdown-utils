import { BattleModel } from "../../db/models/battle.model";
import { BattlesNamespace } from "../../http/sockets/namespaces";
import getBattleById from "./getBattleById";

export default async function ensureBattle (id: string) {
    if(!await getBattleById(id)) {
        await BattleModel.create({
            id,
            players: [],
            sides: [],
        });

        BattlesNamespace.broadcast('create', { id });
    }
}
