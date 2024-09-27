import { TournamentMatchModel } from "../../db/models/tournamentMatch.model";
import toId from "../utils/toId";

export default async function getTournamentMatch (tournamentId: string, round: number, player1: string, player2: string) {
    return await TournamentMatchModel.findOne({
        tournamentId: toId(tournamentId),
        round,
        $or: [
            { player1: toId(player1), player2: toId(player2) },
            { player1: toId(player2), player2: toId(player1) }
        ]
    });
}
