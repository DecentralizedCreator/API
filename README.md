# Decentralized Creator 🖲 REST API

![License](https://img.shields.io/badge/license-Apache%20V2-blue.svg)
![NPM Version](https://img.shields.io/badge/npm-v6.4.1-blue.svg)
![Node Version](https://img.shields.io/badge/node-v10.14.1-blue.svg)

Decentralized Creator is a platform devoted to free speech. We believe that free speech is a fundamental human right. Decentralized Creator is a platform that intends to mitigate and respond to concerns revolved around censorship.

## Running in development mode

```bash
# Install node_modules
yarn

# If nodemon is not installed
yarn global add nodemon

# Run with nodemon
yarn start # or just `nodemon`
```

## Running in production or beta mode

Our suggestion is to use PM2. It's the most stable and easiest to use process manager for Node. You can obviously use your process manager if you so wish.

```bash
# Install node_modules
yarn

# If pm2 is not installed
yarn global add pm2

# Build the project
yarn build

# Configure your environment
export NODE_ENV='production'
...

# Run with pm2
pm2 start dist/server.js --name DC_API
```

## Configuring for beta and production deployments

Please make sure you have these environment variables configured in order for the API to function properly. The below environment variables are based on the default configurations:

```bash
# Server Configuration
export PORT=3000
export NODE_ENV='development'
export SESSION_SECRET='DecentralizedCreator' # Suggestion: create a custom one via SHA or some Checksum.
export MONGO_URL='mongodb://localhost/decentralized_creator'
export CORS_URL='origin' # Origin will allow preflight from the originating URI.
export LOGGING=1 # 1 will have verbose logging via Morgan. 0 will not log anything.

# Ethereum Configuration
export ETH_URL='http://localhost:8545'
export ETH_ADDRESS='0x2e339b901aB2e66884284e187c193ECACf3E88F5'

# (T)OTP Auth Configuration
export TOTP_ISSUER='Decentralized Creator'
export TOTP_LABEL='Decentralized Creator'
export TOTP_SECRET='DCREATOR'

# File Storage (or IPFS) Configuration
export FS_TYPE='none' # Set to 'ipfs' to enable IPFS based storage.
export IPFS_URL='' # Set the 'ipfs' pinning node URL. You can easily load balance this URI

# Temporary (Sendgrid Key), This will be replaced with custom SMTP configuration details
export SENDGRID_KEY='SG.SENDGRID_API_KEY'
```

## Quality of Life Roadmap

- [ ] Unit Testing in Mocha, Chai. Full branch coverage.

- [ ] Testing done in a CI (Travis until eaxops.com).

- [ ] API Documentation, Formatted developer comments.

- [ ] Stricter Typescript syntax, with better interface and type management.

## Functionality Roadmap

- [ ] Self Serving SMTP Server via Haraka, option to use external SMTP provider.

- [ ] BTC, XMR Custodial and Non-Custodial Wallet Management (see https://decentralizedcreator.com/roadmap)

- [ ] Content is all served on IPFS and Cached with SFS.

- [ ] One click deployments on eaxops.com.

## Additional Notes

- Apache V2 Licensed

- All development and source code will eventually migrate to https://eaxops.com

- Have a question? :mailbox: Email hello@chriscates.ca
