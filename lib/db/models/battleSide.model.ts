import { prop, getModelForClass, index } from '@typegoose/typegoose';

@index({ battleId: 1, player: 1 })
export class BattleSide {
    @prop({ index: true }) battleId: string;
    @prop({ index: true }) player: string;
    @prop() avatar: string;
}

export const BattleSideModel = getModelForClass(BattleSide);
