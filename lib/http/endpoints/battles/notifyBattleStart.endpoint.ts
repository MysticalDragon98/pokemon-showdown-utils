import updateBattleSide from "../../../modules/battle-sides/updateBattleSide";
import ensureBattle from "../../../modules/battles/ensureBattle";
import updateBattle from "../../../modules/battles/updateBattle";
import toId from "../../../modules/utils/toId";

export default async function notifyBattleStart (battleId: string, player1: string, player2: string, format: string, avatar1: string, avatar2: string) {
    await ensureBattle(battleId);

    await updateBattleSide(battleId, toId(player1), { avatar: avatar1 }, { ensure: true });
    await updateBattleSide(battleId, toId(player2), { avatar: avatar2 }, { ensure: true });

    await updateBattle(battleId, {
        id: battleId,
        players: [toId(player1), toId(player2)],
        format: toId(format)
    });

    return {
        success: true,
        message: `Battle ${battleId} started`,
    }
}
