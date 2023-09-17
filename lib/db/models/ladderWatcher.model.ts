import { prop, getModelForClass } from '@typegoose/typegoose';

export class LadderWatcher {
    @prop() format: string;
    @prop({ index: true }) enabled: boolean;
    @prop() interval: number;
}

export const LadderWatcherModel = getModelForClass(LadderWatcher);
