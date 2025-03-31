import {HardhatUserConfig} from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";

const config: HardhatUserConfig = {
    defaultNetwork: "hardhat",

    solidity: {
        version: "0.8.28",
        settings: {
            optimizer: {
                enabled: true,
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
