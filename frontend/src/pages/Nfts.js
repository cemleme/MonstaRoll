import { useContext, useEffect, useState } from "react";
import ConnectContext from "../hooks/ConnectContext";
import useMoralis from "../hooks/useMoralis";
import "../components/NftCard.css";
import NftCard from "../components/NftCard";

const Nfts = () => {
  const { address } = useContext(ConnectContext);
  const [nfts, setNfts] = useState([]);
  const { getUserNFTs } = useMoralis();

  const paddedId = (token_id) => {
    return token_id.toString().padStart(5, "0");
  };

  useEffect(() => {
    const loadData = async () => {
      if (!address) return;
      const data = await getUserNFTs();
      setNfts(data);
    };

    loadData();
  }, [address]);

  return (
    <div className="gridContainer">
      {nfts.map((nft) => (
        <NftCard key={nft.token_id} nft={nft} showDetails={true} />
      ))}
    </div>
  );
};

export default Nfts;
