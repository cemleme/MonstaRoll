import { useEffect, useState } from "react";
import ListGroup from "react-bootstrap/ListGroup";
import { useSelector } from "react-redux";
import "./Market.css";
import config from "../constants/config";
import useContract from "../hooks/useContract";
import useMoralis from "../hooks/useMoralis";
import Web3 from "web3";

const Market = () => {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("");
  const network = useSelector((state) => state.network.value);
  const { buyNFT } = useContract();
  const { getNFTsOnSale } = useMoralis();

  useEffect(() => {
    const loadData = async () => {
      const nfts = await getNFTsOnSale();
      setItems(nfts);
    };
    loadData();
  });

  const handleBuy = async (item) => {
    const result = await buyNFT(item.saleId, item.price);
    console.log(result);
  };

  return (
    <div className="marketContainer">
      <input
        className="itemFilter"
        placeholder="Filter NFT id"
        type="text"
        onChange={(e) => setFilter(e.target.value)}
      />
      <ListGroup variant="flush" className="itemsGroup">
        {items &&
          items
            .filter((item) => item.tokenId.includes(filter))
            .map((item) => (
              <ListGroup.Item key={item.saleId}>
                <div className="saleItem">
                  <div>
                    #{item.tokenId} for {Web3.utils.fromWei(item.price)}{" "}
                    {config[network].currency}
                  </div>
                  <button onClick={() => handleBuy(item)}>Buy</button>
                </div>
              </ListGroup.Item>
            ))}
      </ListGroup>
    </div>
  );
};

export default Market;
