const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ElectionAdmin Contract", function () {
    let ballot, voteCasting, electionAdmin;
    let deployer, admin, addr1;

    beforeEach(async function () {
        [deployer, admin, addr1] = await ethers.getSigners();

        const Ballot = await ethers.getContractFactory("Ballot");
        ballot = await Ballot.deploy(deployer.address);
        await ballot.waitForDeployment();

        const VoteCasting = await ethers.getContractFactory("VoteCasting");
        voteCasting = await VoteCasting.deploy(await ballot.getAddress(), addr1.address, addr1.address); 
        await voteCasting.waitForDeployment();

        const ElectionAdmin = await ethers.getContractFactory("ElectionAdmin");
        electionAdmin = await ElectionAdmin.deploy(
            await ballot.getAddress(),
            await voteCasting.getAddress()
        );
        await electionAdmin.waitForDeployment();
    });

    it("should deploy the ElectionAdmin contract successfully", async function () {
        expect(await electionAdmin.hasRole(await electionAdmin.ADMIN_ROLE(), deployer.address)).to.be.true;
        expect(await electionAdmin.ballot()).to.equal(await ballot.getAddress());
        expect(await electionAdmin.voteCasting()).to.equal(await voteCasting.getAddress());
    });

    it("should allow admin to start the election", async function () {
        expect(await electionAdmin.electionActive()).to.be.false;

        await electionAdmin.startElection();
        expect(await electionAdmin.electionActive()).to.be.true;
    });

    it("should prevent non-admin from starting the election", async function () {
        await expect(
            electionAdmin.connect(addr1).startElection()
        ).to.be.revertedWith("Only admin");
    });

    it("should allow admin to end an active election", async function () {
        await electionAdmin.startElection();
        expect(await electionAdmin.electionActive()).to.be.true;

        await electionAdmin.endElection();
        expect(await electionAdmin.electionActive()).to.be.false;
    });

    it("should prevent ending an election when not active", async function () {
        expect(await electionAdmin.electionActive()).to.be.false;

        await expect(electionAdmin.endElection()).to.be.revertedWith("Election inactive");
    });

    it("should allow admin to pause an active election", async function () {
        await electionAdmin.startElection();
        expect(await electionAdmin.electionActive()).to.be.true;

        await electionAdmin.pauseElection();
        expect(await electionAdmin.electionActive()).to.be.false;
    });

    it("should allow admin to resume a paused election", async function () {
        await electionAdmin.startElection();
        await electionAdmin.pauseElection();
        expect(await electionAdmin.electionActive()).to.be.false;

        await electionAdmin.resumeElection();
        expect(await electionAdmin.electionActive()).to.be.true;
    });

    it("should prevent non-admin from pausing or resuming the election", async function () {
        await electionAdmin.startElection();

        await expect(
            electionAdmin.connect(addr1).pauseElection()
        ).to.be.revertedWith("Only admin");

        await expect(
            electionAdmin.connect(addr1).resumeElection()
        ).to.be.revertedWith("Only admin");
    });

    it("should emit events for starting, pausing, resuming, and ending elections", async function () {
        await expect(electionAdmin.startElection())
            .to.emit(electionAdmin, "ElectionStarted");

        await expect(electionAdmin.pauseElection())
            .to.emit(electionAdmin, "ElectionPaused");

        await expect(electionAdmin.resumeElection())
            .to.emit(electionAdmin, "ElectionResumed");

        await expect(electionAdmin.endElection())
            .to.emit(electionAdmin, "ElectionEnded");
    });

    it("should prevent resuming an election that is already active", async function () {
        await electionAdmin.startElection();

        await expect(electionAdmin.resumeElection()).to.be.revertedWith(
            "Election active"
        );
    });

    it("should prevent pausing an election that is not active", async function () {
        await expect(electionAdmin.pauseElection()).to.be.revertedWith(
            "Election inactive"
        );
    });
});
