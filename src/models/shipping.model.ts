import { Schema } from 'mongoose';

export interface ShippingInterface {
    userId: string;
    firstName: string;
    lastName: string;
    country: string;
    postalCode: string;
    address1: string;
    address2: string;
    city: string;
    region: string;
    dateUpdated: number;
}

export const ShippingModel = new Schema({
    userId: String,
    firstName: String,
    lastName: String,
    country: String,
    postalCode: String,
    address1: String,
    address2: String,
    city: String,
    region: String,
    dateUpdated: Number,
});
