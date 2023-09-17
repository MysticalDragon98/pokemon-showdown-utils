import getDbLadder from "../../../modules/ladder/getDbLadder";
import getLadder from "../../../modules/ladder/getLadder";
import getTrainerCategory from "../../../modules/trainer-categories/getTrainerCategory";
import toId from "../../../modules/utils/toId";

export default async function getPlayerLadderData (player: string, format: string) {
    const cachedLadder = await getDbLadder(player, format);

    if (cachedLadder) {
        return {
            rank: cachedLadder.rank,
            id: cachedLadder.player,
            name: cachedLadder.player,
            gxe: cachedLadder.gxe,
            glicko: cachedLadder.glicko,
            category: getTrainerCategory(cachedLadder.rank)
        };
    }

    const ladder = await getLadder(format);
    const playerId = toId(player);
    const playerEntry = ladder.find(entry => entry.id === playerId);

    return playerEntry ? {
        rank: playerEntry.rank,
        id: playerEntry.id,
        name: playerEntry.name,
        gxe: playerEntry.gxe,
        glicko: playerEntry.glicko,
        category: getTrainerCategory(playerEntry.rank)
    }: null;
}
