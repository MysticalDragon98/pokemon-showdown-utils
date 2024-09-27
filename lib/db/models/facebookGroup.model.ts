import { prop, getModelForClass } from '@typegoose/typegoose';

export class FacebookGroup {
    @prop({ required: true }) name: string;
    @prop({ required: true, unique: true }) id: string;
    @prop({ required: true }) url: string;
    @prop({ required: true }) createdAt: Date;
}

export const FacebookGroupModel = getModelForClass(FacebookGroup);
