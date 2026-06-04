import React, { useState, useRef, useEffect, useCallback } from 'react';
import './Chapter4.css';

const CA = '#ffd93d';   // alpha - yellow
const CB = '#4ecdc4';   // beta  - cyan
const CSIN = '#ff6b9d';
const CCOS = '#4ecdc4';
const CWHITE = '#e8e8f0';
const CDIM = '#6b6b8a';

// ДОБАВЬ ВОТ ЭТИ ДВЕ СТРОЧКИ СЮДА:
const CA_ALPHA = 'rgba(255, 217, 61, 0.6)';       // Желтый с прозрачностью
const CWHITE_ALPHA = 'rgba(232, 232, 240, 0.7)';   // Белый с прозрачностью

// Steps of the proof animation
const STEPS = [
  {
    id: 0,
    title: 'Два угла',
    desc: 'Рисуем два угла α и β от начала координат. Гипотенуза OP = 1 (единичная окружность).',
    show: ['axes', 'alpha_ray', 'beta_ray', 'angle_arcs', 'O_label'],
  },
  {
    id: 1,
    title: 'Точка P на гипотенузе',
    desc: 'Откладываем единичный отрезок OP = 1 по лучу (α+β). Опускаем перпендикуляр PB на ось X. Тогда sin(α+β) = PB.',
    show: ['axes', 'alpha_ray', 'beta_ray', 'angle_arcs', 'O_label', 'OP_hyp', 'P_label', 'PB_vert', 'B_label', 'right_B', 'sin_ab_label'],
  },
  {
    id: 2,
    title: 'Строим треугольник OPQ',
    desc: 'Из P опускаем перпендикуляр на луч α. Получаем точку Q. В треугольнике OPQ: PQ = sinβ, OQ = cosβ.',
    show: ['axes', 'alpha_ray', 'beta_ray', 'angle_arcs', 'O_label', 'OP_hyp', 'P_label', 'PB_vert', 'B_label', 'right_B', 'OQ_cos', 'PQ_sin', 'Q_label', 'right_Q', 'opq_box'],
  },
  {
    id: 3,
    title: 'Треугольник OQA',
    desc: 'Из Q опускаем перпендикуляр на ось X — точка A. В треугольнике OQA: sinα = AQ/OQ, значит AQ = sinα·cosβ.',
    show: ['axes', 'alpha_ray', 'beta_ray', 'angle_arcs', 'O_label', 'OP_hyp', 'P_label', 'PB_vert', 'B_label', 'right_B', 'OQ_cos', 'PQ_sin', 'Q_label', 'right_Q', 'opq_box', 'QA_vert', 'A_label', 'right_A', 'AQ_label', 'oqa_box'],
  },
  {
    id: 4,
    title: 'Треугольник PQR',
    desc: 'Из P опускаем горизонталь до вертикали QA — точка R. В △PQR: ∠P = α (угол между PQ и вертикалью), PR = cosα·sinβ.',
    show: ['axes', 'alpha_ray', 'beta_ray', 'angle_arcs', 'O_label', 'OP_hyp', 'P_label', 'PB_vert', 'B_label', 'right_B', 'OQ_cos', 'PQ_sin', 'Q_label', 'right_Q', 'opq_box', 'QA_vert', 'A_label', 'right_A', 'AQ_label', 'oqa_box', 'PR_horiz', 'R_label', 'right_R', 'PR_label', 'pqr_box'],
  },
  {
    id: 5,
    title: 'Итог: sin(α+β)',
    desc: 'PB = PR + RB = PR + AQ (так как RBAC — прямоугольник). Значит: sin(α+β) = cosα·sinβ + sinα·cosβ ✓',
    show: ['axes', 'alpha_ray', 'beta_ray', 'angle_arcs', 'O_label', 'OP_hyp', 'P_label', 'PB_vert', 'B_label', 'right_B', 'OQ_cos', 'PQ_sin', 'Q_label', 'right_Q', 'QA_vert', 'A_label', 'right_A', 'AQ_label', 'PR_horiz', 'R_label', 'right_R', 'PR_label', 'final_formula', 'brace_PB'],
  },
];

const IDENTITIES = [
  { label: 'sin(α+β)', formula: 'sinα·cosβ + cosα·sinβ', color: CSIN },
  { label: 'sin(α−β)', formula: 'sinα·cosβ − cosα·sinβ', color: CSIN },
  { label: 'cos(α+β)', formula: 'cosα·cosβ − sinα·sinβ', color: CCOS },
  { label: 'cos(α−β)', formula: 'cosα·cosβ + sinα·sinβ', color: CCOS },
  { label: 'tan(α±β)', formula: '(tanα ± tanβ) / (1 ∓ tanα·tanβ)', color: '#ffd93d' },
];

export function Chapter4() {
  const [step, setStep] = useState(0);
  const [alphaDeg, setAlphaDeg] = useState(30);
  const [betaDeg, setBetaDeg] = useState(35);
  const [autoPlay, setAutoPlay] = useState(false);
  const autoRef = useRef(null);
  const canvasRef = useRef(null);

  const alphaR = alphaDeg * Math.PI / 180;
  const betaR = betaDeg * Math.PI / 180;
  const sumR = alphaR + betaR;

  // Canvas geometry
  const W = 560, H = 440;
  const OX = 110, OY = 370; // origin
  const SCALE = 280;

  // Key points
  const O = [OX, OY];
  const P = [OX + SCALE * Math.cos(sumR), OY - SCALE * Math.sin(sumR)];
  const B = [OX + SCALE * Math.cos(sumR), OY];           // foot of P on x-axis
  const Q = [OX + SCALE * Math.cos(betaR) * Math.cos(alphaR), OY - SCALE * Math.cos(betaR) * Math.sin(alphaR)]; // foot of P on alpha ray, = OQ direction
  // Actually: Q = O + cosβ * (direction of alpha)
  const Qx = OX + SCALE * Math.cos(betaR) * Math.cos(alphaR);
  const Qy = OY - SCALE * Math.cos(betaR) * Math.sin(alphaR);
  const A = [Qx, OY];  // foot of Q on x-axis
  // R = intersection of horizontal from P and vertical from Q/A
  const R = [Qx, P[1]]; // same x as Q, same y as P

  const shows = STEPS[step].show;
  const has = (k) => shows.includes(k);

  useEffect(() => {
    if (autoPlay) {
      autoRef.current = setInterval(() => {
        setStep(s => {
          if (s >= STEPS.length - 1) { setAutoPlay(false); return s; }
          return s + 1;
        });
      }, 2200);
    }
    return () => clearInterval(autoRef.current);
  }, [autoPlay]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, W, H);

    const line = (x1, y1, x2, y2, color = CWHITE, w = 1.5, dash = []) => {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = w;
      ctx.setLineDash(dash);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.restore();
    };

    const rightAngle = (cx, cy, dx1, dy1, dx2, dy2, color = '#888', size = 10) => {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.2;
      const px = cx + dx1 * size, py = cy + dy1 * size;
      const qx = px + dx2 * size, qy = py + dy2 * size;
      const rx = cx + dx2 * size, ry = cy + dy2 * size;
      ctx.beginPath();
      ctx.moveTo(px, py); ctx.lineTo(qx, qy); ctx.lineTo(rx, ry);
      ctx.stroke();
      ctx.restore();
    };

    const dot = (x, y, color = CWHITE, r = 3.5) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, 2 * Math.PI);
      ctx.fill();
    };

    const txt = (text, x, y, color = CWHITE, size = 13, align = 'center', style = '') => {
      ctx.save();
      ctx.fillStyle = color;
      ctx.font = `${style} ${size}px "JetBrains Mono", monospace`;
      ctx.textAlign = align;
      ctx.textBaseline = 'middle';
      ctx.fillText(text, x, y);
      ctx.restore();
    };

    const arc = (cx, cy, r, startA, endA, color, w = 1.5) => {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = w;
      ctx.beginPath();
      ctx.arc(cx, cy, r, -endA, -startA);
      ctx.stroke();
      ctx.restore();
    };

    // ── Axes ──
    if (has('axes')) {
      line(OX - 20, OY, W - 10, OY, '#3a3a5a', 1.5);
      line(OX, H - 10, OX, 10, '#3a3a5a', 1.5);
      // x arrow
      ctx.fillStyle = '#3a3a5a';
      ctx.beginPath(); ctx.moveTo(W - 8, OY); ctx.lineTo(W - 16, OY - 4); ctx.lineTo(W - 16, OY + 4); ctx.fill();
      ctx.beginPath(); ctx.moveTo(OX, 8); ctx.lineTo(OX - 4, 16); ctx.lineTo(OX + 4, 16); ctx.fill();
    }

    // ── Rays ──
    if (has('alpha_ray')) {
      const ext = 1.15;
      line(OX, OY, OX + SCALE * ext * Math.cos(alphaR), OY - SCALE * ext * Math.sin(alphaR), CA, 1.5);
    }
    if (has('beta_ray')) {
      const ext = 1.15;
      line(OX, OY, OX + SCALE * ext * Math.cos(sumR), OY - SCALE * ext * Math.sin(sumR), CWHITE, 1.5);
    }

    // ── Angle arcs ──
    if (has('angle_arcs')) {
      arc(OX, OY, 32, 0, alphaR, CA, 2);
      arc(OX, OY, 46, alphaR, sumR, CB, 2);
      txt('α', OX + 50 * Math.cos(alphaR / 2), OY - 50 * Math.sin(alphaR / 2), CA, 14, 'center', 'italic');
      txt('β', OX + 62 * Math.cos(alphaR + betaR / 2), OY - 62 * Math.sin(alphaR + betaR / 2), CB, 14, 'center', 'italic');
    }

    // ── OP hypotenuse ──
    if (has('OP_hyp')) {
      line(OX, OY, P[0], P[1], CWHITE, 2);
      const mx = (OX + P[0]) / 2 - 14 * Math.sin(sumR);
      const my = (OY + P[1]) / 2 - 14 * Math.cos(sumR);
      txt('1', mx, my, CWHITE_ALPHA, 13);
      dot(P[0], P[1], CWHITE, 4);
    }

    // ── PB vertical ──
    if (has('PB_vert')) {
      line(P[0], P[1], B[0], B[1], CSIN, 2.5);
      rightAngle(B[0], B[1], 0, -1, -1, 0, '#888');
      dot(B[0], B[1], CSIN, 3.5);
    }

    // ── OQ (cosβ along alpha ray) ──
    if (has('OQ_cos')) {
      line(OX, OY, Qx, Qy, CA, 2.5);
      const mx = (OX + Qx) / 2 + 8 * Math.sin(alphaR);
      const my = (OY + Qy) / 2 + 8 * Math.cos(alphaR);
      txt('cosβ', mx, my, CA, 11, 'center', 'italic');
      dot(Qx, Qy, CA, 3.5);
    }

    // ── PQ (sinβ perpendicular) ──
    if (has('PQ_sin')) {
      line(P[0], P[1], Qx, Qy, CB, 2.5);
      const mx = (P[0] + Qx) / 2 + 12 * Math.cos(alphaR);
      const my = (P[1] + Qy) / 2 + 12 * Math.sin(alphaR);
      txt('sinβ', mx, my, CB, 11, 'center', 'italic');
    }

    // ── Right angle at Q (PQ perp alpha ray) ──
    if (has('right_Q')) {
      const perpX = -Math.sin(alphaR), perpY = Math.cos(alphaR);
      const alongX = Math.cos(alphaR), alongY = -Math.sin(alphaR);
      rightAngle(Qx, Qy, -perpX, perpY, -alongX, alongY, '#888');
    }

    // ── QA vertical ──
    if (has('QA_vert')) {
      line(Qx, Qy, A[0], A[1], CA_ALPHA, 1.5, [4, 4]);
      rightAngle(A[0], A[1], 0, -1, -1, 0, '#888');
      dot(A[0], A[1], CA, 3.5);
    }

    // ── AQ label ──
    if (has('AQ_label')) {
      const mx = Qx + 26, my = (Qy + A[1]) / 2;
      txt('sinα·cosβ', mx + 20, my, CSIN, 10, 'left', 'italic');
    }

    // ── PR horizontal ──
    if (has('PR_horiz')) {
      line(P[0], P[1], R[0], R[1], '#c3a5ff', 2.5);
      const mx = (P[0] + R[0]) / 2;
      const my = P[1] - 12;
      dot(R[0], R[1], '#c3a5ff', 3.5);
    }

    // ── Right angle at R ──
    if (has('right_R')) {
      rightAngle(R[0], R[1], 0, 1, 1, 0, '#888');
    }

    // ── PR label ──
    if (has('PR_label')) {
      const mx = (P[0] + R[0]) / 2;
      const my = P[1] - 14;
      txt('cosα·sinβ', mx, my, '#c3a5ff', 10, 'center', 'italic');
    }

    // ── Right angle at B ──
    if (has('right_B')) {
      rightAngle(B[0], B[1], 0, -1, -1, 0, '#888');
    }

    // ── Right angle at A ──
    if (has('right_A')) {
      rightAngle(A[0], A[1], 0, -1, -1, 0, '#888');
    }

    // ── Brace on PB ──
    if (has('brace_PB')) {
      // Draw brace visually showing PB = PR + RB
      const bx = P[0] + 18;
      const topY = P[1], midY = R[1], botY = B[1];
      // upper brace (PR = cosα·sinβ)
      ctx.strokeStyle = '#c3a5ff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(bx - 4, topY); ctx.lineTo(bx, topY);
      ctx.lineTo(bx, midY);
      ctx.lineTo(bx - 4, midY);
      ctx.stroke();
      txt('cosα·sinβ', bx + 52, (topY + midY) / 2, '#c3a5ff', 10, 'center', 'italic');
      // lower brace (AQ = sinα·cosβ)
      ctx.strokeStyle = CSIN;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(bx - 4, midY); ctx.lineTo(bx, midY);
      ctx.lineTo(bx, botY);
      ctx.lineTo(bx - 4, botY);
      ctx.stroke();
      txt('sinα·cosβ', bx + 52, (midY + botY) / 2, CSIN, 10, 'center', 'italic');
    }

    // ── sin(α+β) label on PB ──
    if (has('sin_ab_label')) {
      txt('sin(α+β)', P[0] + 28, (P[1] + B[1]) / 2, CSIN, 11, 'left', 'italic');
    }

    // ── OPQ box ──
    if (has('opq_box')) {
      ctx.save();
      ctx.strokeStyle = CB + '88';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.strokeRect(W - 190, 10, 185, 70);
      ctx.restore();
      txt('△OPQ:', W - 100, 28, CB, 11, 'center');
      txt('PQ = sinβ', W - 100, 46, CB, 11, 'center', 'italic');
      txt('OQ = cosβ', W - 100, 64, CA, 11, 'center', 'italic');
    }

    // ── OQA box ──
    if (has('oqa_box')) {
      ctx.save();
      ctx.strokeStyle = CA + '88';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.strokeRect(W - 190, 90, 185, 55);
      ctx.restore();
      txt('△OQA:', W - 100, 107, CA, 11, 'center');
      txt('AQ = sinα·cosβ', W - 100, 128, CSIN, 11, 'center', 'italic');
    }

    // ── PQR box ──
    if (has('pqr_box')) {
      ctx.save();
      ctx.strokeStyle = '#c3a5ff88';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.strokeRect(W - 190, 155, 185, 55);
      ctx.restore();
      txt('△PQR:', W - 100, 172, '#c3a5ff', 11, 'center');
      txt('PR = cosα·sinβ', W - 100, 193, '#c3a5ff', 11, 'center', 'italic');
    }

    // ── Final formula ──
    if (has('final_formula')) {
      const fy = 30;
      const fx = W / 2 - 60;
      ctx.save();
      ctx.fillStyle = '#111118ee';
      ctx.fillRect(10, 8, 360, 44);
      ctx.strokeStyle = CSIN + '55';
      ctx.lineWidth = 1;
      ctx.strokeRect(10, 8, 360, 44);
      ctx.restore();
      ctx.save();
      ctx.font = 'italic 13px "JetBrains Mono"';
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'left';
      ctx.fillStyle = CWHITE; ctx.fillText('sin(α+β) = ', 18, fy);
      ctx.fillStyle = CSIN;   ctx.fillText('sinα', 110, fy);
      ctx.fillStyle = CWHITE; ctx.fillText('·', 144, fy);
      ctx.fillStyle = CB;     ctx.fillText('cosβ', 152, fy);
      ctx.fillStyle = CWHITE; ctx.fillText(' + ', 186, fy);
      ctx.fillStyle = CA;     ctx.fillText('cosα', 206, fy);
      ctx.fillStyle = CWHITE; ctx.fillText('·', 240, fy);
      ctx.fillStyle = CB;     ctx.fillText('sinβ', 248, fy);
      ctx.restore();
    }

    // ── Labels ──
    if (has('O_label')) txt('O', OX - 14, OY + 14, CDIM, 13);
    if (has('P_label')) txt('P', P[0] + 10, P[1] - 8, CWHITE, 13);
    if (has('B_label')) txt('B', B[0], OY + 16, CSIN, 13);
    if (has('Q_label')) txt('Q', Qx + 12, Qy + 2, CA, 13);
    if (has('A_label')) txt('A', A[0], OY + 16, CA, 13);
    if (has('R_label')) txt('R', R[0] - 16, R[1] - 2, '#c3a5ff', 13);

  }, [step, alphaDeg, betaDeg]);

  const sinAB = Math.sin(sumR).toFixed(3);
  const cosAB = Math.cos(sumR).toFixed(3);

  return (
    <div className="ch4-root">
      <div className="ch4-left">
        <div className="ch4-top-bar">
          <span className="ch4-chapter-title">Доказательство: sin(α+β)</span>
          <div className="ch4-angle-controls">
            <label>α: <input type="range" min="5" max="60" value={alphaDeg} onChange={e => setAlphaDeg(+e.target.value)} /> <span style={{color:CA}}>{alphaDeg}°</span></label>
            <label>β: <input type="range" min="5" max="60" value={betaDeg} onChange={e => setBetaDeg(+e.target.value)} /> <span style={{color:CB}}>{betaDeg}°</span></label>
          </div>
        </div>

        <div className="ch4-canvas-wrap">
          <canvas ref={canvasRef} width={W} height={H} className="ch4-canvas" />
        </div>

        {/* Step controls */}
        <div className="ch4-step-bar">
          {STEPS.map((s, i) => (
            <button
              key={i}
              className={`ch4-step-dot ${step === i ? 'active' : ''} ${i < step ? 'done' : ''}`}
              onClick={() => setStep(i)}
              title={s.title}
            >
              {i + 1}
            </button>
          ))}
          <button
            className={`ch4-play-btn ${autoPlay ? 'stop' : 'play'}`}
            onClick={() => { setStep(0); setAutoPlay(v => !v); }}
          >
            {autoPlay ? '⏹' : '▶'}
          </button>
        </div>

        {/* Step description */}
        <div className="ch4-step-desc">
          <span className="ch4-step-num">Шаг {step + 1}/{STEPS.length}</span>
          <span className="ch4-step-title" style={{ color: CSIN }}>{STEPS[step].title}</span>
          <p className="ch4-step-text">{STEPS[step].desc}</p>
        </div>
      </div>

      <div className="ch4-right">
        <div className="ch4-panel-header">Тождества сложения</div>

        {/* Live values */}
        <div className="ch4-live">
          <div className="ch4-live-row">
            <span style={{color:CA}}>α = {alphaDeg}°</span>
            <span style={{color:CB}}>β = {betaDeg}°</span>
            <span style={{color:CWHITE}}>α+β = {alphaDeg+betaDeg}°</span>
          </div>
          <div className="ch4-live-row">
            <span style={{color:CSIN}}>sin(α+β) = {sinAB}</span>
          </div>
          <div className="ch4-live-check">
            <span style={{color:CDIM}}>Проверка: sinα·cosβ + cosα·sinβ =</span>
            <span style={{color:CSIN}}>{(Math.sin(alphaR)*Math.cos(betaR) + Math.cos(alphaR)*Math.sin(betaR)).toFixed(3)}</span>
            <span style={{color:'#4a9e6b'}}> ✓</span>
          </div>
        </div>

        {/* All identities */}
        <div className="ch4-identities">
          <div className="ch4-sec-label">Все тождества сложения</div>
          {IDENTITIES.map((id, i) => {
            let val;
            try {
              const a = alphaR, b = betaR;
              if (id.label.startsWith('sin(α+β)')) val = Math.sin(a+b).toFixed(3);
              else if (id.label.startsWith('sin(α−β)')) val = Math.sin(a-b).toFixed(3);
              else if (id.label.startsWith('cos(α+β)')) val = Math.cos(a+b).toFixed(3);
              else if (id.label.startsWith('cos(α−β)')) val = Math.cos(a-b).toFixed(3);
              else val = ((Math.tan(a)+Math.tan(b))/(1-Math.tan(a)*Math.tan(b))).toFixed(3);
            } catch { val = '∞'; }
            return (
              <div className="ch4-id-row" key={i}>
                <span className="ch4-id-label" style={{color: id.color}}>{id.label}</span>
                <span className="ch4-id-formula">{id.formula}</span>
                <span className="ch4-id-val" style={{color: id.color}}>= {val}</span>
              </div>
            );
          })}
        </div>

        {/* Double angle */}
        <div className="ch4-section">
          <div className="ch4-sec-label">Двойной угол (α = β)</div>
          <div className="ch4-dbl-box">
            <div style={{color:CSIN}}>sin(2α) = 2·sinα·cosα</div>
            <div style={{color:CCOS}}>cos(2α) = cos²α − sin²α</div>
            <div style={{color:CCOS}}>cos(2α) = 1 − 2sin²α</div>
            <div style={{color:CCOS}}>cos(2α) = 2cos²α − 1</div>
          </div>
          <div className="ch4-dbl-live">
            При α = {alphaDeg}°:&nbsp;
            <span style={{color:CSIN}}>sin(2α) = {(2*Math.sin(alphaR)*Math.cos(alphaR)).toFixed(3)}</span>
          </div>
        </div>

        {/* Theory */}
        <div className="ch4-section">
          <div className="ch4-sec-label">Как получить cos(α+β)?</div>
          <div className="ch4-theory">
            <p>cos(α+β) = sin(90°−(α+β)) — используем связь sin и cos.</p>
            <p>Подставляем формулу sin разности:</p>
            <p style={{color:CCOS}}>= sin(90°−α)·cosβ − cos(90°−α)·sinβ</p>
            <p style={{color:CCOS}}>= cosα·cosβ − sinα·sinβ</p>
          </div>
        </div>
      </div>
    </div>
  );
}