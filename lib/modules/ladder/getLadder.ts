import Axios from "axios";
import toId from "../utils/toId";
import getDbLadder from "./getDbLadder";

export default async function getLadder (format: string) {
    const formatId = toId(format);
    const html = await Axios.get(`https://pokemonshowdown.com/ladder/${formatId}`);
    const htmlStr = html.data;
    const table = htmlStr.substring(htmlStr.indexOf("<table>") + "<table>".length, htmlStr.indexOf("</table>"));

    const rows = table
        .split("</tr>")
        .map(row => row.replace("<tr>", "").trim())
        .filter(row => row.length > 0)
        .slice(1);
    const ladder = rows.map(row => {
        const cells = row.split("</td>")
            .map(cell => cell.replace(/<(.+?)>/g, "").trim())
            .filter(cell => cell.length > 0);
        const rank = parseInt(cells[0]);
        const name = cells[1];
        const gxe = parseFloat(cells[2]);
        const glicko = parseFloat(cells[3]);

        return {
            rank,
            id: toId(name),
            name,
            gxe: isNaN(gxe) ? 0 : gxe,
            glicko: isNaN(glicko) ? 0 : glicko
        };
    });

    return ladder as  {
        rank: number;
        id: string;
        name: string;
        gxe: number;
        glicko: number;
    }[];
}
