import { FacebookTournamentPlayerModel } from "../../db/models/facebookTournamentPlayer.model";
import toId from "../utils/toId";

export default async function addFacebookTournamentPlayerToTournament (facebookTournamentId: string, facebookUserId: string) {
    await FacebookTournamentPlayerModel.create({
        facebookTournamentId: toId(facebookTournamentId),
        facebookUserId: toId(facebookUserId),
        active: true,
        createdAt: new Date(),
    });
}
