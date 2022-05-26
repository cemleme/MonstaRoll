import React, { useEffect, useState } from "react";
import monster0 from "../assets/monster0.png";
import monster1 from "../assets/monster1.png";
import monster2 from "../assets/monster2.png";
import monster3 from "../assets/monster3.png";
import monster4 from "../assets/monster4.png";

const monsterImages = [monster0, monster1, monster2, monster3, monster4];

const Monsters = React.forwardRef(({ roundResult, size, animate }, ref) => {
  const [monstersArr, setMonstersArr] = useState([]);

  useEffect(() => {
    const result = roundResult.toString().padStart(5, "0").split("");
    setMonstersArr(result);
  }, [roundResult]);

  return (
    <div
      style={{
        display: "flex",
        gap: "10px",
        alignItems: "center",
      }}
      ref={ref}
    >
      {monstersArr.map((id, index) => (
        <img
          key={index}
          src={monsterImages[id]}
          alt={"monster" + id}
          style={{
            width: size + "rem",
            height: size * 1.15 + "rem",
            objectFit: "contain",
            animationDuration: "0.5s",
            animationDelay: index * 0.2 + "s",
          }}
          className={animate ? "animate__animated animate__bounceInDown" : ""}
        />
      ))}
    </div>
  );
});

export default Monsters;
