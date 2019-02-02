import * as bcrypt from 'bcryptjs';
import * as sharp from 'sharp';
import { remove } from 'fs-jetpack';

import { UserInterface, User } from '../model';
import { Response, ResponseTemplate, code } from '../services/response.service';
import { findExistingEmail, findExistingUsername, registerSanitize, loginSanitize } from '../services/user.service';
import { testEmail, testUsername } from '../services/utility.service';
import { twofaAuthFactory, getTwofaAuth } from '../otp';
import { mailCode, verifyEmail } from '../services/mail.service';

export async function UserEmailCheck(req, res, next) {
    const routeResponse: Response = ResponseTemplate();

    try {
        const email = req.body.email;
        const exists = await findExistingEmail(email);

        if (testEmail(email)) {
            if (exists) {
                routeResponse.code = 403;
                routeResponse.message = 'This email is already taken';
            } else {
                routeResponse.code = 200;
                routeResponse.message = 'This email is available';
            }
        } else {
            routeResponse.code = 400;
            routeResponse.message = 'This email is invalid';
        }
    } catch (error) {
        routeResponse.code = 500;
        routeResponse.message = code(500);
    }

    return res.status(routeResponse.code).send(routeResponse);
}

export async function UsernameCheck(req, res, next) {
    const routeResponse: Response = ResponseTemplate();
    try {
        const username = req.body.username;
        const exists = await findExistingUsername(username);

        if (testUsername(username)) {
            if (exists) {
                routeResponse.code = 403;
                routeResponse.message = 'This username is already taken';
            } else {
                routeResponse.code = 200;
                routeResponse.message = 'This username is available';
            }
        } else {
            routeResponse.code = 400;
            routeResponse.message = 'This username is invalid';
        }
    } catch (error) {
        routeResponse.code = 500;
        routeResponse.message = code(500);
    }

    return res.status(routeResponse.code).send(routeResponse);
}

export async function VerifyEmail(req, res, next) {
    let routeResponse: Response = ResponseTemplate();

    try {
        const user: UserInterface = await User.findOne({ _id: req.session.user._id });
        if (user.emailCode == req.body.emailCode.toUpperCase()) {
            const newUser = await User.findOneAndUpdate({ _id: req.session.user._id} , { emailConfirmed: true });
            newUser.emailConfirmed = true;
            req.session.user = newUser;
            req.session.save();
            routeResponse.message = 'Email has been confirmed!';
        } else {
            routeResponse.code = 400;
            routeResponse.message = 'Incorrect email code';
        }
    } catch (error) {
        console.log(error);
        routeResponse.code = 500;
        routeResponse.message = code(500);
    }

    return res.status(routeResponse.code).send(routeResponse);
}

export async function RegenerateEmailCode(req, res, next) {
    let routeResponse: Response = ResponseTemplate();

    try {
        const user: UserInterface = await User.findOne({ _id: req.session.user._id });
        const emailCode = mailCode();
        const result = await verifyEmail(user.email, emailCode);

        if (result.success === false) {
            routeResponse.code = 500;
            routeResponse.message = 'Something went wrong sending an email';
            routeResponse.response = result;
            return res.status(routeResponse.code).send(routeResponse);
        }

        await User.findOneAndUpdate({ _id: req.session.user._id}, { emailCode, emailConfirmed: false });
        routeResponse.message = 'Regenerated a new email code and sent it to your email';
    } catch (error) {
        console.log(error);
        routeResponse.code = 500;
        routeResponse.message = code(500);
    }

    return res.status(routeResponse.code).send(routeResponse);
}

export async function User2FA(req, res, next) {
    const routeResponse: Response = ResponseTemplate();

    try {
        if (req.session.user.twofa === true) {
            let delta = getTwofaAuth(req.session.user.twofaCode).validate({ token: req.body.token });
            if (delta !== -1 && delta !== null) {

            } else {
                routeResponse.code = 403;
                routeResponse.message = 'You need to input a code.';
                return res.status(routeResponse.code).send(routeResponse);
            }
        }

        let twofa = twofaAuthFactory();
        let newCode = twofa.secret.b32;
        let uri = twofa.totp.toString();

        await User.findOneAndUpdate(
            { _id: req.session.user._id },
            { twofaCode: newCode, twofaUri: uri, twofa: false },
        );

        req.session.user.twofaCode = newCode;
        req.session.user.twofaUri = uri;
        req.session.user.twofa = false;
        req.session.save();

        routeResponse.message = 'New TOTP Code created';
        routeResponse.response = {
            code: newCode,
            uri,
        };
    } catch (error) {
        console.log(error);
        routeResponse.code = 500;
        routeResponse.message = code(500);
    }

    return res.status(routeResponse.code).send(routeResponse);
}

export async function User2FAValidate(req, res, next) {
    const routeResponse: Response = ResponseTemplate();

    if (!req.session.user) {
        routeResponse.code = 403;
        routeResponse.message = 'You are not logged in...';
        return res.status(routeResponse.code).send(routeResponse);
    }

    try {
        let delta = getTwofaAuth(req.session.user.twofaCode).validate({ token: req.body.token });
        if (delta !== -1 && delta !== null) {
            await User.findOneAndUpdate(
                { _id: req.session.user._id },
                { twofa: true },
            );
            routeResponse.code = 200;
            routeResponse.message = 'TWOFA has been configured...';
            req.session.user.twofa = true;
            req.session.save();
        } else {
            routeResponse.code = 403;
            routeResponse.message = 'Incorrect code...';
        }
    } catch (error) {
        console.log(error);
        routeResponse.code = 500;
        routeResponse.message = code(500);
    }

    return res.status(routeResponse.code).send(routeResponse);
}
