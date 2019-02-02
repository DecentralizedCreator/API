import { Schema } from 'mongoose';

export interface SubscriberInterface {
    user: string;
    tier: string;
    profile: string;
    dateSubscribed: number;
    dateExpiry: number;
    state: string;
    transaction: string;
    dateUpdated: number;
}

export const SubscriberModel = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    tier: {
        type: Schema.Types.ObjectId,
        ref: 'Tier',
    },
    profile: {
        type: Schema.Types.ObjectId,
        ref: 'Profile',
    },
    dateSubscribed: Number,
    dateExpiry: Number,
    state: String,
    transaction: String,
    dateUpdated: Number,
});
