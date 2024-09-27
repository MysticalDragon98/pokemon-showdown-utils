import { prop, getModelForClass, modelOptions, index } from '@typegoose/typegoose';

@modelOptions({ options: { allowMixed: 0 }})
@index({ players: 1, format: 1 })
export class Battle {
    @prop({ unique: true, index: true }) id: string;
    
    @prop({ index: true }) players?: string[];
    @prop({ index: true }) winner?: string;
    @prop({ index: true }) loser?: string;
    @prop({ index: true }) format?: string;
    
    @prop() replay?: string;
    @prop({ index: true }) current?: boolean;
    @prop() createdAt?: Date;
}

export const BattleModel = getModelForClass(Battle);
