import { useEffect, useContext, useState } from "react";
import "./Header.css";
import ConnectContext from "../hooks/ConnectContext";
import { Link, useMatch, useNavigate, useResolvedPath } from "react-router-dom";
import useContract from "../hooks/useContract";
import { useSelector } from "react-redux";
import config from "../constants/config";

function CustomLink({ children, to, ...props }) {
  let resolved = useResolvedPath(to);
  let match = useMatch({ path: resolved.pathname, end: true });

  return (
    <div>
      <Link className={match ? "active" : " "} to={to} {...props}>
        {children}
      </Link>
    </div>
  );
}

const Header = () => {
  const { address, disconnect } = useContext(ConnectContext);
  const { getCurrentRaffleBalance } = useContract();
  const [balance, setBalance] = useState(0);
  const network = useSelector((state) => state.network.value);
  const navigate = useNavigate();

  const handleDisconnect = () => {
    disconnect();
    navigate("/");
  }

  useEffect(() => {
    const loadBalance = async () => {
      if (!network || !config[network]) return;
      const _balance = await getCurrentRaffleBalance();
      setBalance(_balance);
    };
    loadBalance();
  }, [network]);

  return (
    <div className="topnav">
      <div className="left-links">
        <CustomLink to="/">MonstaRoll</CustomLink>
        {config[network] && (
          <>
            <CustomLink to="/bets">Bets</CustomLink>
            <CustomLink to="/nfts">Your NFTs</CustomLink>
            <CustomLink to="/market">NFT Market</CustomLink>
            <CustomLink to="/raffle">
              Raffle{" "}
              {parseFloat(balance) > 0 &&
                `(${balance} ${config[network].currency})`}
            </CustomLink>
          </>
        )}
      </div>
      <div className="right-links">
        <div>
          {config[network] && (
            <div>
              {network}
              <br /> Testnet
            </div>
          )}
        </div>
        {address && (
          <button onClick={handleDisconnect}>
            Disconnect {address.substring(0, 4) + "..." + address.slice(-4)}
          </button>
        )}
      </div>
    </div>
  );
};

export default Header;
