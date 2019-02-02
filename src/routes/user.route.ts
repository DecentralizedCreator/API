import * as bcrypt from 'bcryptjs';
import * as sharp from 'sharp';
import { remove } from 'fs-jetpack';

import { UserInterface, User } from '../model';
import { Response, ResponseTemplate, code } from '../services/response.service';
import { findExistingEmail, findExistingUsername, registerSanitize, loginSanitize } from '../services/user.service';
import { testEmail, testUsername } from '../services/utility.service';
import { twofaAuthFactory, getTwofaAuth } from '../otp';
import { mailCode, verifyEmail } from '../services/mail.service';

export async function UserRegister(req, res, next) {
    let routeResponse: Response = ResponseTemplate();

    try {
         routeResponse = await registerSanitize(req.body);

        if (routeResponse.code !== 200 && routeResponse.code !== 201) {
            return res.status(routeResponse.code).send(routeResponse);
        }

        const encryptedPassword = bcrypt.hashSync(req.body.password1, 10).toString();

        const emailCode = mailCode();
        await verifyEmail(req.body.email, emailCode);

        const newUserObject: UserInterface = {
            email: req.body.email,
            username: req.body.username,
            photoUrl: '',
            password: encryptedPassword,
            emailCode,
            emailConfirmed: false,
            twofa: false,
            twofaCode: '',
            twofaUri: '',
            dateCreated: Number(new Date()),
            dateUpdated: Number(new Date()),
        };

        const newUser = new User(newUserObject);
        await newUser.save();

        req.session.user = newUser;
        req.session.save();

        routeResponse.code = 201;
        routeResponse.message = 'User successfully created';
        routeResponse.response = {
            id: newUser.id,
            email: newUser.email,
            username: newUserObject.username,
        };

        return res.status(201).send(routeResponse);
    } catch (error) {
        routeResponse.code = 500;
        routeResponse.message = code(500);
        return res.status(500).send(routeResponse);
    }

}

export async function UserLogin(req, res, next) {
    let routeResponse: Response = ResponseTemplate();

    try {
        routeResponse = await loginSanitize(req.body);

        const user: UserInterface = await User.findOne({ email: req.body.email });

        if (user === null) {
            routeResponse.code = 403;
            routeResponse.message = 'This email is not registered';
        } else {
            const storedPassword = user.password;

            if (user.twofa) {
                let delta = getTwofaAuth(user.twofaCode).validate({ token: req.body.token || '' });
                if (delta === -1 || delta === null) {
                    routeResponse.code = 403;
                    routeResponse.message = '2FA is active, please input your 2FA code';
                    return res.status(routeResponse.code).send(routeResponse);
                }
            }

            if (bcrypt.compareSync(req.body.password, storedPassword)) {
                if (req.session.user) { req.session.destroy(); }
                if (!req.session) req.session = {};
                req.session.user = user;
                req.session.save();
            } else {
                routeResponse.code = 403;
                routeResponse.message = 'This password is incorrect';
            }
        }

    } catch (error) {
        console.log(error);
        routeResponse.code = 500;
        routeResponse.message = code(500);
    }

    return res.status(routeResponse.code).send(routeResponse);
}


export async function UserUpdateEmail(req, res, next) {
    const routeResponse: Response = ResponseTemplate();

    try {
        if (!testEmail(req.body.email)) {
            routeResponse.code = 400;
            routeResponse.message = 'Not a valid email';
        } else if (!req.session.user) {
            routeResponse.code = 403;
            routeResponse.message = 'You are not logged in...';
        } else {
            const user: UserInterface = await User.findOne({ email: req.body.email });
            if (user === null) {
                const newUser: UserInterface = await User.findOneAndUpdate(
                    { _id: req.session.user._id },
                    {
                        email: req.body.email,
                        emailConfirmed: false,
                        emailCode: mailCode(),
                        dateUpdated: Number(new Date())
                    }
                );
                newUser.emailConfirmed = false;
                newUser.email = req.body.email;

                req.session.user = newUser;
                req.session.save();

                routeResponse.message = 'Email updated';
            } else {
                routeResponse.code = 403;
                routeResponse.message = 'This email is currently in use...';
            }
        }
    } catch (error) {
        routeResponse.code = 500;
        routeResponse.message = code(500);
    }

    return res.status(routeResponse.code).send(routeResponse);
}

export async function UserUpdateUsername(req, res, next) {
    const routeResponse: Response = ResponseTemplate();

    try {
        if (!testUsername(req.body.username)) {
            routeResponse.code = 400;
            routeResponse.message = 'Not a valid username';
        } else if (!req.session.user) {
            routeResponse.code = 403;
            routeResponse.message = 'You are not logged in...';
        } else {
            const user: UserInterface = await User.findOne({ email: req.body.username });
            if (user === null) {
                const newUser: UserInterface = await User.findOneAndUpdate(
                    { _id: req.session.user._id },
                    { username: req.body.username, dateUpdated: Number(new Date()) }
                );
                newUser.username = req.body.username;

                req.session.user = newUser;
                req.session.save();

                routeResponse.message = 'Username updated';
            } else {
                routeResponse.code = 403;
                routeResponse.message = 'This username is currently in use...';
            }
        }
    } catch (error) {
        console.log(error);
        routeResponse.code = 500;
        routeResponse.message = code(500);
    }

    return res.status(routeResponse.code).send(routeResponse);
}

export async function UserUpdatePassword(req, res, next) {
    const routeResponse: Response = ResponseTemplate();

    try {
        if (!req.session.user) {
            routeResponse.code = 403;
            routeResponse.message = 'You are not logged in...';
        } else if (req.body.password1 !== req.body.password2) {
            routeResponse.code = 400;
            routeResponse.message = 'New password inputs do not match';
        } else {
            const storedPassword = req.session.user.password;
            if (bcrypt.compareSync(req.body.oldpassword, storedPassword)) {
                const encryptedPassword = bcrypt.hashSync(req.body.password1, 10).toString();

                await User.updateOne({ _id: req.session.user._id }, { password: encryptedPassword });
                req.session.user.password = encryptedPassword;
                req.session.save();

                routeResponse.message = 'Password updated!';
            } else {
                routeResponse.code = 403;
                routeResponse.message = 'Incorrect original password';
            }
        }
    } catch (error) {
        console.log(error);
        routeResponse.code = 500;
        routeResponse.message = code(500);
    }

    return res.status(routeResponse.code).send(routeResponse);
}

export async function UserUpdatePhoto(req, res, next) {
    const routeResponse: Response = ResponseTemplate();

    try {
        const path = req.file.path;

        const newUrl = `upload/${req.session.user._id}-${Number(new Date())}.jpg`;
        await sharp(path).resize(320).toFile(newUrl);

        remove(path);

        await User.findOneAndUpdate(
            { _id: req.session.user._id },
            { photoUrl: newUrl },
        );

        req.session.user.photoUrl = newUrl;
        req.session.save();

        routeResponse.code = 201;
        routeResponse.message = 'User Photo successfully updated';
        routeResponse.response = { path: newUrl };
    } catch (error) {
        console.log(error);
        routeResponse.code = 500;
        routeResponse.message = code(500);
    }

    return res.status(routeResponse.code).send(routeResponse);
}
