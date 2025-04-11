const { ethers, deployments, getNamedAccounts } = require("hardhat")
const { assert } = require("chai")

describe("test fundme contract", async function () {
  let fundme; let firstAccount;
  beforeEach(async function() {
    await deployments.fixture("all");
    firstAccount = (await getNamedAccounts()).firstAccount;
    const fundmeDeployment = await deployments.get("FundMe");
    fundme = await ethers.getContractAt("FundMe", fundmeDeployment.address)
  })

  it("test constructor", async function() {
    await fundme.waitForDeployment();
    console.log(`firstAccount.address = ${firstAccount}`)
    assert.equal((await fundme.owner()), firstAccount);
  })
})