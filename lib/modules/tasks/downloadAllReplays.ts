import { BattleModel } from "../../db/models/battle.model";
import { $HOST } from "../../env";
import downloadReplay from "../replays/downloadReplay";

export default async function downloadAllReplays () {
    const battles = await BattleModel.find({ replay: null });

    for (const battle of battles) {
        const url = `https://replay.pokemonshowdown.com/${battle.id}`;
        console.log('Downloading replay for battle: ' + battle.id + ' from: ' + url);

        try {
            await downloadReplay(
                battle.id, `https://replay.pokemonshowdown.com/${battle.id}`
            );

            await BattleModel.updateOne({
                id: battle.id
            }, {
                replay: `${$HOST}/battles/replay?id=${battle.id}`
            });
        } catch (e) {
            console.log('Error downloading replay for battle: ' + battle.id);
            console.log(e);
        }
    }
}
