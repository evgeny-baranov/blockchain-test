import {expect} from "chai";
import "@nomicfoundation/hardhat-chai-matchers";
import {ethers} from "hardhat";
import {deployAccessManager} from "./deploys/access-manager.deploy";
import {AccessManager, Auction, AuctionLot, UsdToken} from "../typechain";
import {HardhatEthersSigner} from "@nomicfoundation/hardhat-ethers/signers";
import {deployAuction} from "./deploys/auction.deploy";
import {deployAuctionLot} from "./deploys/auction-lot.deploy";
import {deployUsdToken} from "./deploys/usd-token.deploy";
import {Roles} from "../app/roles.type";
import {BigNumberish} from "ethers";

describe("Auction contract test", function () {
    let accessManager: AccessManager;
    let auctionLot: AuctionLot;
    let auction: Auction;
    let usdToken: UsdToken;
    let owner: HardhatEthersSigner;
    let minter: HardhatEthersSigner;
    let burner: HardhatEthersSigner;
    let custodian: HardhatEthersSigner;
    let accountant: HardhatEthersSigner;
    let bidder1: HardhatEthersSigner;
    let bidder2: HardhatEthersSigner;
    let bidder3: HardhatEthersSigner;

    beforeEach(async () => {
        [owner, minter, burner, custodian, accountant, bidder1, bidder2, bidder3] = await ethers.getSigners();

        accessManager = await deployAccessManager(owner);
        auctionLot = await deployAuctionLot(accessManager);
        auction = await deployAuction(accessManager);
        usdToken = await deployUsdToken(accessManager);

        await accessManager.grantRole(Roles.MINTER_ROLE, minter.address, 0);
        await accessManager.grantRole(Roles.BURNER_ROLE, burner.address, 0);
        await accessManager.grantRole(Roles.CUSTODIAN_ROLE, custodian.address, 0);
        await accessManager.grantRole(Roles.ACCOUNTANT_ROLE, accountant.address, 0);

        await auction.connect(accountant).addAllowedToken(await usdToken.getAddress());
    });

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

    it("should update commission percent from accountant role", async function () {
        await auction.connect(
            accountant
        ).updateCommissionPercent(23n);

        expect(
            await auction.connect(accountant).getCommissionPercent()
        ).to.equal(23n);
    });

    it("should not allow update commission percent from unauthorised", async function () {
        await expect(
            auction.connect(bidder1).updateCommissionPercent(23n)
        ).to.be.revertedWithCustomError(
            auction,
            "AccessManagedUnauthorized"
        ).withArgs(bidder1.address);
    });

    it("should not allow read commission percent value from unauthorised", async function () {
        await expect(
            auction.connect(bidder1).getCommissionPercent()
        ).to.be.revertedWithCustomError(
            auction,
            "AccessManagedUnauthorized"
        ).withArgs(bidder1.address);
    });

    it("should create auction lot", async function () {
        const uri = "test-uri";
        const tokenId = await createAuctionLot(uri);
        expect(tokenId).to.not.be.undefined;

        const tokenUri = await auctionLot.tokenURI(tokenId);
        const ownerOfToken = await auctionLot.ownerOf(tokenId);

        expect(tokenUri).to.equal(`ipfs://baranov.eu/${uri}`);
        expect(ownerOfToken).to.equal(await owner.getAddress());
    });

    it("should create auction if token transferred to contract with attached data", async function () {
        const tokenId = await createAuctionLot("test-uri");
        await startAuction(tokenId, 100, 50);

        const auctions = await auction.getAuctionsBySeller(await owner.getAddress());

        expect(auctions.length).to.equal(1);
        expect(auctions[0].debitAssetId).to.equal(tokenId);
        expect(auctions[0].seller).to.equal(await owner.getAddress());
        expect(auctions[0].creditStartAmount).to.equal(100);
    });

    it("should allow user to bid on an active auction", async function () {
        const tokenId = await createAuctionLot("test-uri");
        await startAuction(
            tokenId,
            ethers.parseEther('500'),
            ethers.parseEther('5000')
        );

        // Send USD tokens to bidder and approve Auction contract
        await usdToken.connect(minter).mintTo(bidder1.address, ethers.parseEther('1000'));
        await usdToken.connect(bidder1).approve(await auction.getAddress(), ethers.parseEther('1000'));

        // Get auction ID
        const auctions = await auction.getAuctionsBySeller(owner.address);
        const auctionId = auctions[0].auctionId;

        // Place bid
        await expect(
            auction.connect(bidder1).placeBid(auctionId, ethers.parseEther('600'))
        ).to.emit(auction, "AuctionBid");

        const updatedAuction = await auction.getAuction(auctionId);
        expect(updatedAuction.highestBidder).to.equal(await bidder1.getAddress());
        expect(updatedAuction.highestBid).to.equal(ethers.parseEther('600'));
    });

    it("should return the winning bid", async function () {
        const uri = "test-uri";
        const tokenId = await createAuctionLot(uri);

        // Get auction ID
        await startAuction(
            tokenId,
            ethers.parseEther('1000'),
            ethers.parseEther('2500')
        );

        const auctions = await auction.getAuctionsBySeller(owner.address);
        const auctionId = auctions[0].auctionId;

        // Send USD tokens to bidder and approve Auction contract
        await usdToken.connect(minter).mintTo(bidder1.address, ethers.parseEther('2000'));
        await usdToken.connect(minter).mintTo(bidder2.address, ethers.parseEther('3000'));

        await usdToken.connect(bidder1).approve(await auction.getAddress(), ethers.parseEther('1500'));
        await usdToken.connect(bidder2).approve(await auction.getAddress(), ethers.parseEther('2500'));

        await expect(
            await auction.connect(bidder1).placeBid(auctionId, ethers.parseEther('1500'))
        ).to.emit(auction, "AuctionBid").withArgs(auctionId, bidder1.address, ethers.parseEther('1500'));

        await expect(
            await auction.connect(bidder2).placeBid(auctionId, ethers.parseEther('2500'))
        ).to.emit(auction, "AuctionBid").withArgs(auctionId, bidder2.address, ethers.parseEther('2500'));

        // Fast-forward time to end auction
        await ethers.provider.send("evm_increaseTime", [3000 + 600 + 1]);
        await ethers.provider.send("evm_mine", []);

        const winnerBid = await auction.getWinningBid(auctionId);

        expect(winnerBid.bidder).to.equal(bidder2.address);
        expect(winnerBid.amount).to.equal(ethers.parseEther('2500'));
    });

    it("should allow authorized account to cancel auction", async function () {
        const tokenId = await createAuctionLot("test-uri");
        await startAuction(
            tokenId,
            ethers.parseEther('500'),
            ethers.parseEther('5000')
        );

        // Get auction ID
        const auctions = await auction.getAuctionsBySeller(owner.address);
        const auctionId = auctions[0].auctionId;

        await usdToken.connect(minter).mintTo(bidder1.address, ethers.parseEther('1000'));
        await usdToken.connect(minter).mintTo(bidder2.address, ethers.parseEther('1000'));

        await usdToken.connect(bidder1).approve(await auction.getAddress(), ethers.parseEther('1000'));
        await usdToken.connect(bidder2).approve(await auction.getAddress(), ethers.parseEther('1000'));

        await auction.connect(bidder1).placeBid(auctionId, ethers.parseEther('500'));
        await auction.connect(bidder2).placeBid(auctionId, ethers.parseEther('600'));

        const balanceBefore1 = await usdToken.balanceOf(bidder1.address);
        const balanceBefore2 = await usdToken.balanceOf(bidder2.address);

        await expect(
            await auction.connect(custodian).cancelAuction(auctionId)
        ).to.emit(
            auction,
            "AuctionCancelled"
        ).withArgs(auctionId, owner.address);

        const auctionInfo = await auction.getAuction(auctionId);
        expect(
            auctionInfo.closeTime
        ).to.be.gt(0);

        expect(
            await usdToken.balanceOf(bidder1.address)
        ).to.equal(balanceBefore1 + ethers.parseEther('500'));

        expect(
            await usdToken.balanceOf(bidder2.address)
        ).to.equal(balanceBefore2 + ethers.parseEther('600'));
    });

    it("should finalise auction and emit AuctionFinalised event", async function () {
        const tokenId = await createAuctionLot("test-uri");

        const creditStartAmount = ethers.parseEther('100');
        const creditEndAmount = ethers.parseEther('200');

        await startAuction(tokenId, creditStartAmount, creditEndAmount);

        // Get auction ID
        const auctions = await auction.getAuctionsBySeller(owner.address);
        const auctionId = auctions[0].auctionId;

        await usdToken.connect(minter).mintTo(bidder1.address, ethers.parseEther('150'));
        await usdToken.connect(bidder1).approve(await auction.getAddress(), ethers.parseEther('150'));

        // place bid
        await auction.connect(bidder1).placeBid(auctionId, ethers.parseEther('150'));

        // Fast-forward time to end auction
        await ethers.provider.send("evm_increaseTime", [3600 + 600 + 1]);
        await ethers.provider.send("evm_mine", []);

        const tx = await auction.connect(custodian).finaliseAuction(auctionId);
        const receipt = await tx.wait();

        const event = receipt?.logs
            .map(log => auction.interface.parseLog(log))
            .find(log => log?.name === "AuctionClaimed");

        expect(event).to.not.be.undefined;
        expect(event?.args?.auctionId).to.equal(auctionId);
        expect(event?.args?.seller).to.equal(owner.address);

        const newOwner = await auctionLot.ownerOf(tokenId);
        expect(newOwner).to.equal(bidder1.address);
    });

    it("should return all bids for the auction", async function () {
        const tokenId = await createAuctionLot("test-uri");

        const creditStartAmount = ethers.parseEther('10');
        const creditEndAmount = ethers.parseEther('200');

        await startAuction(tokenId, creditStartAmount, creditEndAmount);

        // Get auction ID
        const auctions = await auction.getAuctionsBySeller(owner.address);
        const auctionId = auctions[0].auctionId;

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

        // Retrieve all bids for the auction
        const bids = await auction.getBids(auctionId);

        // Check the number of bids and their details
        expect(bids.length).to.equal(3);
        expect(bids[0].bidder).to.equal(bidder1.address);
        expect(bids[0].amount).to.equal(ethers.parseEther("100"));

        expect(bids[1].bidder).to.equal(bidder2.address);
        expect(bids[1].amount).to.equal(ethers.parseEther("80"));

        expect(bids[2].bidder).to.equal(bidder3.address);
        expect(bids[2].amount).to.equal(ethers.parseEther("90"));
    });
});