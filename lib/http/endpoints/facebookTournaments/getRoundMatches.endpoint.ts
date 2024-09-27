import getTournamentMatches from "../../../modules/tournamentMatch/getTournamentMatches";

export default async function getRoundMatches (tournamentId: string, round: number) {
    const matches = await getTournamentMatches(tournamentId, round);

    return matches.map(match => ({
        player1: match.player1,
        player2: match.player2,
        winner: match.winner,
    }));
}