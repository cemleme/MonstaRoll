require("@nomiclabs/hardhat-waffle");
//require("hardhat-gas-reporter");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    bscTestnet: {
      url: `https://data-seed-prebsc-1-s1.binance.org:8545/`,
      accounts: [
        process.env.PK
      ],
    },
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: {
      bsc: "PUCYWP94ZIN3TPQMVX22GJ52FNBU6XZE9Q",
      bscTestnet: "PUCYWP94ZIN3TPQMVX22GJ52FNBU6XZE9Q",
      polygon: "YSUX9FFB5J5ZXP8AFFCXQDVD9H9SBD2SZW",
      polygonMumbai: "YSUX9FFB5J5ZXP8AFFCXQDVD9H9SBD2SZW",
    },
  },
};
