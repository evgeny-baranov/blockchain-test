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

## Prepare sources for API server

```shell
docker-compose exec blockchain make build
```

## Run NestJS server

```shell
docker-compose up server
```

# API
Use test *.http files: `server/test/http`

# Update
```shell
docker-compose -f ./docker-compose.yaml run blockchain npm update
```
```shell
docker-compose -f ./docker-compose.yaml run server npm update
```

# Blockchain test 
```shell
docker-compose -f ./docker-compose.yaml run blockchain make coverage
```

# Server test
Run unit tests
```shell
docker-compose -f ./docker-compose.yaml run server npm run test:cov
```
Run tests with coverage
```shell
docker-compose -f ./docker-compose.yaml run server npm run test:cov
```
Run e2e test
```shell
docker-compose -f ./docker-compose.yaml run server npm run test:e2e
```