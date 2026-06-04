import React from 'react';
import './FormulaPanel.css';

const COLORS = {
  sin: '#ff6b9d',
  cos: '#4ecdc4',
  tan: '#ffd93d',
  cot: '#a8e6cf',
  csc: '#ff9a56',
  sec: '#c3a5ff',
  hyp: '#ffffff',
  angle: '#ff6b6b',
};

function fmt(v) {
  if (!isFinite(v)) return '∞';
  return v.toFixed(2);
}

function FormulaRow({ name, color, formula, numerator, denominator, value }) {
  return (
    <div className="formula-row">
      <div className="formula-name" style={{ color }}>{name}</div>
      <div className="formula-expr">
        <span style={{ color }}>
          {name}θ
        </span>
        {' = '}
        <span className="formula-frac">
          <span style={{ color: COLORS[numerator?.key] || 'inherit' }}>{numerator?.label}</span>
          {denominator && (
            <>
              <span className="frac-div">/</span>
              <span style={{ color: COLORS[denominator?.key] || 'inherit' }}>{denominator?.label}</span>
            </>
          )}
        </span>
        {' = '}
        {numerator && denominator ? (
          <>
            <span style={{ color: COLORS[numerator?.key] || '#aaa' }}>{numerator?.val}</span>
            <span className="frac-div">/</span>
            <span style={{ color: COLORS[denominator?.key] || '#aaa' }}>{denominator?.val}</span>
            {' = '}
          </>
        ) : numerator ? (
          <>
            <span style={{ color: COLORS[numerator?.key] || '#aaa' }}>{numerator?.val}</span>
            {' = '}
          </>
        ) : null}
        <span style={{ color, fontWeight: 700 }}>{value}</span>
      </div>
    </div>
  );
}

export default function FormulaPanel({ angleDeg, trig, inputVal, onInputChange, onInputBlur }) {
  const { sin, cos, tan, cot, csc, sec } = trig;
  const angleRad = (angleDeg * Math.PI / 180);

  const rows = [
    {
      name: 'sin',
      color: COLORS.sin,
      numerator: { key: 'sin', label: 'y', val: fmt(sin) },
      denominator: { key: 'hyp', label: '1', val: '1' },
      value: fmt(sin),
    },
    {
      name: 'cos',
      color: COLORS.cos,
      numerator: { key: 'cos', label: 'x', val: fmt(cos) },
      denominator: { key: 'hyp', label: '1', val: '1' },
      value: fmt(cos),
    },
    {
      name: 'tan',
      color: COLORS.tan,
      numerator: { key: 'sin', label: 'sinθ', val: fmt(sin) },
      denominator: { key: 'cos', label: 'cosθ', val: fmt(cos) },
      value: fmt(tan),
    },
    {
      name: 'cot',
      color: COLORS.cot,
      numerator: { key: 'cos', label: 'cosθ', val: fmt(cos) },
      denominator: { key: 'sin', label: 'sinθ', val: fmt(sin) },
      value: fmt(cot),
    },
    {
      name: 'csc',
      color: COLORS.csc,
      numerator: { key: 'hyp', label: '1', val: '1' },
      denominator: { key: 'sin', label: 'sinθ', val: fmt(sin) },
      value: fmt(csc),
    },
    {
      name: 'sec',
      color: COLORS.sec,
      numerator: { key: 'hyp', label: '1', val: '1' },
      denominator: { key: 'cos', label: 'cosθ', val: fmt(cos) },
      value: fmt(sec),
    },
  ];

  return (
    <div className="fp-root">
      <div className="fp-header">
        <span className="fp-title">Данные</span>
      </div>

      {/* Given values */}
      <div className="fp-section">
        <div className="fp-section-label">Дано</div>
        <div className="given-row">
          <span className="given-key" style={{ color: COLORS.hyp }}>гипотенуза</span>
          <span className="given-val" style={{ color: COLORS.hyp }}>= 1</span>
        </div>
        <div className="given-row">
          <span className="given-key" style={{ color: COLORS.angle }}>θ (угол)</span>
          <span className="given-val" style={{ color: COLORS.angle }}>
            =&nbsp;
            <input
              type="number"
              value={inputVal}
              onChange={onInputChange}
              onBlur={onInputBlur}
              min="0"
              max="360"
              step="1"
            />
            °
          </span>
        </div>
        <div className="given-row">
          <span className="given-key" style={{ color: COLORS.angle }}>θ в радианах</span>
          <span className="given-val" style={{ color: COLORS.angle }}>= {fmt(angleRad)} рад</span>
        </div>
      </div>

      {/* Slider */}
      <div className="fp-section">
        <div className="fp-section-label">Перетащи угол</div>
        <input
          type="range"
          min="0"
          max="360"
          step="0.5"
          value={angleDeg}
          onChange={e => onInputChange({ target: { value: e.target.value } })}
          style={{ width: '100%' }}
        />
        <div className="slider-labels">
          <span>0°</span><span>90°</span><span>180°</span><span>270°</span><span>360°</span>
        </div>
      </div>

      {/* Formulas */}
      <div className="fp-section">
        <div className="fp-section-label">Формулы</div>
        {rows.map(row => (
          <FormulaRow key={row.name} {...row} />
        ))}
      </div>

      {/* Quick identities */}
      <div className="fp-section">
        <div className="fp-section-label">Основные тождества</div>
        <div className="identity-row">
          <span style={{ color: COLORS.sin }}>sin²θ</span>
          <span> + </span>
          <span style={{ color: COLORS.cos }}>cos²θ</span>
          <span> = </span>
          <span style={{ color: '#aaa' }}>{fmt(sin * sin + cos * cos)}</span>
        </div>
        <div className="identity-row">
          <span>1 + </span>
          <span style={{ color: COLORS.tan }}>tan²θ</span>
          <span> = </span>
          <span style={{ color: COLORS.sec }}>sec²θ</span>
          <span> = </span>
          <span style={{ color: '#aaa' }}>{fmt(1 + tan * tan)}</span>
        </div>
        <div className="identity-row">
          <span>1 + </span>
          <span style={{ color: COLORS.cot }}>cot²θ</span>
          <span> = </span>
          <span style={{ color: COLORS.csc }}>csc²θ</span>
          <span> = </span>
          <span style={{ color: '#aaa' }}>{fmt(1 + cot * cot)}</span>
        </div>
      </div>
    </div>
  );
}
