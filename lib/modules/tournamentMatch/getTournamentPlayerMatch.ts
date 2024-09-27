import { TournamentMatchModel } from "../../db/models/tournamentMatch.model";
import toId from "../utils/toId";

export default async function getTournamentPlayerMatch (tournamentId: string, round: number, playerId: string) {
    return await TournamentMatchModel.findOne({
        tournamentId: toId(tournamentId),
        round,
        $or: [
            { player1: toId(playerId) },
            { player2: toId(playerId) }
        ]
    });
}
