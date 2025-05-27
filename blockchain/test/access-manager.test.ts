import {expect} from "chai";
import "@nomicfoundation/hardhat-chai-matchers";
import {ethers} from "hardhat";
import {deployAccessManager} from "./deploys/access-manager.deploy";
import {AccessManager} from "../typechain";
import {HardhatEthersSigner} from "@nomicfoundation/hardhat-ethers/signers";

describe("AccessManager - Contract Registration", function () {
    let accessManager: AccessManager;
    let owner: HardhatEthersSigner;
    let user: HardhatEthersSigner;

    beforeEach(async () => {
        [owner, user] = await ethers.getSigners();
        accessManager = await deployAccessManager(owner);
    });

    it("should register and retrieve contract address", async () => {

        // Mock contract address to register
        const mockAddress = ethers.Wallet.createRandom().address;

        // Register the contract
        const tx = await accessManager.connect(owner).registerContract("AuctionLot", mockAddress);
        const receipt = await tx.wait();

        // Check that the ContractRegistered event was emitted
        const event = receipt?.logs
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

    it("should return a list of predefined roles with label, role, and selectors", async function () {
        const roles = await accessManager.getRoles();

        expect(roles).to.be.an("array");
        expect(roles.length).to.be.greaterThan(0);

        for (const roleSelector of roles) {
            expect(roleSelector.label).to.be.a("string").and.not.to.be.empty;
            expect(roleSelector.role).to.be.a("bigint");
            expect(roleSelector.selectors).to.be.an("array");

            for (const selector of roleSelector.selectors) {
                expect(selector).to.match(/^0x[0-9a-fA-F]{8}$/); // bytes4
            }
        }
    });

    it("should return roles assigned to an address", async function () {
        const roles = await accessManager.getRoles();
        const roleId = roles[0].role;
        const executionDelay = 0;

        await accessManager.connect(owner).grantRole(roleId, user.address, executionDelay);

        const assignedRoles = await accessManager.getRolesOf(user.address);
        expect(assignedRoles.map(r => r.toString())).to.include(roleId.toString());
    });

    it("should return role selectors for a registered contract (authorized)", async function () {
        await accessManager.connect(owner).registerContract(
            "MockResource",
            await user.getAddress()
        );

        const roleSelectors = await accessManager.connect(owner).initRoleSelectors(
            await user.getAddress()
        );

        await roleSelectors.wait();

        const roles = await accessManager.getRoles();

        for (const role of roles) {
            const roleId = role.role;
            const selectors = role.selectors;

            for (const selector of selectors) {
                const assigned = await accessManager.getTargetFunctionRole(
                    await user.getAddress(),
                    selector
                );
                expect(assigned).to.equal(roleId);
            }
        }
    });

    it("should revoke a role from an account", async function () {
        const roles = await accessManager.getRoles();
        const testRoleId = roles[0].role;

        await accessManager.connect(owner).grantRole(testRoleId, user.address, 0);

        const rolesOfBefore = await accessManager.getRolesOf(user.address);
        const hasRoleBefore = rolesOfBefore.map(r => r.toString()).includes(testRoleId.toString());
        expect(hasRoleBefore).to.be.true;

        await accessManager.connect(owner).revokeRole(testRoleId, user.address);

        const rolesOfAfter = await accessManager.getRolesOf(user.address);
        const hasRoleAfter = rolesOfAfter.map(r => r.toString()).includes(testRoleId.toString());
        expect(hasRoleAfter).to.be.false;
    });
});
