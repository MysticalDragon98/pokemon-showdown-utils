import getCachedReplay from "../../../modules/replays/getCachedReplay";

export default async function replay (id: string) {
    const { html } = await getCachedReplay(id);

    return {
        $raw: Buffer.from(html),
        ctype: "text/html"
    }
}
