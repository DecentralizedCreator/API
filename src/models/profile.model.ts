import { Schema } from 'mongoose';

export interface ProfileInterface {
    user: string;
    published: boolean;
    profileUrl: string;
    categories: Array<string>;
    nsfw: boolean;
    censored: boolean;
    name: string;
    tagline: string;
    photoUrl: string;
    bannerUrl: string;
    description: string;
    websiteUrl: string;
    githubUrl: string;
    facebookUrl: string;
    twitterUrl: string;
    youtubeUrl: string;
    linkedinUrl: string;
    gabUrl: string;
    mindsUrl: string;
    subscriberGoal: number;
    btcGoal: number;
    ethGoal: number;
    xmrGoal: number;
    dateUpdated: number;
}

export const ProfileModel = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    published: Boolean,
    profileUrl: String,
    categories: Array,
    nsfw: Boolean,
    censored: Boolean,
    name: String,
    tagline: String,
    photoUrl: String,
    bannerUrl: String,
    description: String,
    websiteUrl: String,
    githubUrl: String,
    facebookUrl: String,
    twitterUrl: String,
    youtubeUrl: String,
    linkedinUrl: String,
    gabUrl: String,
    mindsUrl: String,
    subscriberGoal: Number,
    btcGoal: Number,
    ethGoal: Number,
    xmrGoal: Number,
    dateUpdated: Number,
});

ProfileModel.index({ name: 'text', profileUrl: 'text', tagline: 'text' });
