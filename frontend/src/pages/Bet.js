import BetResult from "../components/BetResult";
import BetTable from "../components/BetTable";
import IconButton from "../components/IconButton";
import Monsters from "../components/Monsters";
import NewBet from "../components/NewBet";
import BetHistory from "../components/BetHistory";
import ConnectContext from "../hooks/ConnectContext";

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

const useMock = true;

const Bet = () => {
  const { address } = useContext(ConnectContext);
  const { getUserBets, getBet, mint, claimBet } = useContract();
  const [round, setRound] = useState(0);
  const [currentBet, setCurrentBet] = useState(null);
  const [newBet, setNewBet] = useState(false);
  const [allResults, setAllResults] = useState(false);
  const [allRounds, setAllRounds] = useState([]);
  const [claimableRounds, setClaimableRounds] = useState([]);
  const [mintableRounds, setMintableRounds] = useState([]);

  const processRounds = (data) => {
    const mintable = [];
    const claimable = [];
    for (let i = 0; i < data.length; i++) {
      const bet = data[i];
      bet.resultName = types[bet.resultType];
      bet.wonAmount = (bet.betAmount * payouts[bet.resultType]) / 100;
      bet.result = bet.result.toString().padStart(5, "0");

      if (!bet.minted) mintable.push(i);
      if (!bet.claimed && bet.wonAmount > 0) claimable.push(i);
    }
    setClaimableRounds(claimable);
    setMintableRounds(mintable);
    return data;
  };

  useEffect(() => {
    if (useMock) {
      setAllRounds(processRounds(mockBets));
      return;
    } else {
      if (!address) return;
      const loadData = async () => {
        const userBets = await getUserBets();
        setAllRounds(processRounds(userBets[0]));
      };
      loadData();
    }
  }, [address]);

  useEffect(() => {
    if (round >= allRounds.length) return;
    setCurrentBet(allRounds[round]);
  }, [round]);

  useEffect(() => {
    const roundNo = allRounds.length > 0 ? allRounds.length - 1 : 0;
    setRound(roundNo);
  }, [allRounds]);

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

  const handleMint = (rounds) => {
    mint(rounds);
  };

  const handleClaim = (rounds) => {
    claimBet(rounds);
  };

  return (
    <div
      style={{
        display: "flex",
        gap: "10px",
        padding: "30px",
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
        {newBet && <NewBet />}
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
          handler={() => handleClaim([currentBet.round])}
          isDisabled={
            !currentBet || currentBet.claimed || currentBet.resultType === "0"
          }
        />
        <IconButton
          icon={faHammer}
          text="MINT"
          handler={() => handleMint([currentBet.round])}
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
