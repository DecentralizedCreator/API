import { ethAddress, ethNetwork } from '../config';

export const startTime = Number(new Date());

export async function ServerInfo(req, res, next) {
    const serverTime = Number(new Date());
    const upTime = serverTime - startTime;

    return res.status(200).send({
        'status': 'OK',
        startTime,
        serverTime,
        upTime,
    });
}

export async function Session(req, res, next) {
    if (req.session.user) {
        return res.status(200).send({
            active: true,
            user: {
                _id: req.session.user._id,
                email: req.session.user.email,
                username: req.session.user.username,
                photoUrl: req.session.user.photoUrl,
                emailConfirmed: req.session.user.emailConfirmed,
                twofa: req.session.user.twofa,
            }
        });
    } else {
        return res.status(200).send({
            active: false,
            user: {}
        });
    }
}

export async function Logout(req, res, next) {
    req.session.destroy();

    return res.status(200).send({
        message: 'Logged out!~'
    });
}

export async function CryptoInfo(req, res, next) {
    return res.status(200).send({
        ethAddress,
        ethNetwork,
    });
}
