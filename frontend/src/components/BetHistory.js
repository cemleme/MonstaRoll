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
          justifyContent: "space-between"
        }}
      >
        {mintableRounds.length > 0 && (
          <IconButton
            icon={faHammer}
            isLong={true}
            text={"  Mint " + mintableRounds.length + " NFT"}
            handler={() => handleMint(mintableRounds)}
          />
        )}
        {claimableRounds.length > 0 && (
          <IconButton
            icon={faCoins}
            isLong={true}
            text={"  Claim " + claimableRounds.length + " Bet"}
            handler={() => handleClaim(claimableRounds)}
          />
        )}
      </div>
      {rounds &&
        rounds
          .slice(0)
          .reverse()
          .map((r) => (
            <BetRow
              key={r.round}
              round={r}
              handleClaim={handleClaim}
              handleMint={handleMint}
            />
          ))}
    </div>
  );
};

export default BetHistory;
