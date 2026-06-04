import React, { useState, useRef, useEffect, useCallback } from 'react';
import './Chapter3.css';

// ─── Colors matching Ch1 ───────────────────────────────
const C = {
  sin: '#ff6b9d',
  cos: '#4ecdc4',
  tan: '#ffd93d',
  cot: '#a8e6cf',
  csc: '#ff9a56',
  sec: '#c3a5ff',
};

// ─── Theory content per mode ──────────────────────────
const THEORY = {
  sin: {
    title: 'f(θ) = sin(θ)',
    color: C.sin,
    body: [
      'sin(θ) — проекция радиус-вектора на ось Y.',
      'Период: 2π. Диапазон: [-1, 1].',
      'Максимум в θ = π/2 (90°), минимум в θ = 3π/2 (270°).',
      'В начале круга (θ=0) sin=0. Функция нечётная: sin(-θ) = -sin(θ).',
      'На промежутке [0, π/2] sin растёт быстрее всего у нуля — где скорость изменения максимальна (производная = cos(0) = 1).',
      'У вершины (π/2) функция "замедляется" — производная cos(π/2) = 0.',
    ],
  },
  cos: {
    title: 'f(θ) = cos(θ)',
    color: C.cos,
    body: [
      'cos(θ) — проекция радиус-вектора на ось X.',
      'Период: 2π. Диапазон: [-1, 1].',
      'Максимум в θ = 0, минимум в θ = π.',
      'cos — чётная функция: cos(-θ) = cos(θ).',
      'cos(θ) = sin(θ + π/2): это тот же синус, сдвинутый на π/2 влево.',
      'Скорость изменения: быстрее всего у θ=π/2, медленнее у θ=0 и θ=π.',
    ],
  },
  tan: {
    title: 'f(θ) = tan(θ) = sin(θ)/cos(θ)',
    color: C.tan,
    body: [
      'tan(θ) = sin(θ) / cos(θ).',
      'Когда cos(θ) → 0 (θ → π/2), tan стремится к ±∞ — вертикальная асимптота.',
      'Период: π (в 2 раза короче синуса!)',
      'Асимптоты: θ = π/2 + πn для любого целого n.',
      'Функция нечётная: tan(-θ) = -tan(θ).',
      'В промежутке (-π/2, π/2) tan возрастает от -∞ до +∞.',
      '⚠️ Используй зум (колёсико мыши), чтобы увидеть как tan уходит в бесконечность!',
    ],
  },
  cot: {
    title: 'f(θ) = cot(θ) = cos(θ)/sin(θ)',
    color: C.cot,
    body: [
      'cot(θ) = cos(θ) / sin(θ) = 1/tan(θ).',
      'Асимптоты там, где sin(θ) = 0: θ = 0, π, 2π...',
      'Период: π. Диапазон: (-∞, +∞).',
      'Убывает на каждом промежутке (nπ, (n+1)π).',
      'Функция нечётная: cot(-θ) = -cot(θ).',
    ],
  },
  csc: {
    title: 'f(θ) = csc(θ) = 1/sin(θ)',
    color: C.csc,
    body: [
      'csc(θ) = 1/sin(θ) — косеканс.',
      'Асимптоты там, где sin(θ) = 0: θ = 0, π, 2π...',
      'Диапазон: (-∞, -1] ∪ [1, +∞) — никогда не принимает значений между -1 и 1.',
      'Период: 2π. Функция нечётная.',
      'Где |sin| максимален (=1), |csc| минимален (=1).',
      'Ветви csc "огибают" максимумы и минимумы sin.',
    ],
  },
  sec: {
    title: 'f(θ) = sec(θ) = 1/cos(θ)',
    color: C.sec,
    body: [
      'sec(θ) = 1/cos(θ) — секанс.',
      'Асимптоты там, где cos(θ) = 0: θ = π/2, 3π/2...',
      'Диапазон: (-∞, -1] ∪ [1, +∞).',
      'Период: 2π. Чётная функция: sec(-θ) = sec(θ).',
      'sec(θ) = csc(θ - π/2): это тот же косеканс, сдвинутый.',
      'Ветви sec "огибают" максимумы и минимумы cos.',
    ],
  },
};

// ─── Which base curves to show per mode ───────────────
const SHOW_BASE = {
  sin: ['sin'],
  cos: ['cos'],
  tan: ['sin', 'cos', 'tan'],
  cot: ['sin', 'cos', 'cot'],
  csc: ['sin', 'csc'],
  sec: ['cos', 'sec'],
};

const MODES = ['sin', 'cos', 'tan', 'cot', 'csc', 'sec'];

// ─── Main component ────────────────────────────────────
export default function Chapter3() {
  const [mode, setMode] = useState('sin');
  const [animating, setAnimating] = useState(false);
  const [animAngle, setAnimAngle] = useState(0); // 0..2π
  const [zoom, setZoom] = useState(1); // 1 = default
  const [panX, setPanX] = useState(0);
  const animRef = useRef(null);
  const canvasRef = useRef(null);
  const lastAnimTime = useRef(null);
  const panDrag = useRef(null);

  const W = 680, H = 400;
  const originX = W / 2 + panX;
  const originY = H / 2;
  const scaleX = (W / (6 * Math.PI)) * zoom;
  const scaleY = (H / 4) * zoom;

  // Convert math coords to canvas
  const toC = useCallback((x, y) => [
    originX + x * scaleX,
    originY - y * scaleY,
  ], [originX, originY, scaleX, scaleY]);

  const fromC = useCallback((cx) => (cx - originX) / scaleX, [originX, scaleX]);

  // ── Animation loop ──────────────────────────────────
  useEffect(() => {
    if (!animating) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      return;
    }
    const SPEED = 0.8; // rad/s
    lastAnimTime.current = null;
    const step = (ts) => {
      if (!lastAnimTime.current) lastAnimTime.current = ts;
      const dt = (ts - lastAnimTime.current) / 1000;
      lastAnimTime.current = ts;
      setAnimAngle(prev => {
        const next = prev + SPEED * dt;
        return next > 2 * Math.PI ? next - 2 * Math.PI : next;
      });
      animRef.current = requestAnimationFrame(step);
    };
    animRef.current = requestAnimationFrame(step);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [animating]);

  // ── Draw canvas ─────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, W, H);

    const shows = SHOW_BASE[mode];

    // ── Grid ──
    ctx.strokeStyle = '#1e1e2a';
    ctx.lineWidth = 1;
    const xMin = fromC(0), xMax = fromC(W);
    const yMin = -H / (2 * scaleY), yMax = H / (2 * scaleY);

    // Vertical grid lines at multiples of π/2
    const step = Math.PI / 2;
    const startN = Math.floor(xMin / step);
    const endN = Math.ceil(xMax / step);
    for (let n = startN; n <= endN; n++) {
      const cx = toC(n * step, 0)[0];
      ctx.beginPath();
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, H);
      ctx.stroke();
    }

    // Horizontal grid
    for (let y = Math.floor(yMin); y <= Math.ceil(yMax); y++) {
      const cy = toC(0, y)[1];
      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(W, cy);
      ctx.stroke();
    }

    // ── Asymptote dashes ──
    const drawAsymptotes = (positions, color) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.setLineDash([6, 4]);
      positions.forEach(x => {
        const cx = toC(x, 0)[0];
        if (cx < 0 || cx > W) return;
        ctx.beginPath();
        ctx.moveTo(cx, 0);
        ctx.lineTo(cx, H);
        ctx.stroke();
      });
      ctx.setLineDash([]);
    };

    if (mode === 'tan' || mode === 'cot') {
      const asym = [];
      for (let n = startN - 2; n <= endN + 2; n++) {
        if (mode === 'tan') asym.push(Math.PI / 2 + n * Math.PI);
        else asym.push(n * Math.PI);
      }
      drawAsymptotes(asym, mode === 'tan' ? C.tan + '55' : C.cot + '55');
    }
    if (mode === 'csc') {
      const asym = [];
      for (let n = startN - 2; n <= endN + 2; n++) asym.push(n * Math.PI);
      drawAsymptotes(asym, C.csc + '55');
    }
    if (mode === 'sec') {
      const asym = [];
      for (let n = startN - 2; n <= endN + 2; n++) asym.push(Math.PI / 2 + n * Math.PI);
      drawAsymptotes(asym, C.sec + '55');
    }

    // ── Axes ──
    ctx.strokeStyle = '#5a5a7a';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([]);
    // X axis
    const [ax1, ay1] = toC(xMin, 0), [ax2] = toC(xMax, 0);
    ctx.beginPath(); ctx.moveTo(0, ay1); ctx.lineTo(W, ay1); ctx.stroke();
    // Y axis
    const [vx] = toC(0, 0);
    ctx.beginPath(); ctx.moveTo(vx, 0); ctx.lineTo(vx, H); ctx.stroke();

    // Axis arrows
    ctx.fillStyle = '#5a5a7a';
    ctx.beginPath(); ctx.moveTo(W - 4, ay1); ctx.lineTo(W - 12, ay1 - 5); ctx.lineTo(W - 12, ay1 + 5); ctx.fill();
    ctx.beginPath(); ctx.moveTo(vx, 4); ctx.lineTo(vx - 5, 12); ctx.lineTo(vx + 5, 12); ctx.fill();

    // Axis labels
    ctx.fillStyle = '#5a5a7a';
    ctx.font = '13px JetBrains Mono';
    ctx.textAlign = 'left';
    ctx.fillText('θ', W - 14, ay1 - 10);
    ctx.fillText('f(θ)', vx + 6, 18);

    // Tick labels
    ctx.font = '10px JetBrains Mono';
    ctx.fillStyle = '#4a4a6a';
    ctx.textAlign = 'center';
    const piLabels = { '-6': '-3π', '-5': '-5π/2', '-4': '-2π', '-3': '-3π/2', '-2': '-π', '-1': '-π/2', '0': '0', '1': 'π/2', '2': 'π', '3': '3π/2', '4': '2π', '5': '5π/2', '6': '3π' };
    for (let n = startN; n <= endN; n++) {
      const cx = toC(n * step, 0)[0];
      if (cx < 10 || cx > W - 10) continue;
      const lbl = piLabels[String(n)];
      if (!lbl) continue;
      ctx.fillText(lbl, cx, ay1 + 14);
    }
    // Y ticks
    ctx.textAlign = 'right';
    for (let y = Math.floor(yMin); y <= Math.ceil(yMax); y++) {
      if (y === 0) continue;
      const [, cy] = toC(0, y);
      if (cy < 4 || cy > H - 4) continue;
      ctx.fillText(String(y), vx - 5, cy + 3);
    }

    // ── Draw function ──
    const drawFn = (fn, color, lineW = 2.5) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineW;
      ctx.setLineDash([]);
      const steps = W * 2;
      let started = false;
      let prevValid = false;
      ctx.beginPath();
      for (let i = 0; i <= steps; i++) {
        const x = xMin + (xMax - xMin) * (i / steps);
        let y = fn(x);
        const valid = isFinite(y) && Math.abs(y) < 30;
        const [cx, cy] = toC(x, y);
        if (valid && prevValid) {
          ctx.lineTo(cx, cy);
        } else if (valid) {
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(cx, cy);
        }
        prevValid = valid;
      }
      ctx.stroke();
    };

    // Draw base curves
    const opacity = (col, op) => col; // we use full colors
    if (shows.includes('sin'))  drawFn(x => Math.sin(x), C.sin, mode === 'sin' ? 2.5 : 1.5);
    if (shows.includes('cos'))  drawFn(x => Math.cos(x), C.cos, mode === 'cos' ? 2.5 : 1.5);
    if (shows.includes('tan'))  drawFn(x => Math.tan(x), C.tan, 2.5);
    if (shows.includes('cot'))  drawFn(x => Math.cos(x) / Math.sin(x), C.cot, 2.5);
    if (shows.includes('csc'))  drawFn(x => 1 / Math.sin(x), C.csc, 2.5);
    if (shows.includes('sec'))  drawFn(x => 1 / Math.cos(x), C.sec, 2.5);

    // ── Animated trace dot + vertical tracker ──
    if (animating || animAngle > 0) {
      const θ = animAngle;
      let fVal;
      switch (mode) {
        case 'sin': fVal = Math.sin(θ); break;
        case 'cos': fVal = Math.cos(θ); break;
        case 'tan': fVal = Math.tan(θ); break;
        case 'cot': fVal = Math.cos(θ) / Math.sin(θ); break;
        case 'csc': fVal = 1 / Math.sin(θ); break;
        case 'sec': fVal = 1 / Math.cos(θ); break;
        default: fVal = 0;
      }

      const [dotX, dotY] = toC(θ, fVal);
      const mainColor = C[mode];

      // Vertical dashed tracker line
      if (dotX >= 0 && dotX <= W) {
        ctx.strokeStyle = mainColor + '55';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(dotX, 0);
        ctx.lineTo(dotX, H);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Horizontal dashed line to Y axis
      if (isFinite(fVal) && Math.abs(fVal) < 30 && dotY >= 0 && dotY <= H) {
        ctx.strokeStyle = mainColor + '55';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(0, dotY);
        ctx.lineTo(dotX, dotY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Dot on curve
        ctx.fillStyle = mainColor;
        ctx.beginPath();
        ctx.arc(dotX, dotY, 7, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Value label
        ctx.fillStyle = mainColor;
        ctx.font = 'bold 12px JetBrains Mono';
        ctx.textAlign = 'left';
        ctx.fillText(isFinite(fVal) ? fVal.toFixed(2) : '∞', dotX + 10, dotY - 5);
      }
    }

    // ── Small unit circle (top-right) ──────────────────
    const ucR = 52, ucCx = W - 75, ucCy = 75;
    ctx.strokeStyle = '#4a9e6b';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.arc(ucCx, ucCy, ucR, 0, 2 * Math.PI);
    ctx.stroke();

    // UC axes
    ctx.strokeStyle = '#3a3a4a';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(ucCx - ucR - 8, ucCy); ctx.lineTo(ucCx + ucR + 8, ucCy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ucCx, ucCy - ucR - 8); ctx.lineTo(ucCx, ucCy + ucR + 8); ctx.stroke();

    // UC sin dashed
    const ucθ = animating || animAngle > 0 ? animAngle : Math.PI / 4;
    const ucPx = ucCx + Math.cos(ucθ) * ucR;
    const ucPy = ucCy - Math.sin(ucθ) * ucR;
    const ucCosX = ucCx + Math.cos(ucθ) * ucR;

    // radius
    ctx.strokeStyle = '#ffffff99';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(ucCx, ucCy); ctx.lineTo(ucPx, ucPy); ctx.stroke();

    // sin vertical
    ctx.strokeStyle = C.sin;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(ucPx, ucCy); ctx.lineTo(ucPx, ucPy); ctx.stroke();

    // cos horizontal
    ctx.strokeStyle = C.cos;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(ucCx, ucCy); ctx.lineTo(ucPx, ucCy); ctx.stroke();

    // sin label
    ctx.font = 'bold 10px JetBrains Mono';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff66';
    ctx.fillText('sin', ucCx, ucCy - ucR - 12);

    // Angle arc
    ctx.strokeStyle = '#ff6b6b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(ucCx, ucCy, 14, 0, -ucθ, ucθ > Math.PI);
    ctx.stroke();

    // UC dot
    ctx.fillStyle = '#ff6b6b';
    ctx.beginPath(); ctx.arc(ucPx, ucPy, 4, 0, 2 * Math.PI); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke();

    // θ value near circle
    ctx.fillStyle = '#ff6b6b88';
    ctx.font = '10px JetBrains Mono';
    ctx.textAlign = 'center';
    ctx.fillText(ucθ.toFixed(2), ucCx + 22, ucCy + 6);

  }, [mode, animAngle, zoom, panX, W, H, scaleX, scaleY, originX, originY, toC, fromC]);

  // ── Zoom with wheel ────────────────────────────────
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(z => Math.max(0.3, Math.min(8, z * delta)));
  }, []);

  const handlePanStart = useCallback((e) => {
    panDrag.current = { startX: e.clientX, startPanX: panX };
  }, [panX]);
  const handlePanMove = useCallback((e) => {
    if (!panDrag.current) return;
    const dx = e.clientX - panDrag.current.startX;
    setPanX(panDrag.current.startPanX + dx);
  }, []);
  const handlePanEnd = useCallback(() => { panDrag.current = null; }, []);

  return (
    <div className="ch3-root">
      <div className="ch3-left">
        {/* Mode selector */}
        <div className="ch3-mode-bar">
          {MODES.map(m => (
            <button
              key={m}
              className={`ch3-mode-btn ${mode === m ? 'active' : ''}`}
              style={{ '--mc': C[m] }}
              onClick={() => { setMode(m); setAnimAngle(0); }}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Canvas */}
        <div className="ch3-canvas-wrap">
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            className="ch3-canvas"
            onWheel={handleWheel}
            onMouseDown={handlePanStart}
            onMouseMove={handlePanMove}
            onMouseUp={handlePanEnd}
            onMouseLeave={handlePanEnd}
          />
          <div className="ch3-zoom-hint">🖱 колёсико = зум · drag = пан</div>
        </div>

        {/* Controls */}
        <div className="ch3-controls">
          <button
            className={`ch3-anim-btn ${animating ? 'stop' : 'play'}`}
            onClick={() => setAnimating(v => !v)}
          >
            {animating ? '⏹ Стоп' : '▶ Анимация'}
          </button>
          <button className="ch3-reset-btn" onClick={() => { setZoom(1); setPanX(0); }}>
            ↺ Сбросить
          </button>
          <div className="ch3-zoom-val">Зум: {zoom.toFixed(1)}×</div>
        </div>
      </div>

      {/* Theory panel */}
      <div className="ch3-right">
        <div className="ch3-theory-header" style={{ borderColor: C[mode] }}>
          <span className="ch3-theory-title" style={{ color: C[mode] }}>{THEORY[mode].title}</span>
        </div>
        <div className="ch3-theory-body">
          {THEORY[mode].body.map((line, i) => (
            <div key={i} className="ch3-theory-line">
              <span className="ch3-theory-bullet" style={{ color: C[mode] }}>›</span>
              <span>{line}</span>
            </div>
          ))}
        </div>

        {/* Live value */}
        <div className="ch3-live-section">
          <div className="ch3-live-label">Текущее значение</div>
          <div className="ch3-live-row">
            <span style={{ color: '#ff6b6b' }}>θ = {animAngle.toFixed(2)} рад</span>
          </div>
          <div className="ch3-live-row">
            {(() => {
              let v;
              const θ = animAngle;
              switch (mode) {
                case 'sin': v = Math.sin(θ); break;
                case 'cos': v = Math.cos(θ); break;
                case 'tan': v = Math.tan(θ); break;
                case 'cot': v = Math.cos(θ) / Math.sin(θ); break;
                case 'csc': v = 1 / Math.sin(θ); break;
                case 'sec': v = 1 / Math.cos(θ); break;
                default: v = 0;
              }
              return (
                <span style={{ color: C[mode], fontWeight: 700, fontSize: '18px' }}>
                  {mode}(θ) = {isFinite(v) ? v.toFixed(4) : '∞'}
                </span>
              );
            })()}
          </div>
        </div>

        {/* Key points */}
        <div className="ch3-keys-section">
          <div className="ch3-keys-label">Ключевые точки</div>
          {getKeyPoints(mode).map((kp, i) => (
            <div key={i} className="ch3-key-row">
              <span style={{ color: '#ff6b6b' }}>{kp.theta}</span>
              <span style={{ color: C[mode] }}>{kp.val}</span>
              <span className="ch3-key-note">{kp.note}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function getKeyPoints(mode) {
  const pts = {
    sin: [
      { theta: 'θ = 0', val: 'sin = 0', note: 'начало' },
      { theta: 'θ = π/2', val: 'sin = 1', note: 'максимум, скорость = 0' },
      { theta: 'θ = π', val: 'sin = 0', note: 'пересечение оси' },
      { theta: 'θ = 3π/2', val: 'sin = -1', note: 'минимум' },
      { theta: 'θ = 2π', val: 'sin = 0', note: 'полный оборот' },
    ],
    cos: [
      { theta: 'θ = 0', val: 'cos = 1', note: 'максимум' },
      { theta: 'θ = π/2', val: 'cos = 0', note: 'пересечение оси' },
      { theta: 'θ = π', val: 'cos = -1', note: 'минимум' },
      { theta: 'θ = 3π/2', val: 'cos = 0', note: 'пересечение оси' },
      { theta: 'θ = 2π', val: 'cos = 1', note: 'полный оборот' },
    ],
    tan: [
      { theta: 'θ = 0', val: 'tan = 0', note: '' },
      { theta: 'θ → π/2⁻', val: 'tan → +∞', note: 'асимптота!' },
      { theta: 'θ = π', val: 'tan = 0', note: '' },
      { theta: 'θ → 3π/2⁻', val: 'tan → +∞', note: 'асимптота!' },
    ],
    cot: [
      { theta: 'θ → 0⁺', val: 'cot → +∞', note: 'асимптота!' },
      { theta: 'θ = π/2', val: 'cot = 0', note: '' },
      { theta: 'θ → π⁻', val: 'cot → -∞', note: 'асимптота!' },
    ],
    csc: [
      { theta: 'θ → 0⁺', val: 'csc → +∞', note: 'асимптота!' },
      { theta: 'θ = π/2', val: 'csc = 1', note: 'минимум ветви' },
      { theta: 'θ = π', val: 'csc → ±∞', note: 'асимптота!' },
      { theta: 'θ = 3π/2', val: 'csc = -1', note: 'максимум ветви' },
    ],
    sec: [
      { theta: 'θ = 0', val: 'sec = 1', note: 'минимум ветви' },
      { theta: 'θ → π/2⁻', val: 'sec → +∞', note: 'асимптота!' },
      { theta: 'θ = π', val: 'sec = -1', note: 'максимум ветви' },
      { theta: 'θ → 3π/2⁻', val: 'sec → -∞', note: 'асимптота!' },
    ],
  };
  return pts[mode] || [];
}
