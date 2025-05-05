"use client";

import React from "react";

interface DigitSelectorProps {
  position: number;
  currentNumber: string;
  updateDigit: (position: number, increment: boolean) => void;
}

const DigitSelector: React.FC<DigitSelectorProps> = ({
  position,
  currentNumber,
  updateDigit,
}) => {
  const digit = currentNumber[position];
  
  return (
    <div className="digit-selector flex flex-col items-center">
      <button 
        className="selector-arrow up-arrow" 
        onClick={() => updateDigit(position, true)}
        aria-label={`Increase ${position === 0 ? 'hundreds' : position === 1 ? 'tens' : 'ones'} place`}
      >
        ▲
      </button>
      <div className="digit-display">{digit}</div>
      <button 
        className="selector-arrow down-arrow" 
        onClick={() => updateDigit(position, false)}
        aria-label={`Decrease ${position === 0 ? 'hundreds' : position === 1 ? 'tens' : 'ones'} place`}
      >
        ▼
      </button>
    </div>
  );
};

export default DigitSelector; 