// components/LawChecks.js
import React from "react";
import styles from "./LawChecks.module.css"; // Import the CSS module

const LawChecks = ({ scale = 1 }) => {
  const text = "LAWCHECKS";

  return (
    <div className={`${styles.stage}`} style={{ transform: `scale(${scale})` }}>
      <div className={`${styles.wrapper} `}>
        <div className={`${styles.slash} reverse_card`}></div>
        <div className={`${styles.sides} `}>
          <div className={`${styles.side} reverse_card`}></div>
          <div className={`${styles.side} reverse_card`}></div>
          <div className={`${styles.side} reverse_card`}></div>
          <div className={`${styles.side} reverse_card`}></div>
        </div>
        <div className={`${styles.text} `}>
          <div className={`${styles.textBacking} `}>{text}</div>
          <div className={`${styles.textLeft}`}>
            <div className={`${styles.inner} `}>{text}</div>
          </div>
          <div className={`${styles.textRight} `}>
            <div className={`${styles.inner}`}>{text}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LawChecks;
