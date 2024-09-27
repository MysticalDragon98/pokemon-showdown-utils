import clearCurrentBattle from "../../../modules/battles/clearCurrentBattle";
import ensureBattle from "../../../modules/battles/ensureBattle";
import updateBattle from "../../../modules/battles/updateBattle";
import { CurrentBattleNamespace } from "../../sockets/namespaces";

export default async function notifyCurrentBattle (battleId: string) {
    if (!battleId) {
        await clearCurrentBattle();
        CurrentBattleNamespace.broadcast('current', null);
        
        return {
            success: true,
            message: `Current battle set to null`,
        }
    }

    await clearCurrentBattle();
    await ensureBattle(battleId);
    await updateBattle(battleId, { current: true, });

    CurrentBattleNamespace.broadcast('current', battleId);

    return {
        success: true,
        message: `Current battle set to ${battleId}`,
    }
}
