import { Schema } from 'mongoose';

export interface CommentInterface {
    user: string;
    profileId: string;
    comment: string;
    dateUpdated: number;
}

export const CommentModel = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    profileId: String,
    comment: String,
    dateUpdated: Number,
});
