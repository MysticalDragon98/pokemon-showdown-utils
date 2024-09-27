import { TournamentRoundModel } from "../../../db/models/tournamentRound.model";
import { $ok } from "../../../exceptions";
import getFacebookTournamentByName from "../../../modules/facebookTournament/getFacebookTournamentByName";
import getFacebookTournamentPlayer from "../../../modules/facebookTournamentPlayer/getFacebookTournamentPlayer";
import getFacebookUserByName from "../../../modules/facebookUser/getFacebookUserByName";
import getTournamentMatch from "../../../modules/tournamentMatch/getTournamentMatch";
import getTournamentMatches from "../../../modules/tournamentMatch/getTournamentMatches";
import setTournamentMatch from "../../../modules/tournamentMatch/setTournamentMatch";
import toId from "../../../modules/utils/toId";

export default async function registerRound (round: number, tournamentId: string, url: string, matches: string[][]) {
    //* Check if the tournament exists
        $ok(await getFacebookTournamentByName(tournamentId), "TOURNAMENT_NOT_FOUND", `Tournament ${tournamentId} not found`);

    //* Check if the players are inside the tournament
        await Promise.all(await matches.map(async ([ player1, player2 ]) => {
            $ok(player1 !== player2, "PLAYER_CANNOT_FIGHT_HIMSELF", `Player ${player1} cannot play against himself`);

            const [ dbPlayer1, dbPlayer2, p1, p2 ] = await Promise.all([
                getFacebookTournamentPlayer(tournamentId, player1),
                getFacebookTournamentPlayer(tournamentId, player2),
                getFacebookUserByName(player1),
                getFacebookUserByName(player2)
            ]);

            $ok(p1, "PLAYER_NOT_FOUND", `Player ${player1} not found`);
            $ok(p2, "PLAYER_NOT_FOUND", `Player ${player2} not found`);
            $ok(dbPlayer1, "PLAYER_NOT_ACTIVE", `Player ${player1} is not in the tournament`);
            $ok(dbPlayer2, "PLAYER_NOT_ACTIVE", `Player ${player2} is not in the tournament`);
        }));
    
    //* Create the matches
        const dbRound = await TournamentRoundModel.updateOne({ tournamentId: toId(tournamentId), round }, { url }, { upsert: true, returnDocument: "after" });
        await Promise.all(await matches.map(async ([ player1, player2 ]) => {
            if (await getTournamentMatch(tournamentId, round, player1, player2)) return;
            
            await setTournamentMatch(tournamentId, round, player1, player2);
        }));

        const allMatches = await getTournamentMatches(tournamentId, round);

    return {
        success: true,
        message: `Round ${round} registered for tournament ${tournamentId}`,
        round: await TournamentRoundModel.findOne({ tournamentId: toId(tournamentId), round }),
        matches: allMatches.map(match => ({
            player1: match.player1,
            player2: match.player2,
            winner: match.winner,
            replay: match.replay,
        }))
    }
}
