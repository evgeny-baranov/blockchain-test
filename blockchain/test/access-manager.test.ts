import {expect} from "chai";
import "@nomicfoundation/hardhat-chai-matchers";
import {ethers} from "hardhat";
import {deployAccessManager} from "./deploys/access-manager.deploy";

describe("AccessManager - Contract Registration", function () {
    let accessManager: any;
    let owner: any;

    beforeEach(async () => {
        [owner] = await ethers.getSigners();
        (accessManager = await deployAccessManager(owner));
    });

    it("should register and retrieve contract address", async () => {

        // Mock contract address to register
        const mockAddress = ethers.Wallet.createRandom().address;

        // Register the contract
        const tx = await accessManager.connect(owner).registerContract("AuctionLot", mockAddress);
        const receipt = await tx.wait();

        // Check that the ContractRegistered event was emitted
        const event = receipt.logs
            .map(log => {
                try {
                    return accessManager.interface.parseLog(log);
                } catch {
                    return null;
                }
            })
            .find(e => e?.name === "ContractRegistered");

        expect(event).to.not.be.undefined;
        expect(event!.args.name).to.equal(ethers.keccak256(ethers.toUtf8Bytes("AuctionLot")));
        expect(event!.args.contractAddress).to.equal(mockAddress);

        // Confirm the contract is registered and retrievable
        const registered = await accessManager.getContract("AuctionLot");
        expect(registered).to.equal(mockAddress);
    });

    it("should not revert if registering same address twice", async () => {
        const mockAddress = ethers.Wallet.createRandom().address;

        await accessManager.registerContract("AuctionLot", mockAddress);

        // Re-registering the same contract name with the same address should succeed
        await expect(
            accessManager.registerContract("AuctionLot", mockAddress)
        ).to.not.be.reverted;

        // Make sure it's still registered correctly
        const retrieved = await accessManager.getContract("AuctionLot");
        expect(retrieved).to.equal(mockAddress);
    });

    it("should revert if contract name is already registered with a different address", async () => {
        const first = ethers.Wallet.createRandom().address;
        const second = ethers.Wallet.createRandom().address;

        await accessManager.registerContract("AuctionLot", first);

        // Second registration with different address should fail
        await expect(
            accessManager.registerContract("AuctionLot", second)
        ).to.be.revertedWithCustomError(accessManager, "AlreadyRegisteredContract");
    });

    it("should correctly report if a contract is registered", async () => {
        const contractA = ethers.Wallet.createRandom().address;
        const contractB = ethers.Wallet.createRandom().address;

        // Initially, neither is registered
        expect(await accessManager.isRegistered(contractA)).to.equal(false);
        expect(await accessManager.isRegistered(contractB)).to.equal(false);

        // Register contractA
        await accessManager.registerContract("ContractA", contractA);

        // Check the registration status
        expect(await accessManager.isRegistered(contractA)).to.equal(true);
        expect(await accessManager.isRegistered(contractB)).to.equal(false);
    });

    it("should return all registered contract names and addresses", async () => {
        const addressA = ethers.Wallet.createRandom().address;
        const addressB = ethers.Wallet.createRandom().address;

        await accessManager.registerContract("ContractA", addressA);
        await accessManager.registerContract("ContractB", addressB);

        const [names, addresses] = await accessManager.getRegisteredContracts();

        const hashA = ethers.keccak256(ethers.toUtf8Bytes("ContractA"));
        const hashB = ethers.keccak256(ethers.toUtf8Bytes("ContractB"));

        expect(names).to.include.members([hashA, hashB]);
        expect(addresses).to.include.members([addressA, addressB]);
    });
});
