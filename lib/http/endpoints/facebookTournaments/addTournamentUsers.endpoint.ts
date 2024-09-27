import { log, warning } from "termx";
import { $ok } from "../../../exceptions";
import getFacebookTournamentByName from "../../../modules/facebookTournament/getFacebookTournamentByName";
import getFacebookTournamentPlayer from "../../../modules/facebookTournamentPlayer/getFacebookTournamentPlayer";
import getFacebookUserByName from "../../../modules/facebookUser/getFacebookUserByName";
import addFacebookTournamentPlayerToTournament from "../../../modules/facebookTournamentPlayer/addFacebookTournamentPlayerToTournament";

export default async function addTournamentUsers (facebookTournamentId: string, facebookUserIds: string[]) {
    //* Validate if tournament exists
        const tournament = await getFacebookTournamentByName(facebookTournamentId);
        $ok(tournament, "TOURNAMENT_NOT_FOUND", "Tournament not found: " + facebookTournamentId);
    //* Validate if user exists
        for (const facebookUserId of facebookUserIds) {
            const user = await getFacebookUserByName(facebookUserId);
            $ok(user, "USER_NOT_FOUND", "User not found: " + facebookUserId);
        }

    //* Add users to tournament
        for (const facebookUserId of facebookUserIds) {
            const existingPlayer = await getFacebookTournamentPlayer(facebookTournamentId, facebookUserId);

            if (existingPlayer) {
                log(warning(`User ${facebookUserId} is already registered in tournament ${facebookTournamentId}`));
                continue;
            }

            await addFacebookTournamentPlayerToTournament(facebookTournamentId, facebookUserId);
        }

    return {
        success: true,
        message: "Users successfully added to the tournament",
    };
}
