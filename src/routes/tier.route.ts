import { TierInterface, Tier } from '../model';
import { Response, ResponseTemplate, code } from '../services/response.service';
import { sanitizeTierBody } from '../services/profile.service';

import * as sharp from 'sharp';
import { remove } from 'fs-jetpack';

export async function GetTiers(req, res, next) {
    const routeResponse: Response = ResponseTemplate();

    try {
        routeResponse.response = await Tier.find({ user: req.session.user._id, profile: req.params.profileId, deleted: false }).sort({ index: 1 });
    } catch (error) {
        console.log(error);
        routeResponse.code = 500;
        routeResponse.message = code(500);
    }

    return res.status(routeResponse.code).send(routeResponse);
}

export async function GetTiersByProfileId(req, res, next) {
    const routeResponse: Response = {
        code: 200,
        message: 'Tiers',
        response: null,
        errors: [],
    };

    try {
        routeResponse.response = await Tier.find({ profile: req.params.profileId, deleted: false }).sort({ index: 1 });
    } catch (error) {
        console.log(error);
        routeResponse.code = 500;
        routeResponse.message = code(500);
    }

    return res.status(routeResponse.code).send(routeResponse);
}

export async function UpdateTier(req, res, next) {
    let routeResponse: Response = ResponseTemplate();

    try {
        routeResponse = await sanitizeTierBody(req.body);

        if (routeResponse.code !== 200 && routeResponse.code !== 201) {
            routeResponse.message = 'Problem with request';
            return res.status(routeResponse.code).send(routeResponse);
        }

        const tier = await Tier.findOneAndUpdate(
            {
                user: req.session.user._id,
                profile: req.params.profileId,
                index: req.body.index
            },
            {
                user: req.session.user._id,
                profile: req.params.profileId,
                index: req.body.index,
                title: req.body.title,
                hasLimit: req.body.hasLimit,
                limit: req.body.limit,
                published: req.body.published,
                requireShipping: req.body.requireShipping,
                description: req.body.description,
                currency: req.body.currency,
                externalPayout: req.body.externalPayout,
                externalAddress: req.body.externalAddress,
                amount: req.body.amount,
                expiryTime: req.body.expiryTime,
                deleted: false,
                dateUpdated: Number(new Date()),
            },
            { upsert: true }
        );

        routeResponse.code = 201;
        routeResponse.message = 'Profile Tier successfully updated';
    } catch (error) {
        console.log(error);
        routeResponse.code = 500;
        routeResponse.message = code(500);
    }

    return res.status(routeResponse.code).send(routeResponse);
}

export async function UpdateTierPhoto(req, res, next) {
    const routeResponse: Response = ResponseTemplate();

    try {
        const path = req.file.path;

        const newUrl = `upload/${req.session.user._id}-${Number(new Date())}.jpg`;
        await sharp(path).resize(320).toFile(newUrl);

        remove(path);

        await Tier.findOneAndUpdate(
            {
                user: req.session.user._id,
                profile: req.params.profileId,
                index: req.params.index
            },
            {
                user: req.session.user._id,
                profile: req.params.profileId,
                photo: newUrl,
                dateUpdated: Number(new Date()),
            },
            { upsert: true }
        );

        routeResponse.code = 201;
        routeResponse.message = 'Profile Tier Photo successfully updated';
        routeResponse.response = { path: newUrl };
    } catch (error) {
        console.log(error);
        routeResponse.code = 500;
        routeResponse.message = code(500);
    }

    return res.status(routeResponse.code).send(routeResponse);
}

export async function ShiftTier(req, res, next) {
    const routeResponse: Response = ResponseTemplate();

    try {
        if (req.body.direction === 'left') {
            await Tier.findOneAndUpdate(
                {
                    user: req.session.user._id,
                    profile: req.params.profileId,
                    index: req.body.index
                },
                { index: -1 },
            );

            await Tier.findOneAndUpdate(
                {
                    user: req.session.user._id,
                    profile: req.params.profileId,
                    index: (req.body.index - 1)
                },
                { index: (req.body.index) }
            );

            await Tier.findOneAndUpdate(
                {
                    user: req.session.user._id,
                    profile: req.params.profileId,
                    index: -1
                },
                { index: (req.body.index - 1) }
            );
        } else if (req.body.direction === 'right') {
            await Tier.findOneAndUpdate(
                {
                    user: req.session.user._id,
                    profile: req.params.profileId,
                    index: req.body.index
                },
                { index: -1 }
            );

            await Tier.findOneAndUpdate(
                {
                    user: req.session.user._id,
                    profile: req.params.profileId,
                    index: (req.body.index + 1)
                },
                { index: (req.body.index) }
            );

            await Tier.findOneAndUpdate(
                {
                    user: req.session.user._id,
                    profile: req.params.profileId,
                    index: -1
                },
                { index: (req.body.index + 1) }
            );
        }

        routeResponse.code = 201;
        routeResponse.message = 'Profile Tier successfully shifted';
        routeResponse.response = null;
    } catch (error) {
        console.log(error);
        routeResponse.code = 500;
        routeResponse.message = code(500);
    }

    return res.status(routeResponse.code).send(routeResponse);
}

export async function DeleteTier(req, res, next) {
    const routeResponse: Response = ResponseTemplate();

    try {
        await Tier.findOneAndUpdate(
            {
                user: req.session.user._id,
                profile: req.params.profileId,
                index: Number(req.params.index)
            },
            {
                index: -1,
                deleted: true
            }
        );

        await Tier.updateMany(
            {
                user: req.session.user._id,
                profile: req.params.profileId,
                index: { $gt: Number(req.params.index) }
            },
            { $inc: { index: -1 } }
        );

        routeResponse.code = 201;
        routeResponse.message = 'Profile Tier successfully deleted';
        routeResponse.response = null;
    } catch (error) {
        console.log(error);
        routeResponse.code = 500;
        routeResponse.message = code(500);
    }

    return res.status(routeResponse.code).send(routeResponse);
}

export async function PublishTier(req, res, next) {
    const routeResponse: Response = ResponseTemplate();

    try {
        await Tier.findOneAndUpdate(
            {
                user: req.session.user._id,
                profile: req.params.profileId,
                index: Number(req.body.index)
            },
            {
                published: req.body.published
            }
        );

        routeResponse.code = 201;
        routeResponse.message = 'Profile Tier ' + (req.body.published ? 'published' : 'unpublished');
        routeResponse.response = null;
    } catch (error) {
        console.log(error);
        routeResponse.code = 500;
        routeResponse.message = code(500);
    }

    return res.status(routeResponse.code).send(routeResponse);
}
