const { network } = require("hardhat");
const { LOCK_TIME, DEVELOPMENT_CHAINS, NETWORK_CONFIG, CONFIRMATIONS } = require("../helper-hardhat-config")

module.exports = async({getNamedAccounts, deployments}) => {
  const {firstAccount} = await getNamedAccounts();
  const {deploy} = deployments;

  let dataFeedAddress; let confirmations;
  if (DEVELOPMENT_CHAINS.includes(network.name)) {
    const mockV3Aggregator = await deployments.get("MockV3Aggregator");
    dataFeedAddress = mockV3Aggregator.address;
    confirmations = 0;
  } else {
    dataFeedAddress = NETWORK_CONFIG[network.config.chainId].ethUsdDataFeed;
    confirmations = CONFIRMATIONS;
  }

  const fundme = await deploy("FundMe", {
    from: firstAccount,
    args: [LOCK_TIME, dataFeedAddress],
    log: true,
    waitConfirmations: confirmations
  })

  // verify fundMe
  if (hre.network.config.chainId == 11155111 && process.env.APIKEY) {
    await hre.run("verify:verify", {
      address: fundme.address,
      constructorArguments: [LOCK_TIME, dataFeedAddress],
    });
  } else {
    console.log("Network is not sepolia, Verification skipped...")
  }
}

module.exports.tags = ["all", "fundme"]