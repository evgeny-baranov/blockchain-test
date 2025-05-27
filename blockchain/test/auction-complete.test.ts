import {expect} from "chai";
import "@nomicfoundation/hardhat-chai-matchers";
import {ethers} from "hardhat";
import {deployAccessManager} from "./deploys/access-manager.deploy";
import {AccessManager, Auction, AuctionLot, UsdToken} from "../typechain-types";
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

    let tokenId: BigNumberish;
    let auctionId: BigNumberish;

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

    it("should return all bids for the auction", async function () {
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

        // Check the winner
        const winnerBid = await auction.getWinningBid(auctionId);

        expect(winnerBid.bidder).to.equal(bidder1.address);
        expect(winnerBid.amount).to.equal(ethers.parseEther('100'));

        // Fast-forward time to end auction
        await ethers.provider.send("evm_increaseTime", [3600 + 600 + 1]);
        await ethers.provider.send("evm_mine", []);

        // finalize the auction
        const tx = await auction.connect(custodian).finaliseAuction(auctionId);
        const receipt = await tx.wait();

        const event = receipt?.logs
            .map(log => auction.interface.parseLog(log))
            .find(log => log?.name === "AuctionClaimed");

        expect(event).to.not.be.undefined;
        expect(event?.args?.auctionId).to.equal(auctionId);
        expect(event?.args?.seller).to.equal(owner.address);

        expect(
            await auctionLot.ownerOf(tokenId)
        ).to.equal(bidder1.address);

        const percent = await auction.connect(accountant).getCommissionPercent();

        expect(
            await auction.connect(accountant).commissionAmount(
                await usdToken.getAddress()
            )
        ).to.equal(
            winnerBid.amount * percent / 100n
        )
    });
});