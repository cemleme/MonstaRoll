const { expect } = require("chai");
const { ethers } = require("hardhat");
const {BigNumber} = require("@ethersproject/bignumber");

let contractGame;
let coordinator;
let owner;
let addr1;

describe("MonstaRoll Game", function () {
  beforeEach(async function () {

    const MockVRFCoordinator = await ethers.getContractFactory("MockVRFCoordinator");
    coordinator = await MockVRFCoordinator.deploy();
    await coordinator.deployed();

    const MonstaRoll = await ethers.getContractFactory("MonstaRoll");
    contractGame = await MonstaRoll.deploy(coordinator.address);
    await contractGame.deployed();

    [owner, addr1] = await ethers.getSigners();

    await contractGame.injectBalance({value: '1000000000000000000', from: owner.address});
  });

  it("play works", async function () {
    await contractGame.play(1, {value: '100000000000', from: owner.address});
  });

  it("User plays 10 round - treasury and reward sets correctly", async function () {
    await contractGame.play(10, {value: '10000000000000000', from: owner.address});
    await coordinator.fulfill(0);
    //let round = await contractGame.userBets(owner.address, 0);
    //const payout = await contractGame.getPayout(round.result);
    // console.log('result:', round.result);
    // console.log('payout:', payout);
    //const reward = BigNumber.from(payout).mul(BigNumber.from('1000000000000000')).div(BigNumber.from(100));
    const treasury = BigNumber.from('10000000000000000').div(BigNumber.from(100));
    
    let claimable = await contractGame.claimableBet(owner.address, 0);
    if(claimable){
      await contractGame.claimBet([0]);
    }
    claimable = await contractGame.claimableBet(owner.address, 0);
    expect(claimable).to.equal(false);

    expect(await contractGame.treasury()).to.equal(treasury);
  });

  it("can mint a round", async function () {
    await contractGame.play(1, {value: '100000000000', from: owner.address});

    let round = await contractGame.userBets(owner.address, 0);
    let balanceNFT = await contractGame.balanceOf(owner.address, round.result);
    expect(balanceNFT).to.equal(0);

    await contractGame.mintBet(0);

    round = await contractGame.userBets(owner.address, 0);
    balanceNFT = await contractGame.balanceOf(owner.address, round.result);
    expect(balanceNFT).to.equal(1);
  });

  it("cant double mint a round", async function () {
    await contractGame.play(1, {value: '100000000000', from: owner.address});
    await contractGame.mintBet(0);
    await expect(contractGame.mintBet(0)).to.be.revertedWith(
      "already minted"
    );
  });

  // it("User plays batch 100 rounds for 10 times", async function () {
  //   const numRounds = 100;
  //   const totalBet = '1000000000000000000';
  //   const betPerRound = BigNumber.from(totalBet).div(numRounds);
  //   for(let i = 0; i < 10; i++){
  //     await contractGame.play(numRounds, {value: totalBet, from: owner.address});
  //   }
  //   let round;
    
  //   let totalReward = BigNumber.from(0);
  //   let totalTreasury = BigNumber.from(0);

  //   const roundResults = [0,0,0,0,0,0,0];

  //   for(let i = 0; i < numRounds * 10; i++){
  //     round = await contractGame.userRounds(owner.address, i);
  //     roundResults[round.resultType]++;
  //     const payout = payouts[round.resultType];
  //     const reward = BigNumber.from(payout).mul(BigNumber.from(betPerRound)).div(BigNumber.from(100));
  //     const treasury = BigNumber.from(betPerRound).sub(reward);

  //     totalReward = totalReward.add(BigNumber.from(reward));
  //     totalTreasury = totalTreasury.add(BigNumber.from(treasury));
  //   }

  //   console.log('round results:'+roundResults);
  //   console.log('batch treasury:', (await contractSafe.treasury()).toString());
  //   console.log('batch balance:', (await contractSafe.getBalance(owner.address)).toString());
  //   expect(await contractSafe.treasury()).to.equal(totalTreasury);
  //   expect(await contractSafe.getBalance(owner.address)).to.equal(totalReward);
  // });

  it('can execute raffle round', async () => {
    await ethers.provider.send("evm_increaseTime", [60*60*24*7]);
    await ethers.provider.send("evm_mine");
    await contractGame.executeRaffleRound();
  });

  it('cant execute raffle round before timer', async () => {
    await expect(contractGame.executeRaffleRound()).to.be.revertedWith(
      "raffle cant be completed yet."
    );
  });

  it('empty raffle round has no winner', async () => {
    await ethers.provider.send("evm_increaseTime", [60*60*24*7]);
    await ethers.provider.send("evm_mine");
    await contractGame.executeRaffleRound();
    let round;
    await coordinator.fulfill(0);

    round = await contractGame.raffleRounds(1);
    expect(round.winner).to.equal('0x0000000000000000000000000000000000000000');
    expect(round.nftBalance.toString()).to.equal('0');
    let claimableNFT = await contractGame.claimableNFTRaffle(owner.address);
    expect(claimableNFT).to.equal(false);
    await expect(contractGame.claimNFTRaffle()).to.be.revertedWith(
      "you dont have winner nft"
    );
  });

  it('single bet raffle round has the winner', async () => {
    await contractGame.play(1, {value: '100000000000'});
    await coordinator.fulfill(0);
    await ethers.provider.send("evm_increaseTime", [60*60*24*7]);
    await ethers.provider.send("evm_mine");
    await contractGame.executeRaffleRound();
    await coordinator.fulfill(1);
    let round;

    round = await contractGame.raffleRounds(1);
    //console.log(round);
    expect(round.winner).to.equal(owner.address);

    // console.log(owner.address);
    // let claimableNFT = await contractGame.claimableNFTRaffle(owner.address);
    // console.log(claimableNFT);
    // await contractGame.claimNFTRaffle();
    // claimableNFT = await contractGame.claimableNFTRaffle(owner.address);
    // console.log(claimableNFT);
  });


  it('can get userBets', async () => {
    await contractGame.play(5, {value: '100000000000'});
    await coordinator.fulfill(0);
    const [userBets, lastIndex] = await contractGame.getUserBets(owner.address, 0, 100);
    expect(userBets).to.length(5);
    //console.log(lastIndex.toString());
  })

  it('can get mintableBets', async () => {
    await contractGame.play(5, {value: '100000000000'});
    await coordinator.fulfill(0);
    await contractGame.mintBet(0);
    await contractGame.mintBet(2);
    await contractGame.mintBet(4);
    const mintableBets = await contractGame.getMintableBets(owner.address);
    expect(mintableBets).to.length(2);
  })



});
