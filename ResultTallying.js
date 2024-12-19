const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ResultTallying Contract", function () {
    let ballot, voteCasting, resultTallying, zkVerifier, deployer, admin, addr1, addr2;

    beforeEach(async function () {
        [deployer, admin, addr1, addr2] = await ethers.getSigners();

        const Ballot = await ethers.getContractFactory("Ballot");
        ballot = await Ballot.deploy(deployer.address);
        await ballot.waitForDeployment();

        await ballot.addCandidate("Alice");
        await ballot.addCandidate("Bob");

        const ZKVerifierMock = await ethers.getContractFactory("ZKVerifierMock");
        zkVerifier = await ZKVerifierMock.deploy(true); 
        await zkVerifier.waitForDeployment();

        const VoteCasting = await ethers.getContractFactory("VoteCasting");
        voteCasting = await VoteCasting.deploy(
            await ballot.getAddress(),
            deployer.address,
            await zkVerifier.getAddress()
        );
        await voteCasting.waitForDeployment();

        const ResultTallying = await ethers.getContractFactory("ResultTallying");
        resultTallying = await ResultTallying.deploy(await voteCasting.getAddress());
        await resultTallying.waitForDeployment();
    });

    it("should deploy the ResultTallying contract successfully", async function () {
        expect(await resultTallying.voteCasting()).to.equal(await voteCasting.getAddress());
    });

    it("should allow the admin to tally results and emit a winner", async function () {
        await voteCasting.connect(addr1).castVote("Alice", "0x", []);
        await voteCasting.connect(addr2).castVote("Alice", "0x", []);
        await voteCasting.connect(deployer).castVote("Bob", "0x", []);

        const tx = await resultTallying.tallyResults(["Alice", "Bob"]);
        const receipt = await tx.wait();

        const event = receipt.logs
            .map(log => resultTallying.interface.parseLog(log))
            .find(e => e.name === "ResultsTallied");

        expect(event.args.winner).to.equal("Alice");
        expect(event.args.maxVotes).to.equal(2);
    });

    it("should revert if non-admin tries to tally results", async function () {
        await expect(
            resultTallying.connect(addr1).tallyResults(["Alice", "Bob"])
        ).to.be.revertedWithCustomError(resultTallying, "AccessControlUnauthorizedAccount")
          .withArgs(addr1.address, await resultTallying.ADMIN_ROLE());
    });

    it("should handle ties and return the first candidate with the max votes", async function () {
        await voteCasting.connect(addr1).castVote("Alice", "0x", []);
        await voteCasting.connect(addr2).castVote("Bob", "0x", []);

        const tx = await resultTallying.tallyResults(["Alice", "Bob"]);
        const receipt = await tx.wait();

        const event = receipt.logs
            .map(log => resultTallying.interface.parseLog(log))
            .find(e => e.name === "ResultsTallied");

        expect(event.args.winner).to.equal("Alice"); 
        expect(event.args.maxVotes).to.equal(1);
    });

    it("should return an empty string if no votes were cast", async function () {
        const tx = await resultTallying.tallyResults(["Alice", "Bob"]);
        const receipt = await tx.wait();

        const event = receipt.logs
            .map(log => resultTallying.interface.parseLog(log))
            .find(e => e.name === "ResultsTallied");

        expect(event.args.winner).to.equal("");
        expect(event.args.maxVotes).to.equal(0);
    });
});
