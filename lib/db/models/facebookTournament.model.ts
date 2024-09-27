import { prop, getModelForClass, modelOptions } from '@typegoose/typegoose';
import { FacebookUserID } from '../../types/FacebookUserID.type';
import { BattleClause } from '../../enums/BattleClause.enum';

@modelOptions({ options: { allowMixed: 0}})
export class FacebookTournament {
    @prop({ required: true }) name: string;
    @prop() description: string;
    @prop({ required: true, unique: true }) id: string;
    @prop({ required: true, unique: true }) url: string;
    @prop({ required: true }) format: string;
    @prop({ required: true }) clauses: BattleClause[];
    @prop({ required: true }) organizer: FacebookUserID;
    @prop({ required: true }) createdAt: Date;
    @prop({ required: true }) facebookGroup: string;
}

export const FacebookTournamentModel = getModelForClass(FacebookTournament);
