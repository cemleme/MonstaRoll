import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";
import Form from "react-bootstrap/Form";
import "./NewBet.css";
import { useState, useContext } from "react";
import useConnect from "../hooks/ConnectContext";
import useContract from "../hooks/useContract";
import { useSelector } from "react-redux";
import ConnectContext from "../hooks/ConnectContext";

const NewBet = () => {
  const { address, wallet, connect } = useContext(ConnectContext);
  const { bet } = useContract();
  const [numBets, setNumBets] = useState(1);
  const [totalBet, setTotalBet] = useState(1);

  const betChangeHandler = (event) => {
    setTotalBet(parseFloat(event.target.value));
  };

  const submitBetHandler = async () => {
    const result = await bet(numBets, totalBet);
  }

  return (
    <div className="newBetContainer">
      <Form.Label>Total Bet Amount</Form.Label>
      <FormControl
        placeholder="(in BNB)"
        aria-label="(in BNB)"
        aria-describedby="basic-addon1"
        onChange={betChangeHandler}
      />
      <div className="informationText">Chainlink VRF Cost: 0.01 BNB</div>
      <hr />

      <Form.Label>Number of Bets: {numBets}</Form.Label>
      <div className="slidecontainer">
        <input
          type="range"
          min="1"
          max="10"
          defaultValue="1"
          step="1"
          className="slider"
          id="myRange"
          onChange={(e) => setNumBets(e.target.value)}
        />
      </div>
      <hr />
      { address &&
      <button className="betButton" type="button" onClick={submitBetHandler}>
        Bet for {numBets} rounds. Bet per Round: {((totalBet - 0.01) / numBets).toFixed(2)} BNB
      </button>}
      { !address &&
      <button className="betButton" type="button"  onClick={connect}>
        You need to connect your wallet
      </button>}
    </div>
  );
};

export default NewBet;
