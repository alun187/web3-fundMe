const { ethers, deployments, getNamedAccounts } = require("hardhat")
const { assert, expect } = require("chai")
const { DEVELOPMENT_CHAINS } = require("../../helper-hardhat-config")

DEVELOPMENT_CHAINS.includes(network.name)
?describe.skip
:describe("test fundme contract", async function () {
  let fundme; let firstAccount; let secondAccount; let fundMeSecondAccount;
  beforeEach(async function() {
    await deployments.fixture("all");
    firstAccount = (await getNamedAccounts()).firstAccount;
    secondAccount = (await getNamedAccounts()).secondAccount;
    const fundmeDeployment = await deployments.get("FundMe");
    fundme = await ethers.getContractAt("FundMe", fundmeDeployment.address);
    fundMeSecondAccount = await ethers.getContract("FundMe", secondAccount);
  })

  // test fund and getFund sucessfully
  it("fund and getFund sucessfully", async function() {
    // make sure target reached
    await fundme.fund({value: ethers.parseEther("0.1")});
    // make sure window closed
    await new Promise(resole => setTimeout(resole, 181 * 1000));
    // make sure we can get receipt
    const getFundTx = await fundme.getFund();
    const getFundReceipt = await getFundTx.wait();
    expect(getFundReceipt).to.be.emit(fundme, "FundWithdrawByOwner").withArgs(ethers.parseEther("0.1"));
  })

   // test fund and reFund sucessfully
   it("fund and reFund sucessfully", async function() {
    // make sure target not reached
    await fundme.fund({value: ethers.parseEther("0.01")});
    // make sure window closed
    await new Promise(resole => setTimeout(resole, 181 * 1000));
    // make sure we can get receipt
    const reFundTx = await fundme.reFund();
    const reFundReceipt = await reFundTx.wait();
    expect(reFundReceipt).to.be.emit(fundme, "RefundByFunder").withArgs(firstAccount, ethers.parseEther("0.1"));
  })

})