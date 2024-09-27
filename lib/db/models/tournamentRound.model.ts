import { prop, getModelForClass, modelOptions, index } from '@typegoose/typegoose';

@modelOptions({ options: { allowMixed: 0 }})
@index({ tournamentId: 1, round: 1 }, { unique: true })
export class TournamentRound {
    @prop({ required: true }) tournamentId: string;
    @prop({ required: true }) round: number;
    @prop({ required: true }) url: string;
    @prop({ required: true }) createdAt: Date;
}

export const TournamentRoundModel = getModelForClass(TournamentRound);
