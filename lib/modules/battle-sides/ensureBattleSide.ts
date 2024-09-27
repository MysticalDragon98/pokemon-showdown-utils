import { BattleSideModel } from "../../db/models/battleSide.model";
import { BattlesNamespace } from "../../http/sockets/namespaces";
import getBattleSide from "./getBattleSide";

export default async function ensureBattleSide (battleId: string, player: string, avatar: string = '') {
    const currentBattleSide = await getBattleSide(battleId, player);
    if (!currentBattleSide) {
        await BattleSideModel.create({
            battleId,
            player,
            avatar,
        });
    }

    BattlesNamespace.broadcast('create:side', { battleId, player });
}
