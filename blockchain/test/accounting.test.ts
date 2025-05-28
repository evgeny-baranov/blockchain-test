import {expect} from "chai";
import "@nomicfoundation/hardhat-chai-matchers";
import {ethers} from "hardhat";
import {deployAccessManager} from "./deploys/access-manager.deploy";
import {AccessManager, Accounting, Auction, AuctionLot, EuroToken, UsdToken} from "../typechain";
import {HardhatEthersSigner} from "@nomicfoundation/hardhat-ethers/signers";
import {deployAuction} from "./deploys/auction.deploy";
import {deployAuctionLot} from "./deploys/auction-lot.deploy";
import {deployUsdToken} from "./deploys/usd-token.deploy";
import {Roles} from "../app/roles.type";
import {BigNumberish} from "ethers";
import {deployAccounting} from "./deploys/accounting.deploy";
import {deployEuroToken} from "./deploys/euro-token.deploy";

describe("Auction contract test", function () {
    let accessManager: AccessManager;
    let auctionLot: AuctionLot;
    let auction: Auction;
    let accounting: Accounting;
    let usdToken: UsdToken;
    let euroToken: EuroToken;

    let owner: HardhatEthersSigner;
    let minter: HardhatEthersSigner;
    let burner: HardhatEthersSigner;
    let custodian: HardhatEthersSigner;
    let accountant: HardhatEthersSigner;
    let bidder1: HardhatEthersSigner;
    let bidder2: HardhatEthersSigner;
    let bidder3: HardhatEthersSigner;

    let tokenId: BigNumberish;
    let auctionId: BigNumberish;

    async function createAuctionLot(uri: string) {
        const tx = await auction.createAuctionLot(uri);
        const receipt = await tx.wait();

        const event = receipt?.logs
            .map(log => auctionLot.interface.parseLog(log))
            .find(log => log?.name === "Transfer");

        return event?.args?.tokenId;
    }

    async function startAuction(tokenId: BigNumberish, creditStartAmount: BigNumberish, creditEndAmount: BigNumberish) {
        const abiCoder = ethers.AbiCoder.defaultAbiCoder();
        const auctionData = abiCoder.encode(
            [
                "tuple(address creditAsset, uint256 creditStartAmount, uint256 creditEndAmount, uint256 bidIncrement, uint48 startTime, uint48 duration, uint48 claimDelay)"
            ],
            [[
                await usdToken.getAddress(),
                creditStartAmount,
                creditEndAmount,
                ethers.parseEther('1'),
                0,
                3600,
                600
            ]]
        );

        await auctionLot["safeTransferFrom(address,address,uint256,bytes)"](
            await owner.getAddress(),
            await auction.getAddress(),
            tokenId,
            auctionData
        );
    }

    async function processAuction() {
        tokenId = await createAuctionLot("test-uri");

        const creditStartAmount = ethers.parseEther('10');
        const creditEndAmount = ethers.parseEther('200');

        await startAuction(tokenId, creditStartAmount, creditEndAmount);

        // Get auction ID
        const auctions = await auction.getAuctionsBySeller(owner.address);
        auctionId = auctions[0].auctionId;

        // mint USD tokens for bidders
        await usdToken.connect(minter).mintTo(bidder1.address, ethers.parseEther('1000'));
        await usdToken.connect(minter).mintTo(bidder2.address, ethers.parseEther('1000'));
        await usdToken.connect(minter).mintTo(bidder3.address, ethers.parseEther('1000'));

        // approve Auction contract to spend USD tokens
        await usdToken.connect(bidder1).approve(auction.getAddress(), ethers.parseEther("1000"));
        await usdToken.connect(bidder2).approve(auction.getAddress(), ethers.parseEther("1000"));
        await usdToken.connect(bidder3).approve(auction.getAddress(), ethers.parseEther("1000"));

        // Place bids
        await auction.connect(bidder1).placeBid(auctionId, ethers.parseEther("10"));
        await auction.connect(bidder2).placeBid(auctionId, ethers.parseEther("20"));
        await auction.connect(bidder3).placeBid(auctionId, ethers.parseEther("30"));

        await auction.connect(bidder1).placeBid(auctionId, ethers.parseEther("40"));
        await auction.connect(bidder2).placeBid(auctionId, ethers.parseEther("50"));
        await auction.connect(bidder3).placeBid(auctionId, ethers.parseEther("60"));

        await auction.connect(bidder1).placeBid(auctionId, ethers.parseEther("70"));
        await auction.connect(bidder2).placeBid(auctionId, ethers.parseEther("80"));
        await auction.connect(bidder3).placeBid(auctionId, ethers.parseEther("90"));

        await auction.connect(bidder1).placeBid(auctionId, ethers.parseEther("100"));

        await ethers.provider.send("evm_increaseTime", [3600 + 600 + 1]);
        await ethers.provider.send("evm_mine", []);

        // finalize the auction
        const tx = await auction.connect(custodian).finaliseAuction(auctionId);
        await tx.wait();
    }

    beforeEach(async () => {
        [owner, minter, burner, custodian, accountant, bidder1, bidder2, bidder3] = await ethers.getSigners();

        accessManager = await deployAccessManager(owner);
        auctionLot = await deployAuctionLot(accessManager);
        auction = await deployAuction(accessManager);
        usdToken = await deployUsdToken(accessManager);
        euroToken = await deployEuroToken(accessManager);
        accounting = await deployAccounting(accessManager);

        await accessManager.grantRole(Roles.MINTER_ROLE, minter.address, 0);
        await accessManager.grantRole(Roles.BURNER_ROLE, burner.address, 0);
        await accessManager.grantRole(Roles.CUSTODIAN_ROLE, custodian.address, 0);
        await accessManager.grantRole(Roles.ACCOUNTANT_ROLE, accountant.address, 0);

        await auction.connect(accountant).addAllowedToken(await usdToken.getAddress());
        await processAuction();
    });

    it("should accumulate and withdraw commission after auction finalization", async function () {
        const commissionAmount = await accounting.connect(
            accountant
        ).containerCommissionAmount(
            await auction.getAddress(),
            await usdToken.getAddress()
        );

        expect(commissionAmount).to.be.gt(0);

        const recipientBalanceBefore = await usdToken.balanceOf(owner);

        await accounting.connect(accountant).withdrawContainerCommission(
            await auction.getAddress(),
            await usdToken.getAddress(),
            owner.address
        );

        const recipientBalanceAfter = await usdToken.balanceOf(owner);
        expect(recipientBalanceAfter - recipientBalanceBefore).to.equal(commissionAmount);

        const remainingCommission = await accounting.connect(
            accountant
        ).containerCommissionAmount(
            await auction.getAddress(),
            await usdToken.getAddress()
        );

        expect(remainingCommission).to.equal(0);
    });

    it("should allow authorized account to update commission percent", async function () {
        const newPercent = 250n; // 2.5%

        await expect(accounting.connect(
            accountant
        ).updateContainerCommissionPercent(
            await auction.getAddress(),
            newPercent
        )).to.not.be.reverted;

        const updated = await accounting.connect(
            accountant
        ).containerCommissionPercent(
            await auction.getAddress()
        );

        expect(updated).to.equal(newPercent);
    });

    it("should NOT allow unauthorized account to update commission percent", async function () {
        const newPercent = 300n; // 3.0%

        await expect(accounting.connect(bidder1).updateContainerCommissionPercent(
            await auction.getAddress(),
            newPercent
        )).to.be.revertedWithCustomError(accounting, "AccessManagedUnauthorized");
    });

    it("should allow authorized account to withdraw commission", async function () {
        const container = await auction.getAddress();
        const asset = await usdToken.getAddress();
        const recipient = accountant.address;

        const commissionBefore = await accounting.connect(
            accountant
        ).containerCommissionAmount(
            container,
            asset
        );

        expect(commissionBefore).to.be.gt(0);

        const balanceBefore = await usdToken.balanceOf(recipient);

        await expect(accounting.connect(
            accountant
        ).withdrawContainerCommission(
            container,
            asset,
            recipient
        )).to.emit(
            auction,
            "CommissionDebited"
        ).withArgs(asset, recipient, commissionBefore);

        const balanceAfter = await usdToken.balanceOf(recipient);
        const commissionAfter = await accounting.connect(
            accountant
        ).containerCommissionAmount(container, asset);

        expect(balanceAfter - balanceBefore).to.equal(commissionBefore);
        expect(commissionAfter).to.equal(0);
    });

    it("should NOT allow unauthorized account to withdraw commission", async function () {
        const container = await auction.getAddress();
        const asset = await usdToken.getAddress();
        const recipient = bidder1.address;

        await expect(
            accounting.connect(bidder1).withdrawContainerCommission(container, asset, recipient)
        ).to.be.revertedWithCustomError(accounting, "AccessManagedUnauthorized");
    });

    it("should allow authorized account to add allowed token", async function () {
        const container = await auction.getAddress();
        const token = await euroToken.getAddress();

        await accounting.connect(accountant).addContainerAllowedToken(container, token);

        const allowed = await accounting.containerAllowedTokens(container);
        const tokens = allowed.map(t => t.token);
        expect(tokens).to.include(token);
    });

    it("should NOT allow unauthorized account to add allowed token", async function () {
        const container = await auction.getAddress();
        const token = await euroToken.getAddress();

        await expect(
            accounting.connect(bidder1).addContainerAllowedToken(container, token)
        ).to.be.revertedWithCustomError(accounting, "AccessManagedUnauthorized");
    });

    it("should allow authorized account to remove allowed token", async function () {
        const container = await auction.getAddress();
        const token = await usdToken.getAddress();

        await accounting.connect(
            accountant
        ).removeContainerAllowedToken(container, token);

        const allowed = await accounting.containerAllowedTokens(container);
        expect(allowed).to.not.include(token);
    });

    it("should NOT allow unauthorized account to remove allowed token", async function () {
        const container = await auction.getAddress();
        const token = await euroToken.getAddress();

        await expect(
            accounting.connect(bidder1).removeContainerAllowedToken(container, token)
        ).to.be.revertedWithCustomError(accounting, "AccessManagedUnauthorized");
    });
});