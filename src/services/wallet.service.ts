import { Wallet, utils } from 'ethers';
import { ethProvider, ethContract, ethAddress } from '../config';

export function newEthWallet() {
    const newWallet = Wallet.createRandom();
    const address = newWallet.address;
    const mnemonic = newWallet.mnemonic;
    const key = newWallet.privateKey;

    return { address, mnemonic, key };
}

export async function ethBalance(address: string) {
    const response = {
        balance: '0',
        error: null
    };

    try {
        const value = await ethProvider.getBalance(address);
        response.balance = utils.formatEther(value);
    } catch (error) {
        response.error = error;
    }

    return response;
}

export async function ethWithdrawValidate(RecAddress: string, RecAmount: number) {
    let gasPrice = '0';
    let gasCost = '0';
    let address = '0x';
    let amount = '0';
    let error = null;

    try {
        const gasPriceBN = await ethProvider.getGasPrice();
        gasPrice = utils.formatEther(gasPriceBN);

        const amountBN = utils.parseEther(String(RecAmount));
        amount = utils.formatUnits(amountBN, 18);

        address = utils.getAddress(RecAddress);

        gasCost = '0.05';
    } catch (err) {
        error = err;
    }

    return {
        gasPrice,
        gasCost,
        address,
        amount,
        error,
    };
}

export async function ethWithdraw(key: string, address: string, amount: string) {
    let receipt = null;
    let error = null;

    try {
        const wallet = new Wallet(key, ethProvider);
        const signedContract = ethContract.connect(wallet);

        receipt = await signedContract.Withdraw(
            address,
            {
                value: utils.parseEther(amount).add(utils.parseEther('0.05')),
                gasLimit: 880000
            }
        );
    } catch (err) {
        console.log(err);
        error = err;
    }

    return {
        receipt,
        error,
    };
}

export async function ethSubscribe(key: string, creatorAddress: string, amount: string, tierOwner: string, tierName: string) {
    let receipt = null;
    let error = null;

    console.log(creatorAddress, amount, tierOwner, tierName);

    try {
        const wallet = new Wallet(key, ethProvider);
        const signedContract = ethContract.connect(wallet);

        receipt = await signedContract.NewSubscription(
            creatorAddress,
            tierOwner,
            tierName,
            {
                value: utils.parseEther(amount).add(utils.parseEther('0.05')),
                gasLimit: 880000
            }
        );
    } catch (err) {
        // console.log(err);
        error = err;
    }

    return {
        receipt,
        error,
    };
}
