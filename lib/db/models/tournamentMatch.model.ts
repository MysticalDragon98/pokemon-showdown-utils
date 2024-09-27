import { prop, getModelForClass, index } from '@typegoose/typegoose';

@index({ tournamentId: 1, round: 1, player1: 1 }, { unique: true })
@index({ tournamentId: 1, round: 1, player2: 1 }, { unique: true })
export class TournamentMatch {
    @prop({ required: true, index: true }) tournamentId: string;
    @prop({ required: true }) round: number;
    @prop({ required: true }) player1: string;
    @prop({ required: true }) player2: string;
    @prop({ required: true }) createdAt: Date;
    @prop() winner?: string;
    @prop() replay?: string;
}

export const TournamentMatchModel = getModelForClass(TournamentMatch);
