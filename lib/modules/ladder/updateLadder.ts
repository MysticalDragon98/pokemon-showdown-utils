import { cold, highlight, log } from "termx";
import { LadderEntryModel } from "../../db/models/ladderEntry.model";
import { LadderSnapshotModel } from "../../db/models/ladderSnapshot.model";
import { sha256 } from "../crypto/sha256";
import toId from "../utils/toId";
import getLadder from "./getLadder";

export default async function updateLadder (format: string) {
    const ladder = await getLadder(format);
    const hash = sha256([format, ladder]);

    const currentSnapshot = await LadderSnapshotModel.findOne({ hash });
    if (currentSnapshot) return;

    log(`Updating ladder for ${cold(format)}: ${highlight(hash)}...`);

    const snapshot = await LadderSnapshotModel.create({
        format,
        hash,
        createdAt: new Date()
    });

    const entries = ladder.map((entry, index) => ({
        ladderSnapshotId: snapshot._id,
        player: toId(entry.name),
        rank: entry.rank,
        gxe: entry.gxe,
        glicko: entry.glicko,
        createdAt: new Date()
    }));

    await LadderEntryModel.insertMany(entries);

    return snapshot
}
