import { prop, getModelForClass, index } from '@typegoose/typegoose';

@index({ facebookUserId: 1, facebookTournamentId: 1 }, { unique: true })
export class FacebookTournamentPlayer {
    @prop({ required: true }) facebookUserId: string;
    @prop({ required: true }) facebookTournamentId: string;
    @prop({ required: true, default: true }) active: boolean;
    @prop({ required: true }) createdAt: Date;
    @prop() facebookTournamentTeam?: string;
}

export const FacebookTournamentPlayerModel = getModelForClass(FacebookTournamentPlayer);
