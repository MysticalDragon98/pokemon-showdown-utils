import { getModelForClass, index, prop } from '@typegoose/typegoose';

@index({ format: 1, createdAt: -1 })
@index({ createdAt: -1 })
export class LadderSnapshot {
    _id: string;
    @prop() createdAt: Date;
    @prop() format: string;
    @prop({ unique: true }) hash: string;
}

export const LadderSnapshotModel = getModelForClass(LadderSnapshot);
