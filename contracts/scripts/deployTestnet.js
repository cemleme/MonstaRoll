// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  const network = 'polygon';
  let vrfCoordinator;
  let keyHash;
  let linkToken;
  let subscriptionId;
  //BSC TESTNET
  if(network === 'bsc'){
    vrfCoordinator = "0x6A2AAd07396B36Fe02a22b33cf443582f682c82f";
    linkToken = "0x84b9B910527Ad5C03A9Ca831909E21e236EA7b06";
    keyHash = "0xd4bb89654db74673a187bd804519e65e3f71a52bc55f11da7601a13dcf505314";
    subscriptionId = 648;
  }  
  else if(network === 'polygon'){
    vrfCoordinator = "0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed";
    linkToken= "0x326C977E6efc84E512bB9C30f76E30c160eD06FB";
    keyHash = "0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f";
    subscriptionId = 383;
  }
  else if(network === 'avalanche'){
    vrfCoordinator = "0x2eD832Ba664535e5886b75D64C46EB9a228C2610";
    linkToken = "0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846";
    keyHash = "0x354d2f95da55398f44b7cff77da56283d9c6c829a4bdf1bbcaf2ad6a4d081f61";
    subscriptionId = 87;
  }

  // We get the contract to deploy
  const MonstaRoll = await hre.ethers.getContractFactory("MonstaRoll");
  const monstaRoll = await MonstaRoll.deploy(vrfCoordinator, keyHash, subscriptionId);

  await monstaRoll.deployed();

  console.log("MonstaRoll deployed to "+network, monstaRoll.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
