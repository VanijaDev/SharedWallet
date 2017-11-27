var Migrations = artifacts.require("./Migrations.sol");
var MyWallet = artifacts.require("./MyWallet.sol");

module.exports = function(deployer) {
  deployer.deploy(Migrations);
  deployer.deploy(MyWallet, {value: 10});
};
