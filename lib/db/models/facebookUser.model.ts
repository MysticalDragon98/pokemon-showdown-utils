import { prop, getModelForClass } from '@typegoose/typegoose';
import { AccountOwnership } from '../../enums/AccountOwnership.enum';

export class FacebookUser {
    @prop({ required: true, unique: true }) id: string;
    @prop({ required: true }) name: string;
    @prop({}) link: string;
    @prop({
        required: true,
        enum: [
            AccountOwnership.Mine,
            AccountOwnership.Others
        ]
    }) ownership: AccountOwnership;
    @prop({}) timezone: number;
}

export const FacebookUserModel = getModelForClass(FacebookUser);
