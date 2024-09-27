import { TournamentMatchModel } from "../../../db/models/tournamentMatch.model";
import { $ok } from "../../../exceptions";
import getTournamentPlayerMatch from "../../../modules/tournamentMatch/getTournamentPlayerMatch";
import toId from "../../../modules/utils/toId";

export default async function reportWin (tournamentId: string, round: number, winner: string) {
    const match = await getTournamentPlayerMatch(tournamentId, round, winner);
    $ok(match, "MATCH_NOT_FOUND", "Match not found for player: " + winner);

    await TournamentMatchModel.updateOne({ _id: match._id }, { winner: toId(winner) });

    return {
        success: true,
        message: "Match reported successfully",
        match: await getTournamentPlayerMatch(tournamentId, round, winner)
    }
}
