import { WalletInterface, Wallet, TierInterface, Tier } from '../model';
import { Response, ResponseTemplate, code } from '../services/response.service';
import { newEthWallet, ethBalance, ethWithdrawValidate, ethWithdraw } from '../services/wallet.service';

export async function GetEthWallet(req, res, next) {
    const routeResponse: Response = ResponseTemplate();

    try {
        const wallet: WalletInterface = await Wallet.findOne({ user: req.session.user._id, type: 'eth' });

        if (wallet) {
            const balance = await ethBalance(wallet.address);

            routeResponse.response = {
                type: wallet.type,
                address: wallet.address,
                balance: balance.balance,
            };
        } else {
            const newWallet = newEthWallet();
            await Wallet.findOneAndUpdate(
                { user: req.session.user._id, type: 'eth' },
                {
                    user: req.session.user._id,
                    type: 'eth',
                    address: newWallet.address,
                    key: newWallet.key,
                    mnemonic: newWallet.mnemonic,
                    note: '',
                    dateUpdated: Number(new Date()),
                },
                { upsert: true }
            );

            const balance = 0;

            routeResponse.response = {
                type: 'eth',
                address: newWallet.address,
                balance,
            };
        }
    } catch (error) {
        console.log(error);
        routeResponse.code = 500;
        routeResponse.message = code(500);
    }

    return res.status(routeResponse.code).send(routeResponse);
}

export async function GetAddressByUser(req, res, next) {
    const routeResponse: Response = ResponseTemplate();

    try {
        const tier: TierInterface = await Tier.findOne({ _id: req.params.tierId });

        if (tier.externalPayout === true) {
            routeResponse.response = {
                type: 'eth',
                address: tier.externalAddress
            };
        } else {
            const wallet: WalletInterface = await Wallet.findOne({ user: tier.user, type: 'eth' });

            if (wallet) {
                routeResponse.response = {
                    type: wallet.type,
                    address: wallet.address
                };
            } else {
                const newWallet = newEthWallet();
                await Wallet.findOneAndUpdate(
                    { user: req.params.userId, type: 'eth' },
                    {
                        user: req.params.userId,
                        type: 'eth',
                        address: newWallet.address,
                        key: newWallet.key,
                        mnemonic: newWallet.mnemonic,
                        note: '',
                        dateUpdated: Number(new Date()),
                    },
                    { upsert: true }
                );

                routeResponse.response = {
                    type: 'eth',
                    address: newWallet.address
                };
            }
        }
    } catch (error) {
        console.log(error);
        routeResponse.code = 500;
        routeResponse.message = code(500);
    }

    return res.status(routeResponse.code).send(routeResponse);
}

export async function ValidateEthWithdraw(req, res, next) {
    const routeResponse: Response = ResponseTemplate();

    try {
        const response = await ethWithdrawValidate(req.body.address, req.body.amount);
        routeResponse.response = response;
    } catch (error) {
        console.log(error);
        routeResponse.code = 500;
        routeResponse.message = code(500);
        routeResponse.response = error;
    }

    return res.status(routeResponse.code).send(routeResponse);
}

export async function EthWithdraw(req, res, next) {
    const routeResponse: Response = {
        code: 200,
        message: '',
        response: null,
        errors: [],
    };

    try {
        const wallet: WalletInterface = await Wallet.findOne({ user: req.session.user._id, type: 'eth' });
        const response = await ethWithdraw(wallet.key, req.body.address, req.body.amount);
        routeResponse.response = response;
    } catch (error) {
        console.log(error);
        routeResponse.code = 500;
        routeResponse.message = code(500);
        routeResponse.response = error;
    }

    return res.status(routeResponse.code).send(routeResponse);
}
