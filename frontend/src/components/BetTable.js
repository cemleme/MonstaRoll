import BetExample from "./BetExample";

const BetTable = ({ currentResult }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#3c6e57",
        padding: "10px",
        borderRadius: "20px",
      }}
    >
      <BetExample
        roundResult={'11111'}
        resultName="FIVE OF A KIND"
        payout={30}
        isResult={currentResult == 6}
      />
      <hr />
      <BetExample
        roundResult={'44440'}
        resultName="FOUR OF A KIND"
        payout={2.5}
        isResult={currentResult == 5}
      />
      <hr />
      <BetExample
        roundResult={'33322'}
        resultName="FULL HOUSE"
        payout={2}
        isResult={currentResult == 4}
      />
      <hr />
      <BetExample
        roundResult={'00031'}
        resultName="THREE OF A KIND"
        payout={1.25}
        isResult={currentResult == 3}
      />
      <hr />
      <BetExample
        roundResult={'11220'}
        resultName="TWO PAIRS"
        payout={0.5}
        isResult={currentResult == 2}
      />
      <hr />
      <BetExample
        roundResult={'44230'}
        resultName="ONE PAIR"
        payout={0.1}
        isResult={currentResult == 1}
      />
      <hr />
      <BetExample
        roundResult={'01234'}
        resultName="NONE"
        payout={0}
        isResult={currentResult == 0}
      />
    </div>
  );
};

export default BetTable;
