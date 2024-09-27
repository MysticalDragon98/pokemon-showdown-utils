import { BattleSideModel } from "../../db/models/battleSide.model";

export default async function getBattleSides (battleId: string) {
    return await BattleSideModel.find({ battleId });
}
