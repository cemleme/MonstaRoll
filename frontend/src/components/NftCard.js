import { useEffect, useState } from "react";
import "./NftCard.css";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import FormControl from "react-bootstrap/FormControl";
import useContract from "../hooks/useContract";
import useMoralis from "../hooks/useMoralis";

const NftCard = ({ nft, showDetails }) => {
  const [show, setShow] = useState(false);
  const [price, setPrice] = useState(0);
  const [saleId, setSaleId] = useState();
  const [tempSale, setTempSale] = useState(false);
  const { putNFTOnSale, cancelSale } = useContract();
  const { getSaleId } = useMoralis();

  useEffect(() => {
    const loadData = async () => {
      const saleId = await getSaleId(nft.token_id);
      setSaleId(saleId);
    };
    loadData();
  }, []);

  const ipfsLink = () => {
    return nft.token_uri.replace("ipfs.moralis.io:2053", "ipfs.io"); 
  }

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleCancelSale = async () => {
    await cancelSale(saleId);
    setSaleId(null);
  };
  const handleSaveSale = async () => {
    await putNFTOnSale(nft.token_id, price);
    const saleId = await getSaleId(nft.token_id);
    setSaleId(saleId);
    setShow(false);
    setTempSale(true);
  };

  const paddedId = (token_id) => {
    return token_id.toString().padStart(5, "0");
  };

  return (
    <div className="card" key={nft.token_id}>
      <img
        className="cardAvatar"
        src={`https://ipfs.io/ipfs/bafybeicq27h44ynfjv2dwgy56fjq7w52k34guav2fq5svcx2xk7h3tlrz4/${paddedId(
          nft.token_id
        )}.png`}
        alt="MonstaRoll NFT"
      />
      {showDetails && (
        <div className="container">
          <h4 className="cardTitle">
            <b>#{paddedId(nft.token_id)}</b> Balance: {nft.amount}
          </h4>
          <p className="cardTitle">
            <a href={ipfsLink()} rel="noreferrer" target="_blank">
              Metadata
            </a>
            {saleId && <button onClick={handleCancelSale}>Cancel Sale</button>}
            {!tempSale && !saleId && <button onClick={handleShow}>Sell</button>}
          </p>
        </div>
      )}
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>
            Put your #{paddedId(nft.token_id)} NFT on sale
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Sale Price:
          <FormControl
            aria-label="Sale Price"
            onChange={(e) => setPrice(e.target.value)}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveSale}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default NftCard;
