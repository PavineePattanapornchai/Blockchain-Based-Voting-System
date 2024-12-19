const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("VoterRegistry", function () {
    let voterRegistry, deployer, addr1, addr2;

    beforeEach(async function () {
        [deployer, addr1, addr2] = await ethers.getSigners();
        const VoterRegistry = await ethers.getContractFactory("VoterRegistry");
        voterRegistry = await VoterRegistry.deploy();
    });

    it("Should allow admin to register voters", async function () {
        const adminRole = await voterRegistry.ADMIN_ROLE();
        const isAdmin = await voterRegistry.hasRole(adminRole, deployer.address);
        expect(isAdmin).to.be.true;

        await voterRegistry.registerVoter(addr1.address);
        const isVoter = await voterRegistry.isRegistered(addr1.address);
        expect(isVoter).to.be.true;
    });

    it("Should prevent non-admin from registering voters", async function () {
        await expect(
            voterRegistry.connect(addr1).registerVoter(deployer.address)
        ).to.be.reverted;
    });

    it("Should correctly check if an address is registered", async function () {
        const isVoterBefore = await voterRegistry.isRegistered(addr1.address);
        expect(isVoterBefore).to.be.false;

        await voterRegistry.registerVoter(addr1.address);
        const isVoterAfter = await voterRegistry.isRegistered(addr1.address);
        expect(isVoterAfter).to.be.true;
    });

    it("Should not allow duplicate voter registration", async function () {
        await voterRegistry.registerVoter(addr1.address);

        await expect(
            voterRegistry.registerVoter(addr1.address)
        ).to.be.revertedWith("Voter is already registered."); 
    });

    it("Should authenticate registered voters correctly", async function () {
        await voterRegistry.registerVoter(addr1.address);

        const isVoter = await voterRegistry.isRegistered(addr1.address);
        expect(isVoter).to.be.true;

        const isVoterAddr2 = await voterRegistry.isRegistered(addr2.address);
        expect(isVoterAddr2).to.be.false;
    });

    it("Should not allow registration of the zero address", async function () {
        await expect(
            voterRegistry.registerVoter("0x0000000000000000000000000000000000000000") 
        ).to.be.revertedWith("Invalid voter address.");
    });
});
