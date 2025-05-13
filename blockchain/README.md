# Auction Hardhat Project

## Run blockchain service

.env file example:
```dotenv
# local/development/production/
NODE_ENV=development

# example environment variables for using a proxy
#HTTP_PROXY=http://host.docker.internal:3128
#HTTPS_PROXY=http://host.docker.internal:3128
#NO_PROXY=

# app settings
CLIENT_PORT:3000
SERVER_PORT:443
BLOCKCHAIN_WS=ws://blockchain:8545

# CHAIN_ID=31337 for local Hardhat service
CHAIN_ID=31337

# signer - temporary data for testing purpose, get from default harrdhat signers
# SIGNER=
# SIGNER_PRIVATE_KEY=

```

```shell
docker-compose up -d blockchain
```

## Build hardhat environment

```shell
docker-compose exec blockchain make compile
```

```shell
docker-compose exec blockchain make ignition
```

set up the role for test environment
```shell
docker-compose exec blockchain make ignition-test
```