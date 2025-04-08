# Default value for NETWORK
NETWORK ?= localhost

testenv:
	npx hardhat run ./deploy/tests/roles.ts --network $(NETWORK)
	npx hardhat run ./deploy/tests/mint-euro.ts --network $(NETWORK)
	npx hardhat run ./deploy/tests/auction-create.ts --network $(NETWORK)
install:
	npm install
clean:
	npx hardhat clean
	rm -rf dist
node:
	npx hardhat node
compile:
	npx hardhat compile
test:
	REPORT_GAS=true npx hardhat test
ignition:
	npx hardhat ignition deploy ./ignition/modules/DeployAllModule.ts --network localhost
	npx hardhat ignition deploy ./ignition/modules/PostDeploySetupModule.ts --network localhost
build:
	npm run build

.PHONY: install clean node compile test ignition build
