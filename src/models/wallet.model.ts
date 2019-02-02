import { Schema } from 'mongoose';

export interface WalletInterface {
    user: string;
    type: string;
    address: string;
    key: string;
    mnemonic: string;
    note: string;
    dateUpdated: number;
}

export const WalletModel = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    type: String,
    address: String,
    key: String,
    mnemonic: String,
    note: String,
    dateUpdated: Number,
});
