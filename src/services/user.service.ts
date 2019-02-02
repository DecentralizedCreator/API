import * as bcrypt from 'bcryptjs';

import { Error, Response, emptyKeys, processErrors } from './response.service';
import { testEmail, testUsername } from './utility.service';

import { User, UserInterface } from '../model';

export async function findExistingEmail(email: string): Promise<boolean> {
    const exists = await User.findOne({ email });
    return exists !== null;
}

export async function findExistingUsername(username: string): Promise<boolean> {
    const exists = await User.findOne({ username });
    return exists !== null;
}

export async function registerSanitize(body): Promise<Response> {
    const keys: Array<string> = ['email', 'username', 'password1', 'password2'];
    const errors: Array<Error> = emptyKeys(body, keys);

    if (errors.length > 0) {
        return processErrors(errors);
    }

    if (!testEmail(String(body.email)) || body.email.length < 5) {
        const newError: Error = {
            code: 400,
            key: 'email',
            message: `This is not a valid email address`,
        };

        errors.push(newError);
    }

    if (!testUsername(String(body.username)) || body.username.length < 5) {
        const newError: Error = {
            code: 400,
            key: 'username',
            message: `This is not a valid username`,
        };

        errors.push(newError);
    }

    if (body.username.length > 50) {
        const newError: Error = {
            code: 400,
            key: 'username',
            message: `Username must be under 50 characters`,
        };

        errors.push(newError);
    }

    if (String(body.password1) !== String(body.password2)) {
        const newError: Error = {
            code: 400,
            key: 'password1',
            message: `Passwords do not match`,
        };

        errors.push(newError);
    }

    if (String(body.password1).length < 8) {
        const newError: Error = {
            code: 400,
            key: 'password1',
            message: `Passwords must be over eight characters`,
        };

        errors.push(newError);
    }

    if (errors.length > 0) {
        return processErrors(errors);
    }

    try {
        const emailExists: boolean = await findExistingEmail(body.email);
        if (emailExists) {
            const newError: Error = {
                code: 403,
                key: 'email',
                message: `This email is currently in use.`,
            };

            errors.push(newError);
            return processErrors(errors);
        }

        const usernameExists: boolean = await findExistingUsername(body.username);
        if (usernameExists) {
            const newError: Error = {
                code: 403,
                key: 'username',
                message: `This username is currently in use.`,
            };

            errors.push(newError);
            return processErrors(errors);
        }
    } catch (error) {
        console.log(`${error}`.red);

        const newError: Error = {
            code: 500,
            key: '',
            message: `Server Query Error`,
        };

        errors.push(newError);
        return processErrors(errors);
    }

    return processErrors(errors);
}

export async function loginSanitize(body): Promise<Response> {
    const keys: Array<string> = ['email', 'password'];
    const errors: Array<Error> = emptyKeys(body, keys);

    return processErrors(errors);
}
