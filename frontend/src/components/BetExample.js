import { useEffect, useState } from "react";
import Monsters from "./Monsters";

const BetExample = ({ roundResult, resultName, payout, isResult }) => {
  const [rowStyle, setRowStyle] = useState({
    width: "23rem",
    display: "flex",
    gap: "1rem",
    paddingLeft: "10px",
    borderRadius: "10px",
  });

  useEffect(() => {
    setRowStyle((s) => ({
      ...s,
      backgroundColor: isResult ? "#7cb855" : "transparent",
    }));
  }, [isResult]);

  return (
    <div style={rowStyle}>
      <Monsters roundResult={roundResult} size={2} />
      <div style={{ color: isResult ? "black" : "white", display: "flex", alignItems: "center" }}>
        {resultName} <br /> Payout: x{payout}
      </div>
    </div>
  );
};

export default BetExample;
