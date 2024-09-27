import { FacebookTournamentPlayerModel } from "../../db/models/facebookTournamentPlayer.model";
import toId from "../utils/toId";

export default async function getFacebookTournamentPlayer (facebookTournamentId: string, facebookUserId: string) {
    return await FacebookTournamentPlayerModel.findOne({
        facebookTournamentId: toId(facebookTournamentId),
        facebookUserId: toId(facebookUserId),
    });
}
