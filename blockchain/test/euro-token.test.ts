import {expect} from "chai";
import "@nomicfoundation/hardhat-chai-matchers";
import {deployEuroToken} from "./deploys/euro-token.deploy";
import {deployAccessManager} from "./deploys/access-manager.deploy";
import {ethers} from "hardhat";
import {EuroToken, AccessManager} from "../typechain-types";

describe("EuroTokenV1", function () {
    let accessManager: AccessManager;
    let euroToken: EuroToken;
    let owner: any;
    let user: any;

    beforeEach(async () => {
        [owner, user] = await ethers.getSigners();
        accessManager = await deployAccessManager(owner);
        euroToken = await deployEuroToken(accessManager);
    });

    it("should mint tokens to sender by authorized user", async () => {
        await euroToken.connect(owner).mint(1000);
        expect(await euroToken.balanceOf(owner.address)).to.equal(1000);
    });

    it("should mint tokens to another user by authorized user", async () => {
        await euroToken.connect(owner).mintTo(user.address, 500);
        expect(await euroToken.balanceOf(user.address)).to.equal(500);
    });

    it("should burn tokens by holder", async () => {
        await euroToken.connect(owner).mint(1000);
        await euroToken.connect(owner).burn(400);
        expect(await euroToken.balanceOf(owner.address)).to.equal(600);
    });

    it("should burn tokens from user with approval", async () => {
        await euroToken.connect(owner).mintTo(user.address, 1000);
        await euroToken.connect(user).approve(owner.address, 500);
        await euroToken.connect(owner).burnFrom(user.address, 500);
        expect(await euroToken.balanceOf(user.address)).to.equal(500);
    });
});
