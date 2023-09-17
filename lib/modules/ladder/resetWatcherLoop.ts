import { LadderWatcherModel } from "../../db/models/ladderWatcher.model";
import updateLadder from "./updateLadder";

const Intervals: any = {};

export default async function resetWatcherLoop () {
    const ladders = await LadderWatcherModel.find({ enabled: true });

    for (const interval in Intervals) {
        clearInterval(Intervals[interval]);
        delete Intervals[interval];
    }

    for (const ladder of ladders) {
        await updateLadder(ladder.format);
        Intervals[ladder.format] = setInterval(() => updateLadder(ladder.format), ladder.interval);
    }
}
