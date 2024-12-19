const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("VoteCastingEncrypted Contract", function () {
    let voteCastingEncrypted, deployer, addr1, addr2;

    beforeEach(async function () {
        [deployer, addr1, addr2] = await ethers.getSigners();

        const VoteCastingEncrypted = await ethers.getContractFactory("VoteCastingEncrypted");
        voteCastingEncrypted = await VoteCastingEncrypted.deploy();
        await voteCastingEncrypted.waitForDeployment();
    });

    it("should deploy the VoteCastingEncrypted contract successfully", async function () {
        expect(await voteCastingEncrypted.getAddress()).to.not.be.null;
    });

    it("should allow casting an encrypted vote", async function () {
        const candidate = "Alice";
        const encryptedVote = ethers.encodeBytes32String("encryptedVote1");

        await voteCastingEncrypted.connect(addr1).castEncryptedVote(candidate, encryptedVote);

        const votes = await voteCastingEncrypted.getEncryptedVotes(candidate);
        expect(votes.length).to.equal(1);
        expect(votes[0]).to.equal(encryptedVote);

        const hasVoted = await voteCastingEncrypted.hasVoted(addr1.address);
        expect(hasVoted).to.be.true;
    });

    it("should prevent duplicate votes from the same voter", async function () {
        const candidate = "Alice";
        const encryptedVote = ethers.encodeBytes32String("encryptedVote1");

        await voteCastingEncrypted.connect(addr1).castEncryptedVote(candidate, encryptedVote);

        await expect(
            voteCastingEncrypted.connect(addr1).castEncryptedVote(candidate, encryptedVote)
        ).to.be.revertedWith("You have already voted.");
    });

    it("should reject invalid encrypted votes", async function () {
        const candidate = "Alice";
        const invalidEncryptedVote = "0x";

        await expect(
            voteCastingEncrypted.connect(addr1).castEncryptedVote(candidate, invalidEncryptedVote)
        ).to.be.revertedWith("Invalid encrypted vote.");
    });

    it("should allow retrieving encrypted votes for a candidate", async function () {
        const candidate = "Alice";
        const encryptedVote1 = ethers.encodeBytes32String("encryptedVote1");
        const encryptedVote2 = ethers.encodeBytes32String("encryptedVote2");

        await voteCastingEncrypted.connect(addr1).castEncryptedVote(candidate, encryptedVote1);
        await voteCastingEncrypted.connect(addr2).castEncryptedVote(candidate, encryptedVote2);

        const votes = await voteCastingEncrypted.getEncryptedVotes(candidate);

        expect(votes.length).to.equal(2);
        expect(votes[0]).to.equal(encryptedVote1);
        expect(votes[1]).to.equal(encryptedVote2);
    });

    it("should return an empty array if no votes exist for a candidate", async function () {
        const candidate = "Bob";

        const votes = await voteCastingEncrypted.getEncryptedVotes(candidate);

        expect(votes.length).to.equal(0);
    });
});
