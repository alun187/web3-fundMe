const {task} = require("hardhat/config");

task("interact-fundme", "interact with fundMe contract").addParam("addr", "The address of the FundMe contract").setAction(async(taskArgs, hre) => {
    const fundMeFactory = await ethers.getContractFactory("FundMe");
    const fundMe = fundMeFactory.attach(taskArgs.addr);
    console.log(`param: ${taskArgs.addr}, contract address is ${fundMe.address}`);
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
})

module.exports = {}