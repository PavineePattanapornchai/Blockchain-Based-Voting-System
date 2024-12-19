const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Ballot Contract", function () {
    let ballot, voterRegistry, deployer, admin, addr1, addr2;

    beforeEach(async function () {
        [deployer, admin, addr1, addr2] = await ethers.getSigners();

        const VoterRegistry = await ethers.getContractFactory("VoterRegistry");
        voterRegistry = await VoterRegistry.deploy();
        await voterRegistry.waitForDeployment();

        const Ballot = await ethers.getContractFactory("Ballot");
        ballot = await Ballot.deploy(await voterRegistry.getAddress());
        await ballot.waitForDeployment();
    });

    it("Should deploy successfully and set the correct admin", async function () {
        const adminRole = await ballot.ADMIN_ROLE(); 
        expect(await ballot.hasRole(adminRole, deployer.address)).to.be.true; 
    });

    it("Should allow admin to add candidates", async function () {
        await ballot.addCandidate("Alice");
        const candidates = await ballot.getCandidates();
        expect(candidates).to.deep.equal(["Alice"]);
    });

    it("Should prevent adding duplicate candidates", async function () {
        await ballot.addCandidate("Alice");
        await expect(ballot.addCandidate("Alice")).to.be.revertedWith("Candidate exists");
    });

    it("Should retrieve the list of candidates", async function () {
        await ballot.addCandidate("Alice");
        await ballot.addCandidate("Bob");
        const candidates = await ballot.getCandidates();
        expect(candidates).to.deep.equal(["Alice", "Bob"]);
    });

    it("Should prevent non-admin from adding candidates", async function () {
        await expect(ballot.connect(addr1).addCandidate("Charlie")).to.be.revertedWith("Only admin");
    });

    it("Should allow granting admin role to another address", async function () {
        const adminRole = await ballot.ADMIN_ROLE();

        expect(await ballot.hasRole(adminRole, deployer.address)).to.be.true;

        await ballot.grantRole(adminRole, addr1.address);

        expect(await ballot.hasRole(adminRole, addr1.address)).to.be.true;

        await ballot.connect(addr1).addCandidate("Charlie");
        const candidates = await ballot.getCandidates();
        expect(candidates).to.deep.equal(["Charlie"]);
    });

    it("Should allow adding empty candidate names (no validation in contract)", async function () {
        await ballot.addCandidate(""); 
        const candidates = await ballot.getCandidates();
        expect(candidates).to.include("");
    });

    it("Deployer should have ADMIN_ROLE after deployment", async function () {
        const adminRole = await ballot.ADMIN_ROLE();
        expect(await ballot.hasRole(adminRole, deployer.address)).to.be.true;
    });
});
