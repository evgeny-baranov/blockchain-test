import "@openzeppelin/hardhat-upgrades";
import "@nomicfoundation/hardhat-toolbox";
import "solidity-coverage";
import {HardhatUserConfig} from "hardhat/config";

const config: HardhatUserConfig = {
    defaultNetwork: "hardhat",
    typechain: {
        outDir: "typechain",
        target: "ethers-v6",
    },
    solidity: {
        version: "0.8.28",
        settings: {
            optimizer: {
                enabled: true,
            },
            outputSelection: {
                "*": {
                    "*": ["abi", "evm.bytecode", "evm.deployedBytecode", "metadata", "devdoc", "userdoc"]
                }
            },
            viaIR: true,
        }
    },

    networks: {
        localhost: {
            url: "http://127.0.0.1:8545",
            chainId: 31337,
            mining: {
                auto: true,
                interval: 0
            }
        },
    },
};

export default config;
