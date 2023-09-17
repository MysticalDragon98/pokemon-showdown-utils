import { LadderWatcherModel } from "../../../db/models/ladderWatcher.model";

export default async function removeLadderFromWatcher (format: string) {
    await LadderWatcherModel.updateOne(
        { format },
        { enabled: false }
    );
}
