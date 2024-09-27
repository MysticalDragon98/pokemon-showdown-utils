import { FacebookGroupModel } from "../../db/models/facebookGroup.model";
import toId from "../utils/toId";

export default async function getFacebookGroup (name: string) {
    return await FacebookGroupModel.findOne({
        id: toId(name)
    });
}
