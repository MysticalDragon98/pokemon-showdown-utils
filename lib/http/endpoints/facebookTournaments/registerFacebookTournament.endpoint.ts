import { FacebookTournament, FacebookTournamentModel } from "../../../db/models/facebookTournament.model";
import { $ok } from "../../../exceptions";
import getFacebookGroup from "../../../modules/facebookGroup/getFacebookGroup";
import getFacebookUserByName from "../../../modules/facebookUser/getFacebookUserByName";
import toId from "../../../modules/utils/toId";

export default async function registerFacebookTournament (tournament: Partial<FacebookTournament>) {
    const previousTournament = await FacebookTournamentModel.findOne({ url: tournament.url });
    const organizer = await getFacebookUserByName(tournament.organizer);
    const group = await getFacebookGroup(tournament.facebookGroup);

    $ok(organizer, 'ORGANIZER_NOT_FOUND', 'Organizer not found: ' + toId(tournament.organizer));
    $ok(group, 'GROUP_NOT_FOUND', 'Facebook group not found: ' + toId(tournament.facebookGroup));

    if (previousTournament) {
        await FacebookTournamentModel.updateOne({ url: tournament.url }, {
            ...tournament,
            url: tournament.url,
            id: toId(tournament.name ?? previousTournament.name),
            organizer: toId(tournament.organizer ?? previousTournament.organizer),
            facebookGroup: toId(tournament.facebookGroup ?? previousTournament.facebookGroup),
        });

        return {
            success: true,
            message: 'Tournament updated successfully',
            tournament: await FacebookTournamentModel.findOne({ url: tournament.url }),
        }
    }

    const newTournament = await FacebookTournamentModel.create({
        ...tournament,
        id: toId(tournament.name),
        organizer: toId(tournament.organizer),
        facebookGroup: toId(tournament.facebookGroup),
        createdAt: new Date(),
    });

    return {
        success: true,
        message: 'Tournament registered successfully',
        tournament: newTournament,
    };
}
