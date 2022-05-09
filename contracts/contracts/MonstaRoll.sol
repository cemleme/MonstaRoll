// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.4;

import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";

import "hardhat/console.sol";

contract MonstaRoll is
    Ownable,
    ReentrancyGuard,
    ERC1155Supply,
    VRFConsumerBaseV2
{
    struct Bet {
        uint64 epoch;
        uint64 betAmount;
        uint64 rewardAmount;
        uint32 result;
        uint8 resultType;
        uint8 numBets;
        bool claimed;
        bool minted;
    }

    struct RequestData {
        address user;
        uint8 numDraw;
        uint64 betAmount;
    }

    struct RaffleRound {
        address[] entrants; //array of all entrants, winner will be picked by random index
        uint256 randomNFT;
        uint256 randomWinner;
        uint256 startTimestamp;
        address winner;
        uint64 balance;
        uint64 nftBalance;
        uint64 rewardPerNft;
        uint64 winnerIndex;
        uint64 winnerNFT;
        bool raffleClaimed;
        bool executed;
        bool fulfilled;
    }

    uint256 public safeBalance;
    uint256 public treasury;
    uint256 public safeRate = 690; //to be divided by 1000
    uint256 public treasuryRate = 10; //to be divided by 1000
    uint256 public raffleRate = 300; //to be divided by 1000

    uint256 public raffleDuration = 1 weeks;
    uint256 public ticketPerAmount = 0.01 ether;
    uint256 public currentRaffleRound;
    uint64 public nftRewardBalanceLeft;

    mapping(uint256 => RequestData) public requestData;
    mapping(uint256 => bool) public requestToPlay;

    enum ResultType {
        NONE,
        PAIR,
        TWO_PAIR,
        THREE_KIND,
        FULL_HOUSE,
        FOUR_KIND,
        FIVE_KIND
    }
    mapping(ResultType => uint256) public payoutAmounts;
    mapping(address => mapping(uint256 => Bet)) public userBets;
    mapping(address => uint256) public numUserBets;
    mapping(address => uint256) public userEpoch;
    mapping(uint256 => RaffleRound) public raffleRounds;
    mapping(address => mapping(uint256 => uint256)) public userRaffleTickets;
    mapping(address => mapping(uint256 => bool)) public userNFTRaffleClaimed;

    mapping(address => uint256) private _userMintLatestRound;
    mapping(address => uint256) private _userWinnerNFTAfterRound;

    //VRF Properties

    VRFCoordinatorV2Interface COORDINATOR;
    uint64 s_subscriptionId = 648;
    //address vrfCoordinator = 0x6A2AAd07396B36Fe02a22b33cf443582f682c82f;
    bytes32 keyHash =
        0xd4bb89654db74673a187bd804519e65e3f71a52bc55f11da7601a13dcf505314;
    uint32 callbackGasLimit = 100000;
    uint16 requestConfirmations = 3;
    uint32 numWords = 2;

    ///// VRF

    constructor(address vrfCoordinator)
        ERC1155("https://ipfs.io/ipfs/bafybeibspyh5mdop4yj3tmxwoimye267uriu3wwwndmvaphxpq4opppeda/{id}.json")
        VRFConsumerBaseV2(vrfCoordinator)
    {
        payoutAmounts[ResultType.NONE] = 0;
        payoutAmounts[ResultType.PAIR] = 10;
        payoutAmounts[ResultType.TWO_PAIR] = 50;
        payoutAmounts[ResultType.THREE_KIND] = 125;
        payoutAmounts[ResultType.FULL_HOUSE] = 200;
        payoutAmounts[ResultType.FOUR_KIND] = 250;
        payoutAmounts[ResultType.FIVE_KIND] = 3000;

        COORDINATOR = VRFCoordinatorV2Interface(vrfCoordinator);

        startNewRaffleRound();
    }


    //SETTER FUNCTIONS

        function setPayouts(uint256[] calldata payouts) external onlyOwner {
            require(payouts.length == 7, "enter for all results");
            payoutAmounts[ResultType.NONE] = payouts[0];
            payoutAmounts[ResultType.PAIR] = payouts[1];
            payoutAmounts[ResultType.TWO_PAIR] = payouts[2];
            payoutAmounts[ResultType.THREE_KIND] = payouts[3];
            payoutAmounts[ResultType.FULL_HOUSE] = payouts[4];
            payoutAmounts[ResultType.FOUR_KIND] = payouts[5];
            payoutAmounts[ResultType.FIVE_KIND] = payouts[6];
        }

        function getPayout(uint64 result) external pure returns (uint256 resultType) {
            uint8[] memory counts = new uint8[](5);

            uint256 monster1 = (result / 10000) % 5;
            uint256 monster2 = (result / 1000) % 5;
            uint256 monster3 = (result / 100) % 5;
            uint256 monster4 = (result / 10) % 5;
            uint256 monster5 = result % 5;

            counts[monster1]++;
            counts[monster2]++;
            counts[monster3]++;
            counts[monster4]++;
            counts[monster5]++;

            resultType = getResultType(counts);
        }

        function setRaffleDuration(uint256 _raffleDuration) external onlyOwner {
            raffleDuration = _raffleDuration;

            //emit SetRaffleDuration(_raffleDuration);
        }

        function setTickerPerAmount(uint256 _amount) external onlyOwner {
            ticketPerAmount = _amount;
        }

    ///-------- SETTER FUNCTIONS

    // OPERATIONAL

        function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords
        ) internal override {
            if(requestToPlay[requestId]){ //BETTING
                fulfillBet(randomWords[0], requestData[requestId]);
            }
            else{ //RAFFLE
                fulfillRaffleRound(randomWords);
            }
        }

        function convertRandomToResult(uint256 random)
            internal
            pure
            returns (uint32 result, uint8 resultType)
        {
            uint8[] memory counts = new uint8[](5);

            uint256 monster1 = (random / 10000) % 5;
            uint256 monster2 = (random / 1000) % 5;
            uint256 monster3 = (random / 100) % 5;
            uint256 monster4 = (random / 10) % 5;
            uint256 monster5 = random % 5;

            counts[monster1]++;
            counts[monster2]++;
            counts[monster3]++;
            counts[monster4]++;
            counts[monster5]++;

            result = uint32(
                monster1 *
                    10000 +
                    monster2 *
                    1000 +
                    monster3 *
                    100 +
                    monster4 *
                    10 +
                    monster5
            );

            resultType = getResultType(counts);
        }

        function getResultType(uint8[] memory counts)
            internal
            pure
            returns (uint8 resultType)
        {
            bool haveThree;
            bool havePair;
            for (uint256 i = 0; i < 5; i++) {
                if (counts[i] == 5) {
                    resultType = 6;
                    break;
                } else if (counts[i] == 4) {
                    resultType = 5;
                    break;
                } else if (counts[i] == 3) {
                    haveThree = true;
                    if (havePair) {
                        resultType = 4;
                        break;
                    }
                } else if (counts[i] == 2) {
                    if (havePair) {
                        resultType = 2;
                        break;
                    } else if (haveThree) {
                        resultType = 4;
                        break;
                    }
                    havePair = true;
                }
            }
            if (resultType == 0 && haveThree) resultType = 3;
            else if (resultType == 0 && havePair) resultType = 1;
        }

        function _safeTransfer(address to, uint256 value) internal {
            (bool success, ) = to.call{value: value}("");
            require(success, "TransferHelper: TRANSFER_FAILED");
        }

        function _transferAmount(address _to, uint256 _amount) internal {
            require(_to != address(0), "cant send to address 0");
            (bool success, ) = _to.call{value: _amount}("");
            require(success, "TransferHelper: TRANSFER_FAILED");
        }

        function injectBalance() external payable {}

    // -------- OPERATIONAL

    //BETTING

        function play(uint8 numDraw) external payable nonReentrant {
            uint256 ticketAmount = 1 + msg.value / ticketPerAmount;
            _addUserTicket(msg.sender, ticketAmount);

            numUserBets[msg.sender] += numDraw;

            safeBalance += msg.value * safeRate / 1000;
            treasury += msg.value * treasuryRate / 1000;
            raffleRounds[currentRaffleRound].balance += uint64(msg.value * raffleRate / 1000);

            uint256 betAmount = msg.value / uint256(numDraw);

            uint256 requestId = COORDINATOR.requestRandomWords(
                keyHash,
                s_subscriptionId,
                requestConfirmations,
                callbackGasLimit,
                numWords
            );

            requestToPlay[requestId] = true;
            requestData[requestId] = RequestData(
                msg.sender,
                numDraw,
                uint64(betAmount)
            );
        }

        function fulfillBet(uint256 rnd, RequestData memory req) internal {
            uint256 epoch = userEpoch[req.user];
            userBets[req.user][epoch].numBets = uint8(req.numDraw);

            //loop through each drawing
            for (uint256 i = 0; i < req.numDraw; i++) {
                //expand chainlink VRF to get multiple random numbers for each draw
                uint256 randomNumber = uint256(keccak256(abi.encode(rnd, i)));

                //get the drawing result using the unique chainlink VRF
                (uint32 result, uint8 resultType) = convertRandomToResult(
                    randomNumber
                );

                Bet storage bet = userBets[req.user][epoch + i];
                bet.epoch = uint64(epoch + i);
                bet.betAmount = uint64(req.betAmount);
                bet.result = result;
                bet.resultType = resultType;
            }

            userEpoch[req.user] += req.numDraw;
        }

        function claimableBet(address user, uint256 epoch)
            public
            view
            returns (bool)
        {
            Bet memory bet = userBets[user][epoch];
            return
                !bet.claimed && payoutAmounts[ResultType(bet.resultType)] > 0;
        }

        function claimBet(uint256[] calldata epochs) external nonReentrant {
            uint256 reward;

            for (uint256 i = 0; i < epochs.length; i++) {
                Bet storage bet = userBets[msg.sender][epochs[i]];
                require(claimableBet(msg.sender, epochs[i]), "not claimable");
                bet.claimed = true;
                uint256 amount = bet.betAmount *
                    payoutAmounts[ResultType(bet.resultType)] / 100;
                reward += amount;

                //emit Claim(msg.sender, epochs[i], bet.betAmount, amount);
            }

            if (reward > 0) _transferAmount(msg.sender, reward);
        }

        function getUserBets(
            address user,
            uint256 cursor,
            uint256 size
        )
            external
            view
            returns (
                Bet[] memory,
                uint256
            )
        {
            uint256 length = size;

            if (length > numUserBets[user] - cursor) {
                length = numUserBets[user] - cursor;
            }

            Bet[] memory bets = new Bet[](length);

            for (uint256 i = 0; i < length; i++) {
                bets[i] = userBets[user][cursor + i];
            }

            return (bets, cursor + length);
        }

        function getMintableBets(
            address user
        )
            external
            view
            returns (
                uint256[] memory
            )
        {
            uint256[] memory rounds = new uint[](numUserBets[user]);
            uint256 index;

            for (uint256 i = 0; i < numUserBets[user]; i++) {
                if(!userBets[user][i].minted)
                   rounds[index++] = i;
            }

            uint256[] memory mintableRounds = new uint[](index);

            for (uint256 i = 0; i < index; i++) {
                mintableRounds[i] = rounds[i];
            }

            return mintableRounds;
        }

    // ------- BETTING

    //RAFFLE

        function executeRaffleRound() external nonReentrant {
            RaffleRound storage round = raffleRounds[currentRaffleRound];
            require(
                block.timestamp >= round.startTimestamp + raffleDuration,
                "raffle cant be completed yet."
            );
            require(!round.executed, "already executed");
            round.executed = true;

            startNewRaffleRound();

            COORDINATOR.requestRandomWords(
                keyHash,
                s_subscriptionId,
                requestConfirmations,
                callbackGasLimit,
                numWords
            );
        }

        function startNewRaffleRound() internal {
            currentRaffleRound++;
            raffleRounds[currentRaffleRound].startTimestamp = block.timestamp;
        }

        function fulfillRaffleRound(uint256[] memory randomWords) internal {
            RaffleRound storage round = raffleRounds[currentRaffleRound - 1];
            RaffleRound storage newRound = raffleRounds[currentRaffleRound];
            (uint256 result, ) = convertRandomToResult(randomWords[0]);

            //for testing the winner NFT on admin account, removed for production
            // _mint(0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266, result, 1, "");

            round.randomNFT = randomWords[0];
            round.randomWinner = randomWords[1];
            round.winnerNFT = uint64(result);

            round.fulfilled = true;

            newRound.balance += nftRewardBalanceLeft;

            if (totalSupply(result) == 0) {
                newRound.balance += (round.balance / 2);
            } else {
                round.nftBalance += (round.balance / 2);
                nftRewardBalanceLeft = round.nftBalance;
                round.rewardPerNft = round.nftBalance / uint64(totalSupply(result));
            }

            if (round.entrants.length > 0) {
                uint256 _winnerIndex = randomWords[1] % round.entrants.length;
                round.winnerIndex = uint64(_winnerIndex);
                round.winner = round.entrants[_winnerIndex];
            } else {
                newRound.balance += round.balance - (round.balance / 2);
            }
        }

        function claimRaffle(uint256 roundNo) external nonReentrant {
            RaffleRound storage round = raffleRounds[roundNo];
            require(round.winner == msg.sender, "not winner");
            require(!round.raffleClaimed, "already claimed");
            round.raffleClaimed = true;
            uint256 amount = round.balance / 2;
            _safeTransfer(address(msg.sender), amount);
        }

        function claimableNFTRaffle(address user) public view returns (bool) {
            if(userNFTRaffleClaimed[user][currentRaffleRound - 1]) 
                return false;
            uint256 winnerId = raffleRounds[currentRaffleRound - 1].winnerNFT;
            uint256 amount = balanceOf(user, winnerId);
            if (_userMintLatestRound[user] == currentRaffleRound) {
                uint256 newMintsAfterRaffle = _userWinnerNFTAfterRound[user];
                amount -= newMintsAfterRaffle;
            }
            return amount > 0;
        }

        function claimNFTRaffle() external nonReentrant {
            require(!userNFTRaffleClaimed[msg.sender][currentRaffleRound - 1], "already claimed");
            RaffleRound storage round = raffleRounds[currentRaffleRound - 1];
            uint256 winnerId = round.winnerNFT;
            uint256 nftAmount = balanceOf(msg.sender, winnerId);
            require(nftAmount > 0, "you dont have winner nft");
            if (_userMintLatestRound[msg.sender] == currentRaffleRound) {
                uint256 newMintsAfterRaffle = _userWinnerNFTAfterRound[msg.sender];
                nftAmount -= newMintsAfterRaffle;
                require(nftAmount > 0, "nft received after raffle");
            }
            userNFTRaffleClaimed[msg.sender][currentRaffleRound - 1] = true;
            uint256 reward = nftAmount * round.rewardPerNft;
            nftRewardBalanceLeft -= uint64(reward);
            if (reward > 0) _transferAmount(msg.sender, reward);
        }

        function _addUserTicket(address _userAddress, uint256 ticketAmount) internal {
            //dont implement actions if ticketAmount is 0
            //dont revert as it might prevent betting or other actions on other contracts
            if (ticketAmount > 0) {
                RaffleRound storage round = raffleRounds[currentRaffleRound];
                userRaffleTickets[_userAddress][currentRaffleRound] += ticketAmount;

                for (uint256 i = 0; i < ticketAmount; i++) {
                    round.entrants.push(_userAddress);
                }

                //emit AddTicket(_userAddress, ticketAmount, currentRound);
            }
        }


    //------- RAFFLE

    // NFT

        function mintBet(uint256[] calldata epochs) external nonReentrant {
            for (uint256 i = 0; i < epochs.length; i++) {
                require(epochs[i] < numUserBets[msg.sender], "no bet on this id");
                Bet storage bet = userBets[msg.sender][epochs[i]];
                require(!bet.minted, "already minted");
                bet.minted = true;
                _mint(msg.sender, bet.result, 1, "");
            }
        }

        function _beforeTokenTransfer(
            address operator,
            address from,
            address to,
            uint256[] memory ids,
            uint256[] memory amounts,
            bytes memory data
        ) internal virtual override {
            super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
            uint256 winnerNFTId = raffleRounds[currentRaffleRound - 1].winnerNFT;
            for (uint256 i = 0; i < ids.length; ++i) {
                if (winnerNFTId == ids[i]) {
                    if (to != address(0)) {
                        if (_userMintLatestRound[to] != currentRaffleRound) {
                            _userMintLatestRound[to] = currentRaffleRound;
                            _userWinnerNFTAfterRound[to] = 0;
                        }
                        _userWinnerNFTAfterRound[to]++;
                    }
                }
            }
        }
        
    // ------ NFT
}
