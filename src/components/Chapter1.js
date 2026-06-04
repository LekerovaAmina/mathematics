import React, { useState, useRef, useCallback, useEffect } from 'react';
import UnitCircle from './UnitCircle';
import FormulaPanel from './FormulaPanel';
import './Chapter1.css';

export default function Chapter1() {
  const [angleDeg, setAngleDeg] = useState(65);
  const [inputVal, setInputVal] = useState('65');

  const angleRad = (angleDeg * Math.PI) / 180;

  const sinV = Math.sin(angleRad);
  const cosV = Math.cos(angleRad);
  const tanV = Math.tan(angleRad);
  const cotV = cosV / sinV;
  const cscV = 1 / sinV;
  const secV = 1 / cosV;

  const trig = { sin: sinV, cos: cosV, tan: tanV, cot: cotV, csc: cscV, sec: secV };

  const handleAngleChange = useCallback((deg) => {
    const clamped = ((deg % 360) + 360) % 360;
    setAngleDeg(clamped);
    setInputVal(clamped.toFixed(0));
  }, []);

  const handleInputChange = (e) => {
    setInputVal(e.target.value);
    const parsed = parseFloat(e.target.value);
    if (!isNaN(parsed)) {
      handleAngleChange(parsed);
    }
  };

  const handleInputBlur = () => {
    const parsed = parseFloat(inputVal);
    if (!isNaN(parsed)) {
      const clamped = ((parsed % 360) + 360) % 360;
      setInputVal(clamped.toFixed(0));
      setAngleDeg(clamped);
    } else {
      setInputVal(angleDeg.toFixed(0));
    }
  };

  return (
    <div className="ch1-root">
      <div className="ch1-left">
        <UnitCircle angleDeg={angleDeg} trig={trig} onAngleChange={handleAngleChange} />
      </div>
      <div className="ch1-right">
        <FormulaPanel
          angleDeg={angleDeg}
          trig={trig}
          inputVal={inputVal}
          onInputChange={handleInputChange}
          onInputBlur={handleInputBlur}
        />
      </div>
    </div>
  );
}
