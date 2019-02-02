import { Schema } from 'mongoose';

export interface UserInterface {
    email: string;
    username: string;
    photoUrl: string;
    password: string;
    emailCode: string;
    emailConfirmed: boolean;
    twofa: boolean;
    twofaCode: string;
    twofaUri: string;
    dateCreated: number;
    dateUpdated: number;
}

export const UserModel = new Schema({
    email: String,
    username: String,
    photoUrl: String,
    password: String,
    emailCode: String,
    emailConfirmed: Boolean,
    twofa: Boolean,
    twofaCode: String,
    twofaUri: String,
    dateCreated: Number,
    dateUpdated: Number,
});
