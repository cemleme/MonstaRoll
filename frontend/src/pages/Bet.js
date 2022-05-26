import BetResult from "../components/BetResult";
import BetTable from "../components/BetTable";
import IconButton from "../components/IconButton";
import Monsters from "../components/Monsters";
import NewBet from "../components/NewBet";
import BetHistory from "../components/BetHistory";
import ConnectContext from "../hooks/ConnectContext";
import Lottie from "react-lottie";
import * as animationData from "../assets/loading.json";

import {
  faCaretUp,
  faCaretDown,
  faSquarePlus,
  faEye,
  faHammer,
  faCoins,
} from "@fortawesome/free-solid-svg-icons";

import { useContext, useEffect, useState } from "react";
import "animate.css";
import useContract from "../hooks/useContract";

const types = {
  0: "NONE",
  1: "ONE PAIR",
  2: "TWO PAIRS",
  3: "THREE OF A KIND",
  4: "FULL HOUSE",
  5: "FOUR OF A KIND",
  6: "FIVE OF A KIND",
};

const payouts = {
  0: 0,
  1: 10,
  2: 50,
  3: 125,
  4: 200,
  5: 250,
  6: 3000,
};

const mockBets = [
  {
    round: 0,
    result: "10312",
    resultType: "1",
    minted: false,
    betAmount: 1,
    claimed: false,
  },
  {
    round: 1,
    result: "44444",
    resultType: "6",
    minted: false,
    betAmount: 1,
    claimed: false,
  },
  {
    round: 2,
    result: "23312",
    resultType: "2",
    minted: false,
    betAmount: 1,
    claimed: true,
  },
  {
    round: 3,
    result: "1000",
    resultType: "5",
    minted: true,
    betAmount: 1,
    claimed: false,
  },
  {
    round: 4,
    result: "1234",
    resultType: "0",
    minted: false,
    betAmount: 1,
    claimed: false,
  },
];

const useMock = false;

const Bet = () => {
  const { address } = useContext(ConnectContext);
  const { getUserBets, getBet, mint, claimBet } = useContract();
  const [round, setRound] = useState(0);
  const [isBetting, setIsBetting] = useState(false);
  const [currentBet, setCurrentBet] = useState(null);
  const [newBet, setNewBet] = useState(true);
  const [allResults, setAllResults] = useState(false);
  const [allRounds, setAllRounds] = useState([]);
  const [claimableRounds, setClaimableRounds] = useState([]);
  const [mintableRounds, setMintableRounds] = useState([]);

  const processRounds = (data) => {
    const bets = [];
    const mintable = [];
    const claimable = [];
    for (let i = 0; i < data.length; i++) {
      const betData = data[i];
      const bet = {
        betAmount: betData.betAmount / 10 ** 18,
        epoch: betData.epoch,
        rewardAmount: betData.rewardAmount / 10 ** 18,
        result: betData.result.toString().padStart(5, "0"),
        resultType: betData.resultType,
        claimed: betData.claimed,
        minted: betData.minted,
        numBets: betData.numBets,
        resultName: types[betData.resultType],
        wonAmount:
          (betData.betAmount * payouts[betData.resultType]) / (100 * 10 ** 18),
      };

      bets.push(bet);
      if (!bet.minted) mintable.push(i);
      if (!bet.claimed && bet.wonAmount > 0) claimable.push(i);
    }
    setClaimableRounds(claimable);
    setMintableRounds(mintable);

    return bets;
  };

  useEffect(() => {
    let interval;

    if (isBetting) {
      interval = setInterval(async () => {
        const userBets = await getUserBets();
        const betsArr = userBets[0];
        if (betsArr.length !== allRounds.length) {
          setAllRounds(processRounds(betsArr));
          setIsBetting(false);
          setAllResults(false);
          setNewBet(false);
          setRound(betsArr.length - 1);
        }
      }, 2000);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isBetting]);

  useEffect(() => {
    if (useMock) {
      setAllRounds(processRounds(mockBets));
      return;
    } else {
      if (!address) return;
      const loadData = async () => {
        const userBets = await getUserBets();
        const betsArr = userBets[0];
        setAllRounds(processRounds(betsArr));

        setRound(betsArr.length);
      };
      loadData();
    }
  }, [address]);

  useEffect(() => {
    if (round >= allRounds.length) return;
    setCurrentBet(allRounds[round]);
  }, [round, allRounds]);

  // useEffect(() => {
  //   if (allRounds.length < 1) return;
  //   const roundNo = allRounds.length;
  //   setRound(roundNo);
  // }, [allRounds]);

  const handleButtonUp = () => {
    setAllResults(false);
    if (round >= allRounds.length - 1) return;
    setRound((round) => round + 1);
  };

  const handleButtonDown = () => {
    setAllResults(false);
    if (newBet) setNewBet(false);
    if (round == 0) return;
    setRound((round) => round - 1);
  };

  const handleNewBet = () => {
    setAllResults(false);
    setNewBet(true);
    setRound(allRounds.length);
    setCurrentBet(null);
  };

  const handleAllResults = () => {
    setAllResults(true);
    setNewBet(false);
    setRound(allRounds.length);
    setCurrentBet(null);
  };

  const handleMint = async (rounds) => {
    await mint(rounds);
    if (currentBet) {
      setCurrentBet((bet) => ({ ...bet, minted: true }));
    }
    const allRoundsCp = allRounds;
    let mintableCp = mintableRounds;
    for (let i = 0; i < rounds.length; i++) {
      allRoundsCp.find((r) => r.epoch === rounds[i].toString()).minted = true;
      mintableCp = mintableCp.filter((item) => item !== rounds[i]);
    }
    setAllRounds(allRoundsCp);
    setMintableRounds(mintableCp);
  };

  const handleClaim = async (rounds) => {
    await claimBet(rounds);
    if (currentBet) {
      setCurrentBet((bet) => ({ ...bet, claimed: true }));
    }
    const allRoundsCp = allRounds;
    let claimableCp = claimableRounds;
    for (let i = 0; i < rounds.length; i++) {
      allRoundsCp.find((r) => r.epoch === rounds[i].toString()).claimed = true;
      claimableCp = claimableCp.filter((item) => item !== rounds[i]);
    }
    setAllRounds(allRoundsCp);
    setClaimableRounds(claimableCp);
  };

  return (
    <div
      style={{
        display: "flex",
        gap: "10px",
        padding: "20px",
        justifyContent: "space-between",
      }}
    >
      <BetTable currentResult={currentBet?.resultType || -1} />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        {isBetting && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div>Betting & waiting for VRF...</div>{" "}
            <Lottie
              options={{
                loop: true,
                autoplay: true,
                animationData: animationData,
                rendererSettings: {
                  preserveAspectRatio: "xMidYMid slice",
                },
              }}
              height={300}
              width={300}
            />
          </div>
        )}
        {!isBetting && newBet && <NewBet setIsBetting={setIsBetting} />}
        {allResults && allRounds.length > 0 && (
          <BetHistory
            rounds={allRounds}
            mintableRounds={mintableRounds}
            claimableRounds={claimableRounds}
            handleClaim={handleClaim}
            handleMint={handleMint}
          />
        )}
        {!newBet && !allResults && currentBet && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "30px",
            }}
          >
            <BetResult bet={currentBet} />
            <Monsters
              key={round}
              roundResult={currentBet.result}
              size={6}
              animate={true}
            />
          </div>
        )}
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        <IconButton
          icon={faSquarePlus}
          text=" NEW BET"
          handler={handleNewBet}
        />
        <IconButton
          icon={faCaretUp}
          handler={handleButtonUp}
          isDisabled={round >= allRounds.length - 1}
        />
        <IconButton
          icon={faCaretDown}
          handler={handleButtonDown}
          isDisabled={round === 0}
        />
        <IconButton
          icon={faCoins}
          text="CLAIM"
          handler={() => handleClaim([currentBet.epoch])}
          isDisabled={
            !currentBet || currentBet.claimed || currentBet.resultType === "0"
          }
        />
        <IconButton
          icon={faHammer}
          text="MINT"
          handler={() => handleMint([currentBet.epoch])}
          isDisabled={!currentBet || currentBet.minted}
        />
        <IconButton
          icon={faEye}
          text="ALL"
          handler={handleAllResults}
          isDisabled={allResults}
        />
      </div>
    </div>
  );
};

export default Bet;
