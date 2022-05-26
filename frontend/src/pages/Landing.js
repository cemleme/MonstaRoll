import "./Landing.css";
import bnbChainImage from "../assets/bnbchain.png";
import polygonImage from "../assets/polygon.png";
import avalancheImage from "../assets/avalanche.png";
import nftExample1 from "../assets/34200.png";
import nftExample2 from "../assets/34423.png";
import { useDispatch } from "react-redux";
import { setNetwork } from "../reducers/networkSlice";
import { useNavigate } from "react-router-dom";
import Monsters from "../components/Monsters";
import { useEffect, useRef, useState } from "react";
import BetTable from "../components/BetTable";

const Landing = () => {
  const monsters = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [random, setRandom] = useState();
  const [showMonsters, setShowMonsters] = useState(true);

  useEffect(() => {
    updateRandomMonsters();
  }, []);

  const getRandom = () => {
    return Math.floor(Math.random() * 5);
  };

  const updateRandomMonsters = () => {
    const m0 = getRandom().toString();
    const m1 = getRandom().toString();
    const m2 = getRandom().toString();
    const m3 = getRandom().toString();
    const m4 = getRandom().toString();
    const result = m0 + m1 + m2 + m3 + m4;
    setRandom(result);
  };

  const handleNetwork = (network) => {
    localStorage['network'] = network;
    dispatch(setNetwork(network));
    navigate("/bets");
  };

  const refreshAnimation = () => {
    const monstersDiv = monsters.current;
    setShowMonsters(false);
    for (let i = 0; i < monstersDiv.children.length; i++) {
      monstersDiv.children[i].classList.remove(
        "animate__animated",
        "animate__bounceInDown"
      );
    }
    updateRandomMonsters();
    setTimeout(() => {
      for (let i = 0; i < monstersDiv.children.length; i++) {
        monstersDiv.children[i].classList.add(
          "animate__animated",
          "animate__bounceInDown"
        );
      }

      setShowMonsters(true);
    }, 100);
  };

  return (
    <div className="landingMainContainer">
      <div className="landingContainer">
        <div className="landingTitle">MonstaRoll</div>
        <div className="landingSubtitle">Powered by Chainlink VRF v2</div>
        <div className="landingButtons">
          <button
            className="landingNetworkButton"
            onClick={() => handleNetwork("BSC")}
          >
            <img width="60" src={bnbChainImage} alt="BNB CHAIN" />
            <div>
              Connect & Play on <br />
              BNB Chain
            </div>
          </button>
          <button
            className="landingNetworkButton"
            onClick={() => handleNetwork("POLYGON")}
          >
            <img width="60" src={polygonImage} alt="BNB CHAIN" />
            <div>
              Connect & Play on <br />
              Polygon
            </div>
          </button>
          <button
            className="landingNetworkButton"
            onClick={() => handleNetwork("AVALANCHE")}
          >
            <img width="60" src={avalancheImage} alt="BNB CHAIN" />
            <div>
              Connect & Play on <br />
              Avalanche
            </div>
          </button>
        </div>
      </div>
      <div className="landingContainer">
        <div className="landingSubtitle">How to Play?</div>
        <div>
          <ul>
            <li>
              Bet and let the monsters roll!{" "}
              <button onClick={refreshAnimation}>Re-Roll</button>
            </li>
            <li>Win a reward by the result</li>
            <li>Mint your free NFT no matter you win or lose</li>
            <li>Get raffle tickets depending on your bet amount</li>
            <li>
              Every raffle round the raffle balance is divided into two:
              <ul>
                <li>Half goes to the single lucky better</li>
                <li>
                  Half is divided among the owners of a randomly picked NFT
                </li>
              </ul>
            </li>
          </ul>
        </div>
        <div style={{ height: "100px" }}>
          {showMonsters && random && (
            <Monsters
              ref={monsters}
              roundResult={random}
              size={6}
              animate={true}
            />
          )}
        </div>
      </div>
      <div className="landingContainer">
        <div className="landingSubtitle">Rewards</div>
        <div>
          <BetTable />
        </div>
      </div>
      <div className="landingContainer">
        <div className="landingSubtitle">NFTs</div>
        <div>Mint a free NFT on your every bet - even if you lose!</div>
        <div style={{ display: "flex", gap: "10px" }}>
          <img src={nftExample1} alt="NFT Example" />
          <img src={nftExample2} alt="NFT Example" />
        </div>
      </div>
      <div className="landingContainer">
        <div className="landingSubtitle">Raffle</div>
        <div>
          Every raffle round rewards 30% of the bets! <br /> Half to NFT owners,
          half to one lucky better!
        </div>
      </div>
    </div>
  );
};

export default Landing;
