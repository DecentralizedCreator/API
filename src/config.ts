// Global Environment Variables
export const port = process.env.PORT || 3000;
export const env = process.env.NODE_ENV || 'development';
export const testing = process.env['LOADED_MOCHA_OPTS'];
export const sessionSecret = process.env.SESSION_SECRET || 'DecentralizedCreator';
export const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost/decentralized_creator';
export const cors = process.env.CORS_URL || 'origin';
export const logging = process.env.LOGGING || 1;
export const cwd = process.cwd();

// Ethereum Wallet and RPC Configuration
// Default RPC for RegTest:     http://localhost:8545
// Suggest using RPCs from      https://infura.io for Mainnet/Testnet.

import { providers, Contract } from 'ethers';

// Default ABI
const abi = [
    "feeAddress()",
    "NewSubscription(address, string, string)",
    "Withdraw(address)",
];

export const ethRpc = process.env.ETH_RPC || 'http://localhost:8545';
export const ethProvider = new providers.JsonRpcProvider(ethRpc);
export const ethAddress = process.env.ETH_ADDRESS || '0xd07a54D42d253b1b35D3162cc60166eC5765aB18';
export const ethNetwork = process.env.ETH_NETWORK || '2';
export const ethContract = new Contract(ethAddress, abi, ethProvider);

console.log(`Using Ethereum RPC Node ${ethRpc}`.green.bold);
console.log(`Ethereum Subscription Smart Contract Address ${ethAddress}\n`.green.bold);

// File Storage Configuration
// @TODO: Finish IPFS Configuration
export const FileStorage = process.env.FS_TYPE || 'none';

// Multer Configuration
import * as multer from 'multer';

export const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, './upload');
    },
    filename(req, file, cb) {
        const name = String(Number(new Date())) + '-' + file.originalname;

        cb(null, name);
    }
});

export const upload = multer({ storage });
