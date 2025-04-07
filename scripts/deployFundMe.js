// imposrt ethers.js
// create main function
// execute main function
require("@chainlink/env-enc").config();
const { ethers } = require("hardhat");

const ETHERSCAN_API_KEY = process.env.APIKEY;

async function main() {
  // create factory
  const fundMeFactory = await ethers.getContractFactory("FundMe");
  console.log("contract deploying");
  // deploy contract from factory
  const fundMe = await fundMeFactory.deploy(300);
  await fundMe.waitForDeployment();
  console.log(`contract has been deployed successfully, contract address is ${fundMe.target}`);  

  // verify fundMe
  if (hre.network.config.chainId == 11155111 && ETHERSCAN_API_KEY) {
    console.log("Waiting for 5 confirmations");
    await fundMe.deploymentTransaction().wait(5);
    console.log("Complete 5 block...")
    await verifyFundMe(fundMe.target, [300]);
  } else {
    console.log("verification skipped...")
  }

  // init 2 account 
  const [firstAccount, secondAccount] = ethers.getSigners();
  // fund contract with first account 
  const fundTx = await fundMe.fund({value: ethers.parseEther(0.0001)});
  await fundTx.wait();
  // check balance of contract
  const balanceOfContract = await ethers.provider.getBalance(fundMe.target);
  console.log(`balance of the contract is ${balanceOfContract}`);

  // fund contract with second account 
  const fundWithSecondTx = await fundMe.connect(secondAccount).fund({value: ethers.parseEther(0.0001)});
  await fundWithSecondTx.wait();
  // check balance of contract
  const balanceOfContractAfterSecondFund = await ethers.provider.getBalance(fundMe.target);
  console.log(`balance of the contract is ${balanceOfContractAfterSecondFund}`);

  // check fundersToAmount
  const firstAccountBalance = await fundMe.fundersToAmount(firstAccount.address);
  const secondAccountBalance = await fundMe.fundersToAmount(secondAccount.address);
  console.log(`balacce of first account ${firstAccount} is ${firstAccountBalance}`);
  console.log(`balacce of second account ${secondAccount} is ${secondAccountBalance}`);
}

async function verifyFundMe(fundMeAddr, args) {
  await hre.run("verify:verify", {
    address: fundMeAddr,
    constructorArguments: args,
  });
}

main().then().catch((error) => {
  console.error(error);
  process.exit(1);
});