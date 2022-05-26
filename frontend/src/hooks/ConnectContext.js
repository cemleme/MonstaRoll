import { useState, createContext, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Web3 from "web3";
import config from "../constants/config";
import { setNetwork } from "../reducers/networkSlice";

const ConnectContext = createContext();

export function ConnectProvider({ children }) {
  const dispatch = useDispatch();
  const [address, setAddress] = useState(null);
  const [wallet, setWallet] = useState(null);
  const network = useSelector((state) => state.network.value);

  useEffect(() => {
    if (config[network]) tryReconnect();
    else {
      if (localStorage["network"]) {
        const network = localStorage["network"];
        dispatch(setNetwork(network));
      }
    }
  }, [network]);

  const tryReconnect = () => {
    if (window.ethereum && window.ethereum.isMetaMask) connect();
  };

  const connect = async () => {
    let address;
    let web3;

    if (window.ethereum) {
      // await window.ethereum.request({
      //   method: "wallet_requestPermissions",
      //   params: [
      //     {
      //       eth_accounts: {},
      //     },
      //   ],
      // });

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: config[network].targetChainId }],
        });
      } catch (switchError) {
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: config[network].targetChainId,
                  rpcUrls: [config[network].rpc],
                  chainName: config[network].targetChainName,
                },
              ],
            });
          } catch (addError) {}
        }
      }
      web3 = new Web3(window.ethereum);
      address = accounts[0];
      setAddress(address);
      setWallet(web3);
    }
  };

  const disconnect = () => {
    localStorage["network"] = null;
    dispatch(setNetwork(null));
    setAddress(null);
    setWallet(null);
  };

  return (
    <ConnectContext.Provider value={{ address, wallet, connect, disconnect }}>
      {children}
    </ConnectContext.Provider>
  );
}

export default ConnectContext;
