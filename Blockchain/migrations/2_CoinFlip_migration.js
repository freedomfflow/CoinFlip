const CoinFlip = artifacts.require("CoinFlipWager");

module.exports = function(deployer) {
deployer.deploy(CoinFlip);
};