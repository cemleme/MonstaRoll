import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import config from "../constants/config";
import useContract from "../hooks/useContract";

const BetResult = ({ bet }) => {
  const { getNFTBalance } = useContract();
  const [balance, setBalance] = useState();
  const network = useSelector((state) => state.network.value);

  useEffect(() => {
    setBalance();
    const loadBalance = async () => {
      const _balance = await getNFTBalance(bet.result);
      setBalance(_balance);
    };
    loadBalance();
  }, [bet]);

  return (
    <div
      style={{
        width: "100%",
      }}
    >
      <div
        style={{
          width: "100%",
          display: "flex",
          gap: "10px",
          justifyContent: "space-between",
        }}
      >
        <div>Bet: {bet.epoch}</div>
        <div>Bet Amount: {bet.betAmount.toFixed(3)} {config[network].currency}</div>
        <div>Amount Won: {bet.wonAmount.toFixed(3)} {config[network].currency}</div>
      </div>

      <div
        style={{
          width: "100%",
          display: "flex",
          gap: "10px",
          justifyContent: "space-between",
        }}
      >
        <div>#{bet.result}</div>
        <div>{bet.resultName}</div>
        <div>NFT Balance: {balance}</div>
      </div>
    </div>
  );
};

export default BetResult;
