import BetRow from "./BetRow";
import IconButton from "../components/IconButton";
import { faHammer, faCoins } from "@fortawesome/free-solid-svg-icons";

const BetHistory = ({
  rounds,
  mintableRounds,
  claimableRounds,
  handleClaim,
  handleMint,
}) => {
  return (
    <div
      style={{
        width: "500px",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#3c6e57",
        padding: "20px",
        borderRadius: "20px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        {claimableRounds.length > 0 && (
          <IconButton
            icon={faCoins}
            isLong={true}
            text={"  Claim " + claimableRounds.length + " Bet"}
            handler={() => handleClaim(claimableRounds)}
          />
        )}
        <div></div>
        {mintableRounds.length > 0 && (
          <IconButton
            icon={faHammer}
            isLong={true}
            text={"  Mint " + mintableRounds.length + " NFT"}
            handler={() => handleMint(mintableRounds)}
          />
        )}
      </div>
      {rounds &&
        rounds
          .slice(0)
          .reverse()
          .map((r) => (
            <BetRow
              key={r.epoch}
              round={r}
              handleClaim={handleClaim}
              handleMint={handleMint}
            />
          ))}
    </div>
  );
};

export default BetHistory;
