const DECIMAL = 8;
const INITAL_ANSWER = 300000000000;
const LOCK_TIME = 180;
const DEVELOPMENT_CHAINS = ["hardhat", "local"];
const CONFIRMATIONS = 5;
const NETWORK_CONFIG  = {
  11155111: {
    ethUsdDataFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306"
  },
  97: {
    ethUsdDataFeed: "0x143db3CEEfbdfe5631aDD3E50f7614B6ba708BA7"
  }
}


module.exports = {
  DECIMAL,
  INITAL_ANSWER,
  DEVELOPMENT_CHAINS,
  LOCK_TIME,
  NETWORK_CONFIG,
  CONFIRMATIONS
}