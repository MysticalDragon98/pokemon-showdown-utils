import { prop, getModelForClass, index, modelOptions } from '@typegoose/typegoose';
import { ObjectId } from 'mongoose';

@index({ player: 1, createdAt: -1 })
@index({ ladderSnapshotId: 1 })
@modelOptions({ options: { allowMixed: 0 }})
export class LadderEntry {
    @prop() ladderSnapshotId: ObjectId;
    @prop() player: string;
    @prop() rank: number;
    @prop() gxe: number;
    @prop() glicko: number;
    @prop() createdAt: Date;
}

export const LadderEntryModel = getModelForClass(LadderEntry);
