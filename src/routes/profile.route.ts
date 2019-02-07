import { ProfileInterface, Profile, Tier } from '../model';
import { Response, ResponseTemplate, code } from '../services/response.service';
import { sanitizeProfileUrl } from '../services/profile.service';

import * as sharp from 'sharp';
import { remove } from 'fs-jetpack';

export async function GenerateProfile(req, res, next) {
    const routeResponse: Response = ResponseTemplate();

    try {

        if (!req.session.user.emailConfirmed) {
            routeResponse.code = 403;
            routeResponse.message = 'You need to verify your email to create profiles.';
            return res.status(routeResponse.code).send(routeResponse);
        }

        const NewProfileObj: ProfileInterface = {
            user: req.session.user._id,
            published: false,
            profileUrl: String(Number(new Date())),
            categories: [],
            nsfw: false,
            censored: false,
            name: 'New Profile',
            tagline: 'Just a new profile.',
            photoUrl: '',
            bannerUrl: '',
            description: '',
            websiteUrl: '',
            githubUrl: '',
            facebookUrl: '',
            twitterUrl: '',
            youtubeUrl: '',
            linkedinUrl: '',
            twitchUrl: '',
            discordUrl: '',
            gabUrl: '',
            mindsUrl: '',
            subscriberGoal: 0,
            btcGoal: 0,
            ethGoal: 0,
            xmrGoal: 0,
            dateUpdated: Number(new Date()),
        };

        const NewProfile = new Profile(NewProfileObj);
        await NewProfile.save();
    } catch (error) {
        console.log(error);
        routeResponse.code = 500;
        routeResponse.message = code(500);
    }

    return res.status(routeResponse.code).send(routeResponse);
}

export async function GetProfileList(req, res, next) {
    const routeResponse: Response = ResponseTemplate();

    try {
        routeResponse.response = await Profile.find({ user: req.session.user._id }).sort({ dateUpdated: -1 });
    } catch (error) {
        console.log(error);
        routeResponse.code = 500;
        routeResponse.message = code(500);
    }

    return res.status(routeResponse.code).send(routeResponse);
}

export async function DeleteProfile(req, res, next) {
    const routeResponse: Response = ResponseTemplate();

    try {
        routeResponse.response = await Profile.findOneAndDelete({ user: req.session.user._id, _id: req.params.profileId });
    } catch (error) {
        console.log(error);
        routeResponse.code = 500;
        routeResponse.message = code(500);
    }

    return res.status(routeResponse.code).send(routeResponse);
}


export async function GetProfile(req, res, next) {
    const routeResponse: Response = ResponseTemplate();

    try {
        routeResponse.response = await Profile.findOne({ user: req.session.user._id, _id: req.params.profileId });
    } catch (error) {
        console.log(error);
        routeResponse.code = 500;
        routeResponse.message = code(500);
    }

    return res.status(routeResponse.code).send(routeResponse);
}

export async function GetProfileByUrl(req, res, next) {
    const routeResponse: Response = ResponseTemplate();

    try {
        const UserProfile: ProfileInterface = await Profile.findOne({ profileUrl: req.params.profileUrl });

        const UserTiers = await Tier
        .find({ user: UserProfile.user, profile: UserProfile['_id'], deleted: false })
        .populate({
            path: 'subscriber',
            model: 'Subscriber',
            select: 'dateSubscribed dateExpiry',
            match: {
                $or: [
                    { dateExpiry: { $gte: Number(new Date()), } },
                    { dateExpiry: { $lte: 0, } },
                ]
            },
            populate: {
                path: 'user',
                model: 'User',
                select: 'username photoUrl'
            }
        })
        .sort({ index: 1 });

        routeResponse.response = {
            profile: UserProfile,
            tiers: UserTiers,
        };
    } catch (error) {
        console.log(error);
        routeResponse.code = 500;
        routeResponse.message = code(500);
    }

    return res.status(routeResponse.code).send(routeResponse);
}

export async function UpdateProfileUrl(req, res, next) {
    let routeResponse: Response = ResponseTemplate();
    try {
        routeResponse = await sanitizeProfileUrl(req.body);

        if (routeResponse.code !== 200 && routeResponse.code !== 201) {
            routeResponse.message = 'Please type in a proper url';
            return res.status(routeResponse.code).send(routeResponse);
        }

        await Profile.findOneAndUpdate(
            { user: req.session.user._id, _id: req.body.profileId },
            { profileUrl: req.body.url, dateUpdated: Number(new Date()) }
        );

        routeResponse.code = 201;
        routeResponse.message = 'Profile Url successfully updated';
        routeResponse.response = null;
    } catch (error) {
        console.log(error);
        routeResponse.code = 500;
        routeResponse.message = code(500);
    }

    return res.status(routeResponse.code).send(routeResponse);
}

export async function UpdateProfileHeading(req, res, next) {
    const routeResponse: Response = ResponseTemplate();

    try {

        if (req.body.name.length > 100) {
            routeResponse.errors.push({
                key: 'name',
                message: 'Your name is too long...',
            });
        }

        if (req.body.tagline.length > 100) {
            routeResponse.errors.push({
                key: 'tagline',
                message: 'Your tagline is too long...',
            });
        }

        if (routeResponse.errors.length > 0) {
            routeResponse.code = 400;
            routeResponse.message = 'Some problems with your input.';
            return res.status(routeResponse.code).send(routeResponse);
        }

        await Profile.findOneAndUpdate(
            { user: req.session.user._id, _id: req.body.profileId },
            { name: req.body.name, tagline: req.body.tagline, dateUpdated: Number(new Date()) },
        );

        routeResponse.code = 201;
        routeResponse.message = 'Profile Heading successfully updated';
        routeResponse.response = null;
    } catch (error) {
        console.log(error);
        routeResponse.code = 500;
        routeResponse.message = code(500);
    }

    return res.status(routeResponse.code).send(routeResponse);
}

export async function UpdateProfileMeta(req, res, next) {
    const routeResponse: Response = ResponseTemplate();

    try {
        await Profile.findOneAndUpdate(
            { user: req.session.user._id, _id: req.body.profileId },
            { nsfw: req.body.nsfw, censored: req.body.censored, dateUpdated: Number(new Date()) },
        );

        routeResponse.code = 201;
        routeResponse.message = 'Profile Heading successfully updated';
        routeResponse.response = null;
    } catch (error) {
        console.log(error);
        routeResponse.code = 500;
        routeResponse.message = code(500);
    }

    return res.status(routeResponse.code).send(routeResponse);
}

export async function UpdateProfileLinks(req, res, next) {
    const routeResponse: Response = ResponseTemplate();

    try {

        await Profile.findOneAndUpdate(
            { user: req.session.user._id, _id: req.body.profileId },
            {
                websiteUrl: req.body.websiteUrl,
                githubUrl: req.body.githubUrl,
                facebookUrl: req.body.facebookUrl,
                twitterUrl: req.body.twitterUrl,
                youtubeUrl: req.body.youtubeUrl,
                linkedinUrl: req.body.linkedinUrl,
                gabUrl: req.body.gabUrl,
                mindsUrl: req.body.mindsUrl,
                twitchUrl: req.body.twitchUrl,
                discordUrl: req.body.discordUrl,
                dateUpdated: Number(new Date()),
            },
        );

        routeResponse.code = 201;
        routeResponse.message = 'Profile Links successfully updated';
        routeResponse.response = null;
    } catch (error) {
        console.log(error);
        routeResponse.code = 500;
        routeResponse.message = code(500);
    }

    return res.status(routeResponse.code).send(routeResponse);
}

export async function UpdateProfileDescription(req, res, next) {
    const routeResponse: Response = ResponseTemplate();

    if (req.body.description.length > 5000) {
        routeResponse.code = 400;
        routeResponse.message = 'Max 5000 characters for description';
        return res.status(routeResponse.code).send(routeResponse);
    }

    try {

        await Profile.findOneAndUpdate(
            { user: req.session.user._id, _id: req.body.profileId },
            {
                description: req.body.description,
                dateUpdated: Number(new Date()),
            },
        );

        routeResponse.code = 201;
        routeResponse.message = 'Profile Description successfully updated';
        routeResponse.response = null;
    } catch (error) {
        console.log(error);
        routeResponse.code = 500;
        routeResponse.message = code(500);
    }

    return res.status(routeResponse.code).send(routeResponse);
}

export async function UpdateProfileGoals(req, res, next) {
    const routeResponse: Response = ResponseTemplate();

    try {
        const updateObj = req.body.update;

        updateObj.user = req.session.user._id;
        updateObj.dateUpdated = Number(new Date());

        await Profile.findOneAndUpdate(
            { user: req.session.user._id, _id: req.body.profileId },
            updateObj,
        );

        routeResponse.code = 201;
        routeResponse.message = 'Profile Goal successfully updated';
        routeResponse.response = null;
    } catch (error) {
        console.log(error);
        routeResponse.code = 500;
        routeResponse.message = code(500);
    }

    return res.status(routeResponse.code).send(routeResponse);
}

export async function UpdateProfileBanner(req, res, next) {
    const routeResponse: Response = ResponseTemplate();
    try {
        const path = req.file.path;

        const newUrl = `upload/${req.session.user._id}-${Number(new Date())}.jpg`;
        await sharp(path).resize(1200, 400).toFile(newUrl);

        remove(path);

        await Profile.findOneAndUpdate(
            { user: req.session.user._id, _id: req.params.profileId },
            { bannerUrl: newUrl },
        );

        routeResponse.code = 201;
        routeResponse.message = 'Profile Banner successfully updated';
        routeResponse.response = { path: newUrl };
    } catch (error) {
        console.log(error);
        routeResponse.code = 500;
        routeResponse.message = code(500);
    }

    return res.status(routeResponse.code).send(routeResponse);
}


export async function UpdateProfilePhoto(req, res, next) {
    const routeResponse: Response = ResponseTemplate();

    try {
        const path = req.file.path;

        const newUrl = `upload/${req.session.user._id}-${Number(new Date())}.jpg`;
        await sharp(path).resize(320).toFile(newUrl);

        remove(path);

        await Profile.findOneAndUpdate(
            { user: req.session.user._id, _id: req.params.profileId },
            { photoUrl: newUrl },
        );

        routeResponse.code = 201;
        routeResponse.message = 'Profile Banner successfully updated';
        routeResponse.response = { path: newUrl };
    } catch (error) {
        console.log(error);
        routeResponse.code = 500;
        routeResponse.message = code(500);
    }

    return res.status(routeResponse.code).send(routeResponse);
}

export async function UpdateProfileCategories(req, res, next) {
    const routeResponse: Response = ResponseTemplate();

    if (req.body.categories.length > 3) {
        routeResponse.code = 400;
        routeResponse.message = 'Max 3 Categories';
        return res.status(routeResponse.code).send(routeResponse);
    }

    try {
        await Profile.findOneAndUpdate(
            { user: req.session.user._id, _id: req.body.profileId },
            {
                categories: req.body.categories,
                dateUpdated: Number(new Date()),
            },
        );

        routeResponse.code = 201;
        routeResponse.message = 'Profile Categories successfully updated';
        routeResponse.response = null;
    } catch (error) {
        console.log(error);
        routeResponse.code = 500;
        routeResponse.message = code(500);
    }

    return res.status(routeResponse.code).send(routeResponse);
}

export async function PublishProfile(req, res, next) {
    const routeResponse: Response = ResponseTemplate();

    try {
        await Profile.findOneAndUpdate(
            { user: req.session.user._id, _id: req.body.profileId },
            { published: req.body.published }
        );

        routeResponse.code = 201;
        routeResponse.message = 'Profile successfully ' + (req.body.published ? 'published' : 'unpublished');
        routeResponse.response = null;
    } catch (error) {
        console.log(error);
        routeResponse.code = 500;
        routeResponse.message = code(500);
    }

    return res.status(routeResponse.code).send(routeResponse);
}
