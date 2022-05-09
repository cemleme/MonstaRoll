import { useEffect, useContext } from "react";
import './Header.css';
import ConnectContext from "../hooks/ConnectContext";

const Header = () => {
  const { address, disconnect, connect } = useContext(ConnectContext);

  useEffect(() => {
    if (!address) return;
  }, [address]);

  return (
    <div className="topnav">
      <a className="active" href="#home">
        MonstaRoll
      </a>
      <a href="#news">Bet</a>
      <a href="#contact">NFTs</a>
      <a href="#contact">Raffle</a>
      <div className="topRight">
        {address && <button onClick={disconnect}>Disconnect {address.substring(0,4) + '...' + address.slice(-4)}</button>}
        {!address && <button onClick={connect}>Connect</button>}
      </div>
    </div>
  );
};

export default Header;
