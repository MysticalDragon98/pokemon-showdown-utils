import { LadderWatcherModel } from "../../../db/models/ladderWatcher.model";
import resetWatcherLoop from "../../../modules/ladder/resetWatcherLoop";

export default async function addLadderToWatcher (format: string, interval: number) {
    interval = interval ?? 1000 * 60 * 5;

    await LadderWatcherModel.updateOne(
        { format },
        { enabled: true, interval },
        { upsert: true }
    );

    resetWatcherLoop();

    return {
        format,
        interval
    }
}
