import { TournamentMatchModel } from "../../db/models/tournamentMatch.model";
import toId from "../utils/toId";

export default async function setTournamentMatch (tournamentId: string, round: number, player1: string, player2: string) {
    await TournamentMatchModel.create({
        tournamentId: toId(tournamentId),
        round,
        player1: toId(player1),
        player2: toId(player2),
        createdAt: new Date(),
    });
}
