import { useContext } from "react";
import { useSelector } from "react-redux";
import contracts from "../constants/contracts";
import ConnectContext from "./ConnectContext";

const moralis_networks = {
  BSC: "bsc%20testnet",
  POLYGON: "mumbai",
  AVALANCHE: "avalanche%20testnet",
};

const moralis_network_api = {
  BSC: "BSC",
  POLYGON: "Polygon",
  AVALANCHE: "Avalanche",
};

const useMoralis = () => {
  const network = useSelector((state) => state.network.value);
  const { address } = useContext(ConnectContext);
  const getUserNFTs = async () => {
    const contract = contracts[network];
    const moralis_network = moralis_networks[network];
    const data = await fetch(
      `https://deep-index.moralis.io/api/v2/${address}/nft/${contract}?chain=${moralis_network}&format=decimal`,
      {
        headers: {
          Accept: "application/json",
          "X-Api-Key":
            "xpVptprzi9BqJXBF2yp9JlwANxraHxzuto1bOqVX36vScckDkrzlbmhPboFMSB4i",
        },
      }
    );

    const nfts = await data.json();
    return nfts.result;
  };

  const getNFTAmount = async (id) => {
    const nfts = await getUserNFTs();
    const result = nfts.find((n) => n.token_id === id.toString());
    return result ? result.amount : 0;
  };

  const getNFTsOnSale = async () => {
    try {
      const networkId = moralis_network_api[network];
      const data = await fetch(
        `https://olu9e79wzpp7.usemoralis.com:2053/server/functions/getSales?network=${networkId}&user=${address}`
      );

      const nfts = await data.json();
      return nfts.result;
    } catch {
      return null;
    }
  };

  const getSaleId = async (tokenId) => {
    try {
      const networkId = moralis_network_api[network];
      const data = await fetch( 
        `https://olu9e79wzpp7.usemoralis.com:2053/server/functions/getTokenId?network=${networkId}&tokenId=${tokenId}`
      );

      const dataJson = await data.json();
      if(dataJson.result && dataJson.result[0])
        return dataJson.result[0].saleId;
      return null;
    } catch {
      return null;
    }
  };

  return { getUserNFTs, getNFTAmount, getNFTsOnSale, getSaleId };
};

export default useMoralis;
