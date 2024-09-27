import { BattleSide, BattleSideModel } from "../../db/models/battleSide.model";
import { BattlesNamespace } from "../../http/sockets/namespaces";
import ensureBattleSide from "./ensureBattleSide";
import getBattleSide from "./getBattleSide";

export default async function updateBattleSide (battleId: string, player: string, updates: Partial<BattleSide>, { ensure }: { ensure: boolean } = { ensure: false }) {
    if (ensure) await ensureBattleSide(battleId, player, updates.avatar);

    await BattleSideModel.updateOne({ battleId, player }, updates);
    await BattlesNamespace.broadcast('update:side', { battleId, player });
}
