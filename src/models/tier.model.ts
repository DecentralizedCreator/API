import { Schema } from 'mongoose';
import { SubscriberInterface } from './subscriber.model';

export interface TierInterface {
    user: string;
    profile: string;
    subscriber: Array<SubscriberInterface>;
    index: number;
    title: string;
    photo: string;
    hasLimit: boolean;
    limit: number;
    requireShipping: boolean;
    description: string;
    currency: string;
    externalPayout: boolean;
    externalAddress: string;
    amount: number;
    expiryTime: number;
    published: boolean;
    deleted: boolean;
    dateUpdated: number;
}


export const TierModel = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    profile: {
        type: Schema.Types.ObjectId,
        ref: 'Profile',
    },
    subscriber : [{
        type: Schema.Types.ObjectId,
        ref: 'Subscriber'
    }],
    index: Number,
    title: String,
    photo: String,
    hasLimit: Boolean,
    limit: Number,
    requireShipping: Boolean,
    description: String,
    currency: String,
    externalPayout: Boolean,
    externalAddress: String,
    amount: Number,
    expiryTime: Number,
    published: Boolean,
    deleted: Boolean,
    dateUpdated: Number,
});
