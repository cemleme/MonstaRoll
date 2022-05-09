import { useEffect, useState } from "react";
import Monsters from "./Monsters";
import BetResult from "./BetResult";
import IconButton from "../components/IconButton";

const BetRow = ({ round, handleClaim, handleMint }) => {

  return (
    <>
      <hr />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          alignItems: "center",
          width: "100%",
        }}
      >
        <BetResult bet={round} />

        <div
          style={{
            width: "100%",
            display: "flex",
            gap: "10px",
            justifyContent: "space-between",
          }}
        >
          <Monsters roundResult={round.result} size={2} />
          {(round.claimed || round.resultType === "0") && (
            <IconButton
              text="CLAIM"
              isSmall={true}
              handler={() => handleClaim([round.round])}
            />
          )}
          {!round.minted && (
            <IconButton
              text="MINT"
              isSmall={true}
              handler={() => handleMint([round.round])}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default BetRow;
