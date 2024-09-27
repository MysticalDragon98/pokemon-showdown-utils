import ensureBattle from "../../../modules/battles/ensureBattle";
import updateBattle from "../../../modules/battles/updateBattle";
import downloadReplay from "../../../modules/replays/downloadReplay";
import getReplayHtmlUrl from "../../../modules/replays/getReplayHtmlUrl";

export default async function notifyReplay (battleId: string, replay: string) {
    await ensureBattle(battleId);
    await downloadReplay(battleId, replay);

    await updateBattle(battleId, { replay: getReplayHtmlUrl(battleId) });

    return {
        success: true,
        message: "Replay successfuly updated to: " + replay
    };
}
