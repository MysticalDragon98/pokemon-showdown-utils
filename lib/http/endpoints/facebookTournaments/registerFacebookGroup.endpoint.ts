import { FacebookGroup, FacebookGroupModel } from "../../../db/models/facebookGroup.model";
import toId from "../../../modules/utils/toId";

export default async function registerFacebookGroup (group: Partial<FacebookGroup>) {
    const existingGroup = await FacebookGroupModel.findOne({ id: toId(group.name) });

    if (existingGroup) {
        await FacebookGroupModel.updateOne({ id: toId(group.name) }, {
            ...group,
            id: toId(group.name)
        });

        return {
            success: true,
            message: `Facebook group ${group.name} updated`,
        }
    };

    await FacebookGroupModel.create({
        ...group,
        id: toId(group.name),
        createdAt: new Date()
    });

    return {
        success: true,
        message: `Facebook group ${group.name} registered`,
    }
}
