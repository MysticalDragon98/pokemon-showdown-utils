import { TournamentMatchModel } from "../../db/models/tournamentMatch.model";
import toId from "../utils/toId";

export default async function getTournamentMatches (tournamentId: string, round: number) {
    return await TournamentMatchModel.find({ tournamentId: toId(tournamentId), round });
}
