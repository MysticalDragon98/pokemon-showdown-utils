import { BattleModel } from "../../../db/models/battle.model";
import { $ok } from "../../../exceptions";
import toId from "../../../modules/utils/toId";

export default async function marker (player1: string, player2: string, format: string) {
    $ok(player1, 'MISSING_PARAMETER', 'Player 1 is required');
    $ok(player2, 'MISSING_PARAMETER', 'Player 2 is required');
    $ok(format, 'MISSING_PARAMETER', 'Format is required');

    player1 = toId(player1);
    player2 = toId(player2);

    const results = await BattleModel.aggregate([
        {
            $match: {
                players: { $all: [player1, player2] },
                format: toId(format)
            }
        },
        {
            $group: {
                _id: "$winner",
                count: { $sum: 1 }
            }
        },
        {
            $group: {
                _id: null,
                results: {
                    $push: { k: "$_id", v: "$count" }
                },
                total: { $sum: "$count" }
            }
        },
        {
            $project: {
                _id: 0,
                results: {
                    $arrayToObject: "$results"
                },
                total: "$total"
            }
        }
     ]);

     const result = results[0] || { results: {}, total: 0 };

     return {
        [player1]: result.results[player1] || 0,
        [player2]: result.results[player2] || 0,
        total: result.total
     }
}
