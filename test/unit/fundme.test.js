const { ethers, deployments, getNamedAccounts } = require("hardhat")
const { assert, expect } = require("chai")
const helpers = require("@nomicfoundation/hardhat-network-helpers")

describe("test fundme contract", async function () {
  let fundme; let firstAccount; let secondAccount; let fundMeSecondAccount;
  beforeEach(async function() {
    await deployments.fixture("all");
    firstAccount = (await getNamedAccounts()).firstAccount;
    secondAccount = (await getNamedAccounts()).secondAccount;
    const fundmeDeployment = await deployments.get("FundMe");
    fundme = await ethers.getContractAt("FundMe", fundmeDeployment.address);
    fundMeSecondAccount = await ethers.getContract("FundMe", secondAccount);
  })

  it("test constructor", async function() {
    await fundme.waitForDeployment();
    console.log(`firstAccount.address = ${firstAccount}`)
    assert.equal((await fundme.owner()), firstAccount);
  })

  // test fund
  it("test fund, window closed, value grater than minimum, fund failed", async function () {
    // make sure the window is closed
    await helpers.time.increase(200);
    await helpers.mine();

    await expect(fundme.fund({value: ethers.parseEther("0.1")})).to.be.revertedWith("window is closed");
  })

  it("test fund, window open, value is less than minimum, fund failed", async function() {
    await expect(fundme.fund({value: ethers.parseEther("0.0001")})).to.be.revertedWith("Send more ETH");
  })

  it("test fund, window open, value grater than minimum, fund sucess", async function() {
    await fundme.fund({value: ethers.parseEther("0.1")});
    const balance = await fundme.fundersToAmount(firstAccount);
    await expect(balance).to.equal(ethers.parseEther("0.1"));
  })

  // test getFund
  it("test getFund, window closed, not owner, target reached, getFund faild", async function () {
    await fundme.fund({value: ethers.parseEther("1")});

    // make sure the window is closed
    await helpers.time.increase(200);
    await helpers.mine();

    await expect(fundMeSecondAccount.getFund()).to.be.rejectedWith("this function can only be called by owner");
  })

  it("test getFund, window open, owner, target reached, getFund faild", async function () {
    await fundme.fund({value: ethers.parseEther("1")});
    await expect(fundme.getFund()).to.be.rejectedWith("window is not closed");
  })

  it("test getFund, window closed, owner, target not reached, getFund faild", async function () {
    await fundme.fund({value: ethers.parseEther("0.1")});
    // make sure the window is closed
    await helpers.time.increase(200);
    await helpers.mine();
    
    await expect(fundme.getFund()).to.be.rejectedWith("Target is not reached");
  })

  it("test getFund, window closed, owner, target reached, getFund sucess", async function () {
    await fundme.fund({value: ethers.parseEther("1")});
    // make sure the window is closed
    await helpers.time.increase(200);
    await helpers.mine();

    expect(fundme.getFund()).to.emit(fundme, "FundWithdrawByOwner").withArgs(ethers.parseEther("1"));
  })

  // refund
  // windowClosed, target not reached, funder has balance
  it("window open, target not reached, funder has balance, refund faild", async function() {
    await fundme.fund({value: ethers.parseEther("0.1")});
    await expect(fundme.refund()).to.be.revertedWith("window is not closed");
  })

  it("window closed, target reached, funder has balance, refund faild", async function() {
    await fundme.fund({value: ethers.parseEther("1")});

    // make sure the window is closed
    await helpers.time.increase(200);
    await helpers.mine();

    await expect(fundme.refund()).to.be.revertedWith("Target is reached");
  })

  it("window closed, target not reached, funder does not has balance, refund faild", async function() {
    await fundme.fund({value: ethers.parseEther("0.1")});

    // make sure the window is closed
    await helpers.time.increase(200);
    await helpers.mine();

    await expect(fundMeSecondAccount.refund()).to.be.revertedWith("there is no fund for you");
  })

  it("window closed, target not reached, funder has balance, refund sucess", async function() {
    await fundme.fund({value: ethers.parseEther("0.1")});

    // make sure the window is closed
    await helpers.time.increase(200);
    await helpers.mine();

    await expect(fundme.refund()).to.emit(fundme, "RefundByFunder").withArgs(firstAccount, ethers.parseEther("0.1"));
  })
})