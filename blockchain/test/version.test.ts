import {expect} from "chai";
import "@nomicfoundation/hardhat-chai-matchers";
import {ethers} from "hardhat";
import {deployAccessManager} from "./deploys/access-manager.deploy";
import {AccessManager} from "../typechain";
import {HardhatEthersSigner} from "@nomicfoundation/hardhat-ethers/signers";

describe("Version - Contract version", function () {
    let accessManager: AccessManager;
    let owner: HardhatEthersSigner;

    beforeEach(async () => {
        [owner] = await ethers.getSigners();
        (accessManager = await deployAccessManager(owner));
    });

    it("should return valid contract version", async function () {
        expect(
            await accessManager.version()
        ).to.equal(1n);
    });
});