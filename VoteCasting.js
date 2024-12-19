const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("VoteCasting Contract", function () {
    let voteCasting, ballot, voterRegistry, zkVerifierMock;
    let deployer, voter, candidate1, candidate2;

    beforeEach(async function () {
        [deployer, voter, candidate1, candidate2] = await ethers.getSigners();

        const VoterRegistry = await ethers.getContractFactory("VoterRegistry");
        voterRegistry = await VoterRegistry.deploy();
        await voterRegistry.waitForDeployment();

        const Ballot = await ethers.getContractFactory("Ballot");
        ballot = await Ballot.deploy(await voterRegistry.getAddress());
        await ballot.waitForDeployment();

        const ZKVerifierMock = await ethers.getContractFactory("ZKVerifierMock");
        zkVerifierMock = await ZKVerifierMock.deploy(true); 
        await zkVerifierMock.waitForDeployment();
        
        const VoteCasting = await ethers.getContractFactory("VoteCasting");
        voteCasting = await VoteCasting.deploy(
            await ballot.getAddress(),
            await voterRegistry.getAddress(),
            await zkVerifierMock.getAddress()
        );
        await voteCasting.waitForDeployment();
    });

    it("should deploy the VoteCasting contract successfully", async function () {
        expect(await voteCasting.ballot()).to.equal(await ballot.getAddress());
        expect(await voteCasting.voterRegistry()).to.equal(await voterRegistry.getAddress());
        expect(await voteCasting.zkVerifier()).to.equal(await zkVerifierMock.getAddress());
    });

    it("should allow casting a vote with a valid proof", async function () {
        await ballot.addCandidate("Alice");
        await voterRegistry.registerVoter(voter.address);

        const proof = "0x"; 
        const publicSignals = []; 

        await expect(voteCasting.connect(voter).castVote("Alice", proof, publicSignals))
            .to.emit(voteCasting, "VoteCast")
            .withArgs(voter.address, "Alice");
    });

    it("should not allow a voter to cast multiple votes", async function () {
        await ballot.addCandidate("Alice");
        await voterRegistry.registerVoter(voter.address);

        const proof = "0x";
        const publicSignals = [];

        await voteCasting.connect(voter).castVote("Alice", proof, publicSignals);

        await expect(
            voteCasting.connect(voter).castVote("Alice", proof, publicSignals)
        ).to.be.revertedWith("You have already voted.");
    });

    it("should reject votes for invalid candidates", async function () {
        await voterRegistry.registerVoter(voter.address);

        const proof = "0x";
        const publicSignals = [];

        await expect(
            voteCasting.connect(voter).castVote("Bob", proof, publicSignals)
        ).to.be.revertedWith("Invalid candidate.");
    });

    it("should reject invalid zk-SNARK proofs", async function () {
        await ballot.addCandidate("Alice");
        await voterRegistry.registerVoter(voter.address);

        await zkVerifierMock.setShouldVerify(false);

        const proof = "0x";
        const publicSignals = [];

        await expect(
            voteCasting.connect(voter).castVote("Alice", proof, publicSignals)
        ).to.be.revertedWith("Invalid zk-SNARK proof.");
    });
});
