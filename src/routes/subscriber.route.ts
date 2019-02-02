import { Tier, TierInterface, Subscriber, SubscriberInterface, Wallet, WalletInterface, ShippingInterface, Shipping } from '../model';
import { Response, ResponseTemplate, code } from '../services/response.service';
import { ethSubscribe } from '../services/wallet.service';

export async function CreateSubscription(req, res, next) {
    const routeResponse: Response = ResponseTemplate();

    try {
        const Subbed = await Subscriber.findOne({ tier: req.body.tierId, user: req.session.user._id });

        if (Subbed) {
            if (Subbed.dateExpiry >= Number(new Date())) {
                routeResponse.code = 400;
                routeResponse.message = 'You already subscribed to this tier.';
                return res.status(routeResponse.code).send(routeResponse);
            }
        }

        const tier = await Tier.findById(req.body.tierId);
        const currency = tier.currency;
        const amount = tier.amount;

        if (tier.subscriber.length >= tier.limit && tier.hasLimit) {
            routeResponse.code = 400;
            routeResponse.message = 'This tier has reached the subscription limit';
            return res.status(routeResponse.code).send(routeResponse);
        }

        let transaction = null;

        if (currency.toLowerCase() === 'eth') {
            const UserWallet: WalletInterface = await Wallet.findOne({ user: req.session.user._id });

            let CreatorAddress = tier.externalAddress;

            if (!tier.externalPayout) {
                const TierUserWallet: WalletInterface = await Wallet.findOne({ user: tier.user });
                CreatorAddress = TierUserWallet.address;
            }

            transaction = await ethSubscribe(UserWallet.key, CreatorAddress, String(amount), String(tier.user), String(tier.title));

            if (transaction.error) {
                routeResponse.code = 400;
                routeResponse.message = 'There was a problem processing the transaction';
                routeResponse.response = {
                    transaction
                };
                return res.status(routeResponse.code).send(routeResponse);
            }
        } else {
            routeResponse.code = 400;
            routeResponse.message = 'This currency is not available.';
            return res.status(routeResponse.code).send(routeResponse);
        }

        let dateExpiry = 0;

        if(tier.expiryTime > 0) {
            dateExpiry = Number(new Date()) + tier.expiryTime;
        }

        let SubscriptionObj: SubscriberInterface;
        let SubId = '';

        if (Subbed) {
            SubId = Subbed['_id'];
            await Subscriber.findOneAndUpdate(
                { _id: Subbed._id },
                {
                    dateExpiry,
                    dateUpdated: Number(new Date()),
                    transaction: Subbed.transaction + '::' + req.body.transaction
                }
            )
        } else {
            SubscriptionObj = {
                user: req.session.user._id,
                tier: tier['_id'],
                profile: tier.profile,
                dateSubscribed: Number(new Date()),
                dateExpiry,
                state: 'active',
                transaction: transaction.receipt.hash,
                dateUpdated: Number(new Date()),
            };

            const NewSub = new Subscriber(SubscriptionObj);
            await NewSub.save();

            SubId = NewSub._id;

            tier.subscriber.push(NewSub);
            await tier.save();
        }

        routeResponse.response = {
            transaction,
            subscription: { _id: SubId }
        };

    } catch (error) {
        console.log(error);
        routeResponse.code = 500;
        routeResponse.message = code(500);
    }

    return res.status(routeResponse.code).send(routeResponse);
}

export async function CreateMetamaskSubscriptionPreCheck(req, res, next) {
    const routeResponse: Response = ResponseTemplate();

    try {
        const Subbed = await Subscriber.findOne({ tier: req.body.tierId, user: req.session.user._id });

        if (Subbed) {
            if (Subbed.dateExpiry >= Number(new Date())) {
                routeResponse.code = 400;
                routeResponse.message = 'You already subscribed to this tier.';
                return res.status(routeResponse.code).send(routeResponse);
            }
        }

        const tier = await Tier.findById(req.body.tierId);

        if (tier.subscriber.length >= tier.limit && tier.hasLimit) {
            routeResponse.code = 400;
            routeResponse.message = 'This tier has reached the subscription limit';
            return res.status(routeResponse.code).send(routeResponse);
        }

        routeResponse.code = 200;
        routeResponse.message = 'You can subscribe to this tier via metamask';
    } catch (error) {
        console.log(error);
        routeResponse.code = 500;
        routeResponse.message = code(500);
    }

    return res.status(routeResponse.code).send(routeResponse);
}

export async function CreateMetamaskSubscription(req, res, next) {
    const routeResponse: Response = ResponseTemplate();

    try {
        const Subbed = await Subscriber.findOne({ tier: req.body.tierId, user: req.session.user._id });

        if (Subbed) {
            if (Subbed.dateExpiry >= Number(new Date())) {
                routeResponse.code = 400;
                routeResponse.message = 'You already subscribed to this tier.';
                return res.status(routeResponse.code).send(routeResponse);
            }
        }

        const tier = await Tier.findById(req.body.tierId);

        if (tier.subscriber.length >= tier.limit && tier.hasLimit) {
            routeResponse.code = 400;
            routeResponse.message = 'This tier has reached the subscription limit';
            return res.status(routeResponse.code).send(routeResponse);
        }

        let dateExpiry = 0;
        if(tier.expiryTime > 0) {
            dateExpiry = Number(new Date()) + tier.expiryTime;
        }

        let SubscriptionObj: SubscriberInterface;
        let SubId = '';

        if (Subbed) {
            SubId = Subbed['_id'];
            await Subscriber.findOneAndUpdate(
                { _id: Subbed._id },
                {
                    dateExpiry,
                    dateUpdated: Number(new Date()),
                    transaction: Subbed.transaction + '::' + req.body.transaction
                }
            )
        } else {
            SubscriptionObj = {
                user: req.session.user._id,
                tier: tier['_id'],
                profile: tier.profile,
                dateSubscribed: Number(new Date()),
                dateExpiry,
                state: 'active',
                transaction: req.body.transaction,
                dateUpdated: Number(new Date()),
            };
            const NewSub = new Subscriber(SubscriptionObj);
            await NewSub.save();

            SubId = NewSub._id;

            tier.subscriber.push(NewSub);
            await tier.save();
        }

        routeResponse.response = {
            transaction: req.body.transaction,
            subscription: { _id: SubId }
        };

    } catch (error) {
        console.log(error);
        routeResponse.code = 500;
        routeResponse.message = code(500);
    }

    return res.status(routeResponse.code).send(routeResponse);
}

export async function GetSubscriptions(req, res, next) {
    const routeResponse: Response = ResponseTemplate();

    try {
        routeResponse.response = await Subscriber.find({ user: req.session.user._id  }).populate('tier profile');
    } catch (error) {
        console.log(error);
        routeResponse.code = 500;
        routeResponse.message = code(500);
    }

    return res.status(routeResponse.code).send(routeResponse);
}

export async function ProfileSubscribers(req, res, next) {
    const routeResponse: Response = ResponseTemplate();

    try {
        const Tiers = await Tier
        .find({ user: req.session.user._id, profile: req.params.profileId })
        .populate({
            path: 'subscriber',
            model: 'Subscriber',
            select: 'dateSubscribed dateExpiry state transaction',
            populate: {
                path: 'user',
                model: 'User',
                select: 'username photoUrl email'
            }
        })
        .sort({ index: 1 });

        routeResponse.response = Tiers;
    } catch (error) {
        console.log(error);
        routeResponse.code = 500;
        routeResponse.message = code(500);
    }

    return res.status(routeResponse.code).send(routeResponse);
}

export async function RevokeSubscription(req, res, next) {
    const routeResponse: Response = ResponseTemplate();

    try {
        const Subscription = await Subscriber.findByIdAndUpdate(req.params.subscriptionId, { state: 'revoked' });
        routeResponse.message = 'Subscription revoked';
        routeResponse.response = Subscription;
    } catch (error) {
        console.log(error);
        routeResponse.code = 500;
        routeResponse.message = code(500);
    }

    return res.status(routeResponse.code).send(routeResponse);
}

export async function ReinstateSubscription(req, res, next) {
    const routeResponse: Response = ResponseTemplate();

    try {
        const Subscription = await Subscriber.findByIdAndUpdate(req.params.subscriptionId, { state: 'active' });
        routeResponse.message = 'Subscription reinstated';
        routeResponse.response = Subscription;
    } catch (error) {
        console.log(error);
        routeResponse.code = 500;
        routeResponse.message = code(500);
    }

    return res.status(routeResponse.code).send(routeResponse);
}

export async function UpdateSubscriptionExpiry(req, res, next) {
    const routeResponse: Response = ResponseTemplate();

    try {
        const Subscription = await Subscriber.findByIdAndUpdate(req.params.subscriptionId, { dateExpiry: req.body.dateExpiry });
        routeResponse.message = 'Subscription expiry updated';
        routeResponse.response = Subscription;
    } catch (error) {
        console.log(error);
        routeResponse.code = 500;
        routeResponse.message = code(500);
    }

    return res.status(routeResponse.code).send(routeResponse);
}

export async function GetSubscriberShipping(req, res, next) {
    const routeResponse: Response = ResponseTemplate();

    try {
        const ShippingInfo: ShippingInterface = await Shipping.findOne({ userId: req.params.userId });
        routeResponse.message = 'User Shipping info';
        routeResponse.response = ShippingInfo;
    } catch (error) {
        console.log(error);
        routeResponse.code = 500;
        routeResponse.message = code(500);
    }

    return res.status(routeResponse.code).send(routeResponse);
}
