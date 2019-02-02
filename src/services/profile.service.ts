import { Error, Response, emptyKeys, processErrors } from './response.service';
import { ProfileInterface, Profile, TierInterface, Tier } from '../model';
import { testUsername } from './utility.service';

export async function findExistingProfileUrl(profileUrl: string): Promise<boolean> {
    const exists = await Profile.findOne({ profileUrl });
    return exists !== null;
}

export async function sanitizeProfileUrl(body): Promise<Response> {
    const keys: Array<string> = ['url'];
    const errors: Array<Error> = emptyKeys(body, keys);

    if (!testUsername(String(body.url)) || body.url.length < 3) {
        const newError: Error = {
            code: 400,
            key: 'url',
            message: `This is not a valid profile url.`,
        };

        errors.push(newError);
    }

    if (body.url.length > 50) {
        const newError: Error = {
            code: 400,
            key: 'url',
            message: `The url must be under 50 characters.`,
        };

        errors.push(newError);
    }

    const profileUrlExists: boolean = await findExistingProfileUrl(body.url);
    if (profileUrlExists) {
        const newError: Error = {
            code: 403,
            key: 'url',
            message: `This profile url is currently in use.`,
        };

        errors.push(newError);
        return processErrors(errors);
    }

    return processErrors(errors);
}

export async function sanitizeTierBody(body): Promise<Response> {
    const keys: Array<string> = ['title', 'description', 'currency', 'amount'];
    const errors: Array<Error> = emptyKeys(body, keys);

    if (body.title.length > 100) {
        const newError: Error = {
            code: 403,
            key: 'title',
            message: `This title is over 100 characters...`,
        };

        errors.push(newError);
    }

    if (body.description.length > 1000) {
        const newError: Error = {
            code: 403,
            key: 'description',
            message: `This description is over 1000 characters...`,
        };

        errors.push(newError);
    }

    return processErrors(errors);
}
