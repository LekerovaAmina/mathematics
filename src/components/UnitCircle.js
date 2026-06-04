import React, { useRef, useCallback, useEffect, useState } from 'react';
import './UnitCircle.css';

const COLORS = {
  sin: '#ff6b9d',
  cos: '#4ecdc4',
  tan: '#ffd93d',
  cot: '#a8e6cf',
  csc: '#ff9a56',
  sec: '#c3a5ff',
  hyp: '#ffffff',
  angle: '#ff6b6b',
  axis: '#3a3a4a',
  circle: '#4a9e6b',
  grid: '#1e1e2a',
};

const SVG_SIZE = 500;
const CX = SVG_SIZE / 2;
const CY = SVG_SIZE / 2;
const R = 170; // unit circle radius in px

function toSVG(x, y) {
  return [CX + x * R, CY - y * R];
}

function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

export default function UnitCircle({ angleDeg, trig, onAngleChange }) {
  const svgRef = useRef(null);
  const dragging = useRef(false);

  const angleRad = (angleDeg * Math.PI) / 180;
  const px = Math.cos(angleRad);
  const py = Math.sin(angleRad);

  const [ptX, ptY] = toSVG(px, py);
  const [originX, originY] = toSVG(0, 0);
  const [cosX, cosY] = toSVG(px, 0);

  // Tan point: on x=1 vertical line
  const tanPx = 1;
  const tanPy = trig.tan;
  const [tanX, tanY] = toSVG(tanPx, tanPy);

  // Cot point: on y=1 horizontal line  
  const cotPx = trig.cot;
  const cotPy = 1;
  const [cotX, cotY] = toSVG(cotPx, cotPy);

  // Sec: on x-axis at distance sec
  const [secX, secY] = toSVG(trig.sec, 0);

  // Csc: on y-axis at distance csc
  const [cscX, cscY] = toSVG(0, trig.csc);

  const getSVGAngle = useCallback((e) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const scaleX = SVG_SIZE / rect.width;
    const scaleY = SVG_SIZE / rect.height;
    const sx = (clientX - rect.left) * scaleX;
    const sy = (clientY - rect.top) * scaleY;
    const dx = sx - CX;
    const dy = -(sy - CY);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    return ((angle % 360) + 360) % 360;
  }, []);

  const onPointerDown = useCallback((e) => {
    dragging.current = true;
    e.preventDefault();
  }, []);

  const onPointerMove = useCallback((e) => {
    if (!dragging.current) return;
    const angle = getSVGAngle(e);
    if (angle !== null) onAngleChange(angle);
  }, [getSVGAngle, onAngleChange]);

  const onPointerUp = useCallback(() => { dragging.current = false; }, []);

  useEffect(() => {
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    window.addEventListener('touchmove', onPointerMove, { passive: false });
    window.addEventListener('touchend', onPointerUp);
    return () => {
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);
    };
  }, [onPointerMove, onPointerUp]);

  // Arc for angle
  const arcR = 28;
  const arcX = CX + arcR * Math.cos(angleRad);
  const arcY = CY - arcR * Math.sin(angleRad);
  const largeArc = angleDeg > 180 ? 1 : 0;

  // is tan/cot visible (not too extreme)?
  const tanVisible = Math.abs(trig.tan) < 15;
  const cotVisible = Math.abs(trig.cot) < 15;
  const secVisible = Math.abs(trig.sec) < 15;
  const cscVisible = Math.abs(trig.csc) < 15;

  // Dashed lines beyond unit circle
  const DASH = "4 4";

  function dashedLine(x1, y1, x2, y2, color, strokeWidth = 1.5) {
    return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={strokeWidth} strokeDasharray={DASH} opacity="0.7" />;
  }

  // Quadrant labels
  const quadrants = [
    { label: 'I',   x: CX + R * 0.6, y: CY - R * 0.6 },
    { label: 'II',  x: CX - R * 0.6, y: CY - R * 0.6 },
    { label: 'III', x: CX - R * 0.6, y: CY + R * 0.6 },
    { label: 'IV',  x: CX + R * 0.6, y: CY + R * 0.6 },
  ];

  return (
    <div className="uc-wrap">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
        className="uc-svg"
        onClick={(e) => {
          const angle = getSVGAngle(e);
          if (angle !== null) onAngleChange(angle);
        }}
      >
        {/* Grid */}
        {[-2,-1,0,1,2].map(i => (
          <g key={i}>
            <line x1={CX + i * R} y1={20} x2={CX + i * R} y2={SVG_SIZE - 20} stroke={COLORS.grid} strokeWidth={i === 0 ? 0 : 1} />
            <line x1={20} y1={CY + i * R} x2={SVG_SIZE - 20} y2={CY + i * R} stroke={COLORS.grid} strokeWidth={i === 0 ? 0 : 1} />
          </g>
        ))}

        {/* Axes */}
        <line x1={20} y1={CY} x2={SVG_SIZE - 20} y2={CY} stroke={COLORS.axis} strokeWidth={1.5} />
        <line x1={CX} y1={20} x2={CX} y2={SVG_SIZE - 20} stroke={COLORS.axis} strokeWidth={1.5} />

        {/* Axis arrow heads */}
        <polygon points={`${SVG_SIZE-16},${CY} ${SVG_SIZE-24},${CY-5} ${SVG_SIZE-24},${CY+5}`} fill={COLORS.axis} />
        <polygon points={`${CX},16 ${CX-5},24 ${CX+5},24`} fill={COLORS.axis} />

        {/* Axis labels */}
        <text x={SVG_SIZE - 10} y={CY - 8} fill={COLORS.axis} fontSize="12" textAnchor="middle" fontFamily="JetBrains Mono">x</text>
        <text x={CX + 10} y={18} fill={COLORS.axis} fontSize="12" fontFamily="JetBrains Mono">y</text>

        {/* Tick marks at ±1 */}
        {[-1, 1].map(t => (
          <g key={t}>
            <line x1={CX + t * R - 0} y1={CY - 4} x2={CX + t * R} y2={CY + 4} stroke={COLORS.axis} strokeWidth={1} />
            <line x1={CX - 4} y1={CY - t * R} x2={CX + 4} y2={CY - t * R} stroke={COLORS.axis} strokeWidth={1} />
            <text x={CX + t * R} y={CY + 16} fill={COLORS.axis} fontSize="10" textAnchor="middle" fontFamily="JetBrains Mono">{t}</text>
            <text x={CX - 14} y={CY - t * R + 4} fill={COLORS.axis} fontSize="10" textAnchor="middle" fontFamily="JetBrains Mono">{t}</text>
          </g>
        ))}

        {/* Unit circle */}
        <circle cx={CX} cy={CY} r={R} fill="none" stroke={COLORS.circle} strokeWidth={1.5} opacity="0.8" />

        {/* Quadrant labels */}
        {quadrants.map(q => (
          <text key={q.label} x={q.x} y={q.y} fill="#2a2a3a" fontSize="32" fontWeight="bold" textAnchor="middle" dominantBaseline="middle" fontFamily="JetBrains Mono">{q.label}</text>
        ))}

        {/* ── Trig lines ── */}

        {/* sin: vertical from cos-foot to point */}
        <line x1={cosX} y1={cosY} x2={ptX} y2={ptY} stroke={COLORS.sin} strokeWidth={2.5} />
        {/* dashed sin extension if > 1 */}

        {/* cos: horizontal from origin to cos-foot */}
        <line x1={originX} y1={originY} x2={cosX} y2={cosY} stroke={COLORS.cos} strokeWidth={2.5} />

        {/* tan: vertical line at x=1, from x-axis to where hyp extension meets */}
        {tanVisible && (
          <>
            {Math.abs(tanPy) <= 1.05
              ? <line x1={toSVG(1,0)[0]} y1={toSVG(1,0)[1]} x2={tanX} y2={tanY} stroke={COLORS.tan} strokeWidth={2.5} />
              : dashedLine(toSVG(1,0)[0], toSVG(1,0)[1], tanX, tanY, COLORS.tan, 2)}
          </>
        )}

        {/* cot: horizontal line at y=1 */}
        {cotVisible && (
          <>
            {Math.abs(cotPx) <= 1.05
              ? <line x1={toSVG(0,1)[0]} y1={toSVG(0,1)[1]} x2={cotX} y2={cotY} stroke={COLORS.cot} strokeWidth={2.5} />
              : dashedLine(toSVG(0,1)[0], toSVG(0,1)[1], cotX, cotY, COLORS.cot, 2)}
          </>
        )}

        {/* sec: from origin to sec point on x-axis (dashed beyond 1) */}
        {secVisible && (
          <>
            <line x1={originX} y1={originY} x2={toSVG(1,0)[0]} y2={toSVG(1,0)[1]} stroke={COLORS.sec} strokeWidth={1} opacity="0" />
            {dashedLine(toSVG(1,0)[0], toSVG(1,0)[1], secX, secY, COLORS.sec, 2)}
            {/* The actual sec: origin to sec */}
            <line x1={originX} y1={originY} x2={secX} y2={secY} stroke={COLORS.sec} strokeWidth={2} opacity="0.5" />
          </>
        )}

        {/* csc: from origin to csc on y-axis (dashed beyond 1) */}
        {cscVisible && (
          <>
            {dashedLine(toSVG(0,1)[0], toSVG(0,1)[1], cscX, cscY, COLORS.csc, 2)}
            <line x1={originX} y1={originY} x2={cscX} y2={cscY} stroke={COLORS.csc} strokeWidth={2} opacity="0.5" />
          </>
        )}

        {/* Hypotenuse (radius) */}
        <line x1={originX} y1={originY} x2={ptX} y2={ptY} stroke={COLORS.hyp} strokeWidth={2} opacity="0.9" />

        {/* Extension of hyp to tan (dashed) */}
        {tanVisible && (
          dashedLine(ptX, ptY, tanX, tanY, '#888', 1.5)
        )}
        {cotVisible && (
          dashedLine(ptX, ptY, cotX, cotY, '#888', 1.5)
        )}

        {/* Right angle marker at cos-foot */}
        <rect
          x={cosX - 6} y={cosY - (py >= 0 ? 6 : 0)}
          width={6} height={6}
          fill="none"
          stroke="#555"
          strokeWidth={1}
          transform={`rotate(${py < 0 ? 0 : 0} ${cosX} ${cosY})`}
        />

        {/* Angle arc */}
        <path
          d={`M ${CX + arcR} ${CY} A ${arcR} ${arcR} 0 ${largeArc} 0 ${arcX} ${arcY}`}
          fill="none"
          stroke={COLORS.angle}
          strokeWidth={1.5}
        />

        {/* θ label */}
        <text
          x={CX + 40 * Math.cos(angleRad / 2)}
          y={CY - 40 * Math.sin(angleRad / 2)}
          fill={COLORS.angle}
          fontSize="14"
          fontFamily="JetBrains Mono"
          fontStyle="italic"
        >θ</text>

        {/* Hyp label */}
        <text
          x={(originX + ptX) / 2 - 14 * Math.sin(angleRad)}
          y={(originY + ptY) / 2 - 14 * Math.cos(angleRad)}
          fill={COLORS.hyp}
          fontSize="12"
          fontFamily="JetBrains Mono"
          textAnchor="middle"
        >1</text>

        {/* sin label */}
        <text
          x={cosX + (px > 0 ? 20 : -20)}
          y={(cosY + ptY) / 2 + 4}
          fill={COLORS.sin}
          fontSize="12"
          fontFamily="JetBrains Mono"
          textAnchor="middle"
        >sin</text>

        {/* cos label */}
        <text
          x={(originX + cosX) / 2}
          y={cosY + (py >= 0 ? 18 : -8)}
          fill={COLORS.cos}
          fontSize="12"
          fontFamily="JetBrains Mono"
          textAnchor="middle"
        >cos</text>

        {/* tan label */}
        {tanVisible && (
          <text
            x={tanX + 24}
            y={(toSVG(1,0)[1] + tanY) / 2 + 4}
            fill={COLORS.tan}
            fontSize="12"
            fontFamily="JetBrains Mono"
          >tan</text>
        )}

        {/* cot label */}
        {cotVisible && (
          <text
            x={(toSVG(0,1)[0] + cotX) / 2}
            y={cotY - 10}
            fill={COLORS.cot}
            fontSize="12"
            fontFamily="JetBrains Mono"
            textAnchor="middle"
          >cot</text>
        )}

        {/* sec label */}
        {secVisible && (
          <text
            x={(originX + secX) / 2}
            y={secY + 16}
            fill={COLORS.sec}
            fontSize="12"
            fontFamily="JetBrains Mono"
            textAnchor="middle"
          >sec</text>
        )}

        {/* csc label */}
        {cscVisible && (
          <text
            x={cscX - 28}
            y={(originY + cscY) / 2 + 4}
            fill={COLORS.csc}
            fontSize="12"
            fontFamily="JetBrains Mono"
            textAnchor="middle"
          >csc</text>
        )}

        {/* Draggable point */}
        <circle
          cx={ptX}
          cy={ptY}
          r={9}
          fill={COLORS.angle}
          stroke="#fff"
          strokeWidth={2}
          style={{ cursor: 'grab' }}
          onMouseDown={onPointerDown}
          onTouchStart={onPointerDown}
        />
        <circle cx={ptX} cy={ptY} r={4} fill="#fff" />

      </svg>
    </div>
  );
}
