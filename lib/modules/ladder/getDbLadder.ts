import { LadderEntryModel } from "../../db/models/ladderEntry.model";
import { LadderSnapshotModel } from "../../db/models/ladderSnapshot.model";
import { LadderWatcherModel } from "../../db/models/ladderWatcher.model";

export default async function getDbLadder (player: string, format: string) {
    const ladderWatcher = await LadderWatcherModel.findOne({ format });

    if (!ladderWatcher || !ladderWatcher.enabled) { return null; }

    const snapshot = LadderSnapshotModel.findOne({ format }).sort({ createdAt: -1 });
    
    return await LadderEntryModel.findOne({
        snapshot: snapshot._id,
        player
    });
}
