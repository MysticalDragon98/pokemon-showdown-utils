import { join } from "path";
import { $REPLAYS_FOLDER } from "../../env";
import { readFile } from "fs/promises";

export default async function getCachedReplay (id: string) {
    const html = await readFile(join($REPLAYS_FOLDER, 'html', `${id}.html`), 'utf8').catch(() => null);
    const raw = await readFile(join($REPLAYS_FOLDER, 'raw', `${id}.psreplay`), 'utf8').catch(() => null);

    return {
        html,
        raw
    };
}
