import { BattleSideModel } from "../../db/models/battleSide.model";

export default async function getBattleSide (battleId: string, player: string) {
    return await BattleSideModel.findOne({ battleId, player });
}
