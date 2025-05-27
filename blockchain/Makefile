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
coverage:
	REPORT_GAS=true npx hardhat coverage
ignition:
	npx hardhat ignition deploy ./ignition/modules/DeployAllModule.ts --network $(NETWORK)
	npx hardhat ignition deploy ./ignition/modules/PostDeploySetupModule.ts --network $(NETWORK)
	npx hardhat ignition deploy ./ignition/modules/InitialContractRolesModule.ts --network $(NETWORK)
ignition-test:
	npx hardhat ignition deploy ./ignition/modules/PostDeployTestSetupModule.ts --network $(NETWORK)
build:
	npm run build

.PHONY: install clean node compile test ignition ignition-test build coverage
