import { writeFile } from "fs/promises";
import fetchReplay from "./fetchReplay";
import { join } from "path";
import { $REPLAYS_FOLDER } from "../../env";

export default async function downloadReplay (id: string, url: string) {
    const { html, raw } = await fetchReplay(url);

    await Promise.all([
        writeFile(join($REPLAYS_FOLDER, 'html', `${id}.html`), html),
        writeFile(join($REPLAYS_FOLDER, 'raw', `${id}.psreplay`), raw)
    ]);
}
