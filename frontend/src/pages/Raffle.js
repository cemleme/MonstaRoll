import { useContext, useEffect, useState } from "react";
import useContract from "../hooks/useContract";
import "./Raffle.css";
import NftCard from "../components/NftCard";
import ConnectContext from "../hooks/ConnectContext";
import useMoralis from "../hooks/useMoralis";
import { useSelector } from "react-redux";
import config from "../constants/config";
import Lottie from "react-lottie";
import * as animationData from "../assets/loading.json";

const Raffle = () => {
  const { address } = useContext(ConnectContext);
  const { getNFTAmount } = useMoralis();
  const {
    getTotalRaffleTickets,
    getUserRaffleTickets,
    getRaffleResult,
    executeRaffleRound,
    getCurrentRaffleRoundNo,
    claimNFTRaffle,
    claimRaffle,
    checkIfClaimableNFTRaffle,
  } = useContract();
  const [currentRound, setCurrentRound] = useState();
  const [previousRound, setPreviousRound] = useState();
  const [roundNo, setRoundNo] = useState();
  const [balanceOfNFT, setBalanceOfNFT] = useState(0);
  const [claimableNFT, setClaimableNFT] = useState(false);
  const [userTickets, setUserTickets] = useState(0);
  const [totalTickets, setTotalTickets] = useState(0);
  const [executing, setExecuting] = useState(false);
  const network = useSelector((state) => state.network.value);

  const shortUserAddress = (address) => {
    const addr = address.substring(0, 4) + "..." + address.slice(-4);
    return addr;
  };

  function secondsToDhms(seconds) {
    seconds = Number(seconds);
    var d = Math.floor(seconds / (3600 * 24));
    var h = Math.floor((seconds % (3600 * 24)) / 3600);
    var m = Math.floor((seconds % 3600) / 60);
    var s = Math.floor(seconds % 60);

    var dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
    var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
    var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
    var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
    return dDisplay + hDisplay + mDisplay + sDisplay;
  }

  const handleExecuteRaffle = async () => {
    setExecuting(true);
    const result = await executeRaffleRound();
    setRoundNo((r) => parseInt(r) + 1);
  };

  const handleClaimRaffle = async () => {
    await claimRaffle(roundNo - 1);
  };

  const handleClaimNFT = async () => {
    await claimNFTRaffle();
  };

  useEffect(() => {
    let interval;

    if (executing) {
      const roundNum = roundNo;
      interval = setInterval(async () => {
        const previousRoundData = await getRaffleResult(roundNum);
        console.log("getting data for ", roundNum);
        console.log("round data", previousRoundData);
        if (previousRoundData.fulfilled) {
          setPreviousRound(previousRoundData);
          setExecuting(false);
        }
      }, 2000);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [executing]);

  useEffect(() => {
    const loadRoundNo = async () => {
      if (!config[network]) return;
      const round = await getCurrentRaffleRoundNo();
      setRoundNo(round);
    };

    loadRoundNo();
  }, [network]);

  useEffect(() => {
    const loadData = async () => {
      const [
        currentRound,
        previousRound,
        tickets,
        totalTickets,
        isClaimableNFT,
      ] = await Promise.all([
        getRaffleResult(roundNo),
        getRaffleResult(roundNo - 1),
        getUserRaffleTickets(roundNo),
        getTotalRaffleTickets(),
        checkIfClaimableNFTRaffle(),
      ]);
      setCurrentRound(currentRound);
      setPreviousRound(previousRound);
      setUserTickets(tickets);
      setTotalTickets(totalTickets);
      setClaimableNFT(isClaimableNFT);
    };

    if (roundNo > 0) loadData();
  }, [address, roundNo]);

  useEffect(() => {
    const loadData = async () => {
      if (!address || !previousRound) return;
      const result = await getNFTAmount(previousRound.winnerNFT);
      setBalanceOfNFT(result);
    };

    loadData();
  }, [address, previousRound]);

  return (
    <div className="raffleContainer">
      <div className="raffleCardHorizontal">
        <div className="raffleCard">
          <div>
            Current Round: {roundNo && roundNo}
            <hr />
          </div>
          {currentRound && (
            <>
              <div>
                Reward Pool: {currentRound.balance} {config[network].currency}
              </div>
              {currentRound.timeLeft > 0 && (
                <div>Time left: {secondsToDhms(currentRound.timeLeft)}</div>
              )}
              {address && (
                <div>
                  You have {userTickets} tickets among {totalTickets} tickets.
                </div>
              )}
              {currentRound.timeLeft <= 0 && <>Ready to Execute</>}
              <button
                disabled={!address || currentRound.timeLeft > 0}
                onClick={handleExecuteRaffle}
              >
                Execute Round
              </button>
            </>
          )}
        </div>
        <div className="raffleCard">
          <div>
            Previous Round: {roundNo && roundNo - 1} <hr />
          </div>

          {previousRound && (
            <>
              <div className="raffleCardHorizontal">
                {roundNo > 1 && !previousRound.fulfilled && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <div>executing & waiting for VRF...</div>{" "}
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

                {previousRound.fulfilled && (
                  <>
                    <div className="raffleCardVertical">
                      <h5>Winner NFT Ticket #{previousRound.winnerNFT}</h5>
                      <div className="raffleCardHorizontal">
                        Reward: {previousRound.balance / 2}{" "}
                        {config[network].currency}
                        <div>User Balance: {balanceOfNFT}</div>
                      </div>
                      <button disabled={!claimableNFT} onClick={handleClaimNFT}>
                        Claim
                      </button>
                      <NftCard
                        nft={{ token_id: previousRound.winnerNFT }}
                        showDetails={false}
                      />{" "}
                    </div>
                    <div className="raffleCardVertical">
                      <h5>Raffle Winner</h5>
                      <div className="raffleCardHorizontal">
                        Reward: {previousRound.balance / 2}{" "}
                        {config[network].currency}
                        <div>{shortUserAddress(previousRound.winner)}</div>
                      </div>
                      <button
                        disabled={
                          previousRound.raffleClaimed ||
                          !address ||
                          address.toLowerCase() !==
                            previousRound.winner.toLowerCase()
                        }
                        onClick={handleClaimRaffle}
                      >
                        Claim
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Raffle;
