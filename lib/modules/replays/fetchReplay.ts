import Axios from "axios";
import { $ok } from "../../exceptions";

const searchStart = '<script type="text/plain" class="log">';
const searchEnd = '</script>';

export default async function fetchReplay (url: string) {
    const data = await Axios.get(url).catch(() => {
        throw new Error('REPLAY_NOT_FOUND');
    });
    const text = data.data;
    const start = text.substring(text.indexOf(searchStart) + searchStart.length);
    
    $ok(start.includes(searchEnd), 'REPLAY_NOT_FOUND', 'Replay not found: ' + url);

    const html = data.data
        .replace(
            '<script type="text/plain" class="log">',
            '<script type="text/plain" class="battle-log-data log">'
        ).replace(
            '<script src="/js/replay.js',
            '<script src="//play.pokemonshowdown.com/js/replay-embed.js'
        );
    

    return {
        raw: start.substring(0, start.indexOf(searchEnd)),
        html
    }
}
