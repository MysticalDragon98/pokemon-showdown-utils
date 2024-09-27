import { FacebookUser, FacebookUserModel } from "../../../db/models/facebookUser.model";
import toId from "../../../modules/utils/toId";

export default async function registerFacebookUser (user: Partial<FacebookUser>) {
    const previousUser = await FacebookUserModel.findOne({ id: toId(user.name) });

    if (previousUser) {
        await FacebookUserModel.updateOne({ id: toId(user.name) }, {
            ...user,
            name: previousUser.name,
            id: previousUser.id,
            ownership: previousUser.ownership
        });
        return {
            success: true,
            message: 'Facebook user updated',
            data: previousUser
        }
    }
    const fbUser = await FacebookUserModel.create({ ...user, id: toId(user.name) });
    
    return {
        success: true,
        message: 'Facebook user registered',
        data: fbUser
    };
}
