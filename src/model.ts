import * as Mongoose from 'mongoose';
import { mongoUrl } from './config';

import { UserInterface, UserModel } from './models/user.model';
import { ShippingInterface, ShippingModel } from './models/shipping.model';

import {
    ProfileInterface,
    ProfileModel,
} from './models/profile.model';

import {
    TierInterface,
    TierModel,
} from './models/tier.model';

import {
    CommentInterface,
    CommentModel,
} from './models/comment.model';

import {
    SubscriberInterface,
    SubscriberModel,
} from './models/subscriber.model';

import { WalletInterface, WalletModel } from './models/wallet.model';

Mongoose.connect(mongoUrl);

const User = Mongoose.model('User', UserModel);
const Shipping = Mongoose.model('Shipping', ShippingModel);
const Profile = Mongoose.model('Profile', ProfileModel);
const Tier = Mongoose.model('Tier', TierModel);
const Wallet = Mongoose.model('Wallet', WalletModel);
const Comment = Mongoose.model('Comment', CommentModel);
const Subscriber = Mongoose.model('Subscriber', SubscriberModel);

export {
    Mongoose,
    UserInterface,
    User,
    ShippingInterface,
    Shipping,
    ProfileInterface,
    Profile,
    TierInterface,
    Tier,
    WalletInterface,
    Wallet,
    CommentInterface,
    Comment,
    SubscriberInterface,
    Subscriber,
};
