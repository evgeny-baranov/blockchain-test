import {expect} from "chai";
import "@nomicfoundation/hardhat-chai-matchers";
import {deployAuctionLot} from "./deploys/auction-lot.deploy";
import {ethers} from "hardhat";

import {
    AccessManager,
    AuctionLot,
} from "../typechain-types";
import {deployAccessManager} from "./deploys/access-manager.deploy";

describe("AuctionLotV1", function () {
    let accessManager: AccessManager;
    let auctionLot: AuctionLot;
    let owner: any;

    beforeEach(async () => {
        [owner] = await ethers.getSigners();
        accessManager = await deployAccessManager(owner);
        auctionLot = await deployAuctionLot(accessManager);
    });

    it("should deploy and mint token successfully by authorized user", async () => {
        const tx = await auctionLot.connect(owner).mint(await owner.getAddress(), "some-metadata");
        const receipt = await tx.wait();

        const event = receipt.logs
            .map(log => {
                try {
                    return auctionLot.interface.parseLog(log);
                } catch {
                    return null;
                }
            })
            .find(e => e?.name === "Transfer");

        const tokenId = event?.args?.tokenId;

        expect(await auctionLot.ownerOf(tokenId)).to.equal(owner.address);
        expect(await auctionLot.tokenURI(tokenId)).to.equal("ipfs://baranov.eu/some-metadata");
    });

    it("should allow burning a token by authorized user", async () => {
        const tx = await auctionLot.connect(owner).mint(owner.address, "to-burn");
        const receipt = await tx.wait();

        const event = receipt.logs
            .map(log => {
                try {
                    return auctionLot.interface.parseLog(log);
                } catch {
                    return null;
                }
            })
            .find(e => e?.name === "Transfer");

        const tokenId = event?.args?.tokenId;

        // Ensure token exists
        expect(await auctionLot.ownerOf(tokenId)).to.equal(owner.address);

        // Burn it
        await auctionLot.connect(owner).burn(tokenId);

        // Expect it to not exist anymore
        await expect(
            auctionLot.ownerOf(tokenId)
        ).to.be.revertedWithCustomError(
            auctionLot,
            "ERC721NonexistentToken"
        );
    });

    it("should allow pause by authorized user", async () => {
        await expect(auctionLot.connect(owner).pause())
            .to.emit(auctionLot, "Paused")
            .withArgs(owner.address);
    });

    it("should allow unpause by authorized user", async () => {
        await auctionLot.connect(owner).pause();

        await expect(auctionLot.connect(owner).unpause())
            .to.emit(auctionLot, "Unpaused")
            .withArgs(owner.address);
    });

    it("should return all token IDs owned by a user", async () => {
        const ids: bigint[] = [];

        for (let i = 0; i < 3; i++) {
            const tx = await auctionLot.connect(owner).mint(owner.address, `uri-${i}`);
            const receipt = await tx.wait();
            const event = receipt.logs
                .map(log => {
                    try {
                        return auctionLot.interface.parseLog(log);
                    } catch {
                        return null;
                    }
                })
                .find(e => e?.name === "Transfer");

            ids.push(event?.args?.tokenId);
        }

        const owned = await auctionLot.getTokensOfOwner(owner.address);
        expect(owned.map(b => b.toString())).to.have.members(ids.map(b => b.toString()));
    });

    it("should revert mint from unauthorized user", async () => {
        const [, unauthorized] = await ethers.getSigners();

        await expect(
            auctionLot.connect(unauthorized).mint(unauthorized.address, "unauthorized-uri")
        ).to.be.revertedWithCustomError(
            auctionLot,
            "AccessManagedUnauthorized"
        );
    });

    it("should revert burn from unauthorized user", async () => {
        const tx = await auctionLot.connect(owner).mint(owner.address, "to-burn");
        const receipt = await tx.wait();

        const event = receipt.logs
            .map(log => {
                try {
                    return auctionLot.interface.parseLog(log);
                } catch {
                    return null;
                }
            })
            .find(e => e?.name === "Transfer");

        const tokenId = event?.args?.tokenId;

        const [, unauthorized] = await ethers.getSigners();

        await expect(auctionLot.connect(unauthorized).burn(tokenId)).to.be.revertedWithCustomError(
            auctionLot,
            "AccessManagedUnauthorized"
        );
    });

    it("should revert pause from unauthorized user", async () => {
        const [, unauthorized] = await ethers.getSigners();

        await expect(auctionLot.connect(unauthorized).pause()).to.be.revertedWithCustomError(
            auctionLot,
            "AccessManagedUnauthorized"
        );
    });

    it("should revert unpause from unauthorized user", async () => {
        await auctionLot.connect(owner).pause();
        const [, unauthorized] = await ethers.getSigners();

        await expect(auctionLot.connect(unauthorized).unpause()).to.be.revertedWithCustomError(
            auctionLot,
            "AccessManagedUnauthorized"
        );
    });

    it("should revert setBaseURI from unauthorized user", async () => {
        const [, unauthorized] = await ethers.getSigners();

        await expect(auctionLot.connect(unauthorized).setBaseURI("ipfs://new")).to.be.revertedWithCustomError(
            auctionLot,
            "AccessManagedUnauthorized"
        );
    });

    it("should allow an authorized account to set base URI", async function () {
        const [admin] = await ethers.getSigners();

        const newUri = "https://example.com/api/";
        await auctionLot.connect(admin).setBaseURI(newUri);

        const tokenId = 1;
        await auctionLot.connect(admin).mint(admin.address, `${tokenId}`);

        const uri = await auctionLot.tokenURI(tokenId);
        expect(uri).to.equal(`${newUri}${tokenId}`);
    });

    it("should revert if unauthorized account tries to set base URI", async function () {
        const [, attacker] = await ethers.getSigners();

        await expect(
            auctionLot.connect(attacker).setBaseURI("https://hacker.com/api/")
        ).to.be.revertedWithCustomError(auctionLot, "AccessManagedUnauthorized");
    });
});
