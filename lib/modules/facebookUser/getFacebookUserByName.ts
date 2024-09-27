import { FacebookUserModel } from "../../db/models/facebookUser.model";
import toId from "../utils/toId";

export default async function getFacebookUserByName (name: string) {
    return await FacebookUserModel.findOne({
        id: toId(name),
    })
}
