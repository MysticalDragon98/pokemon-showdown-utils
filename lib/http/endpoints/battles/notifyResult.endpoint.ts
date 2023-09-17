import { BattleModel } from "../../../db/models/battle.model";
import { $ok } from "../../../exceptions";
import ensureBattle from "../../../modules/battles/ensureBattle";
import toId from "../../../modules/utils/toId";

export default async function notifyResult (battleId: string, winner: string, loser: string, format: string) {
    $ok(battleId, 'MISSING_PARAMETER', 'Battle ID is required');
    $ok(winner, 'MISSING_PARAMETER', 'Winner is required');
    $ok(loser, 'MISSING_PARAMETER', 'Loser is required');
    $ok(format, 'MISSING_PARAMETER', 'Format is required');

    await ensureBattle(battleId);

    await BattleModel.updateOne({ id: battleId }, {
        players: [toId(winner), toId(loser)],
        winner: toId(winner),
        loser: toId(loser),
        format: toId(format)
    });

    return {
        success: true,
        message: `Battle ${battleId} updated`,
    }
}
