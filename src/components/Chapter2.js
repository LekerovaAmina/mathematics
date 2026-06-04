import React, { useState, useRef, useCallback, useEffect } from 'react';
import './Chapter2.css';

const SVG_SIZE = 480;
const CX = SVG_SIZE / 2;
const CY = SVG_SIZE / 2;
const R = 160;

function fmt2(v) { return isFinite(v) ? v.toFixed(2) : '∞'; }

export default function Chapter2() {
  const [angleDeg, setAngleDeg] = useState(115);
  const svgRef = useRef(null);
  const dragging = useRef(false);

  const angleRad = (angleDeg * Math.PI) / 180;
  const arcLength = angleRad; // r=1, so arc = theta
  const piRatio = (angleRad / Math.PI).toFixed(2);

  const px = Math.cos(angleRad);
  const py = Math.sin(angleRad);
  const ptX = CX + px * R;
  const ptY = CY - py * R;

  // Arc path for the angle sector
  const largeArc = angleDeg > 180 ? 1 : 0;
  const arcEndX = CX + R * Math.cos(angleRad);
  const arcEndY = CY - R * Math.sin(angleRad);

  // "Unwrapped" arc length bar
  const barMaxWidth = 300;
  const barWidth = Math.min((arcLength / (2 * Math.PI)) * barMaxWidth, barMaxWidth);

  const getSVGAngle = useCallback((e) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    const scaleX = SVG_SIZE / rect.width;
    const scaleY = SVG_SIZE / rect.height;
    const dx = (cx - rect.left) * scaleX - CX;
    const dy = -((cy - rect.top) * scaleY - CY);
    const a = Math.atan2(dy, dx) * (180 / Math.PI);
    return ((a % 360) + 360) % 360;
  }, []);

  const onPointerDown = useCallback((e) => { dragging.current = true; e.preventDefault(); }, []);
  const onPointerMove = useCallback((e) => {
    if (!dragging.current) return;
    const a = getSVGAngle(e);
    if (a !== null) setAngleDeg(a);
  }, [getSVGAngle]);
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

  // Key radian values
  const keyAngles = [
    { deg: 0,   label: '0',       color: '#aaa' },
    { deg: 30,  label: 'π/6',     color: '#ff9a56' },
    { deg: 45,  label: 'π/4',     color: '#ffd93d' },
    { deg: 60,  label: 'π/3',     color: '#4ecdc4' },
    { deg: 90,  label: 'π/2',     color: '#ff6b9d' },
    { deg: 120, label: '2π/3',    color: '#c3a5ff' },
    { deg: 135, label: '3π/4',    color: '#a8e6cf' },
    { deg: 150, label: '5π/6',    color: '#ff9a56' },
    { deg: 180, label: 'π',       color: '#ff6b6b' },
    { deg: 270, label: '3π/2',    color: '#ff6b9d' },
    { deg: 360, label: '2π',      color: '#4ecdc4' },
  ];

  return (
    <div className="ch2-root">
      <div className="ch2-left">
        <div className="ch2-title-row">
          <span className="ch2-title">Радиан</span>
          <span className="ch2-subtitle">— единица измерения угла</span>
        </div>

        <svg
          ref={svgRef}
          viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
          className="ch2-svg"
          onClick={(e) => { const a = getSVGAngle(e); if (a !== null) setAngleDeg(a); }}
        >
          {/* Background grid circles */}
          {[0.25, 0.5, 0.75, 1].map(f => (
            <circle key={f} cx={CX} cy={CY} r={R * f} fill="none" stroke="#1e1e2a" strokeWidth={1} />
          ))}

          {/* Axes */}
          <line x1={CX - R - 20} y1={CY} x2={CX + R + 20} y2={CY} stroke="#3a3a4a" strokeWidth={1.5} />
          <line x1={CX} y1={CY - R - 20} x2={CX} y2={CY + R + 20} stroke="#3a3a4a" strokeWidth={1.5} />

          {/* Tick labels at ±1 */}
          <text x={CX + R + 6} y={CY + 14} fill="#3a3a4a" fontSize="11" fontFamily="JetBrains Mono">1</text>
          <text x={CX + 5} y={CY - R - 6} fill="#3a3a4a" fontSize="11" fontFamily="JetBrains Mono">1</text>

          {/* Key angle markers on circle */}
          {keyAngles.map(ka => {
            const r = (ka.deg * Math.PI) / 180;
            const mx = CX + Math.cos(r) * (R + 16);
            const my = CY - Math.sin(r) * (R + 16);
            const tx = CX + Math.cos(r) * (R + 30);
            const ty = CY - Math.sin(r) * (R + 30);
            return (
              <g key={ka.deg}>
                <circle cx={CX + Math.cos(r) * R} cy={CY - Math.sin(r) * R} r={2} fill={ka.color} opacity="0.5" />
                <text x={tx} y={ty + 4} fill={ka.color} fontSize="9" textAnchor="middle" fontFamily="JetBrains Mono" opacity="0.7">{ka.label}</text>
              </g>
            );
          })}

          {/* Main unit circle */}
          <circle cx={CX} cy={CY} r={R} fill="none" stroke="#4a9e6b" strokeWidth={1.5} opacity="0.6" />

          {/* Arc sector fill */}
          <path
            d={`M ${CX} ${CY} L ${CX + R} ${CY} A ${R} ${R} 0 ${largeArc} 0 ${arcEndX} ${arcEndY} Z`}
            fill="#ff6b6b"
            opacity="0.08"
          />

          {/* Arc highlight (the actual arc = rθ) */}
          <path
            d={`M ${CX + R} ${CY} A ${R} ${R} 0 ${largeArc} 0 ${arcEndX} ${arcEndY}`}
            fill="none"
            stroke="#ff6b6b"
            strokeWidth={3}
          />

          {/* Radius line to point */}
          <line x1={CX} y1={CY} x2={ptX} y2={ptY} stroke="#fff" strokeWidth={2} opacity="0.8" />

          {/* Base radius (r=1 along x) */}
          <line x1={CX} y1={CY} x2={CX + R} y2={CY} stroke="#fff" strokeWidth={1.5} strokeDasharray="4 3" opacity="0.4" />

          {/* Arc length = radius indicator */}
          {/* Show r=1 chord on circle to illustrate 1 radian */}
          {angleDeg >= 55 && angleDeg <= 65 && (
            <text x={CX + 20} y={CY - R / 2} fill="#ffd93d" fontSize="12" fontFamily="JetBrains Mono">≈ 1 рад</text>
          )}

          {/* Angle arc small */}
          <path
            d={`M ${CX + 30} ${CY} A 30 30 0 ${largeArc} 0 ${CX + 30 * Math.cos(angleRad)} ${CY - 30 * Math.sin(angleRad)}`}
            fill="none" stroke="#ff6b6b" strokeWidth={2}
          />

          {/* θ label */}
          <text
            x={CX + 45 * Math.cos(angleRad / 2)}
            y={CY - 45 * Math.sin(angleRad / 2) + 4}
            fill="#ff6b6b"
            fontSize="14"
            fontFamily="JetBrains Mono"
            fontStyle="italic"
          >θ</text>

          {/* Arc length label */}
          <text
            x={(CX + arcEndX) / 2 + 10 * Math.cos(angleRad / 2 + Math.PI / 2)}
            y={(CY + arcEndY) / 2 - 10 * Math.sin(angleRad / 2 + Math.PI / 2) + 4}
            fill="#ff6b6b"
            fontSize="11"
            fontFamily="JetBrains Mono"
            textAnchor="middle"
          >rθ</text>

          {/* Draggable point */}
          <circle
            cx={ptX} cy={ptY} r={9}
            fill="#ff6b6b" stroke="#fff" strokeWidth={2}
            style={{ cursor: 'grab' }}
            onMouseDown={onPointerDown}
            onTouchStart={onPointerDown}
          />
          <circle cx={ptX} cy={ptY} r={4} fill="#fff" />
        </svg>

        {/* Arc length bar */}
        <div className="ch2-bar-wrap">
          <div className="ch2-bar-label">Длина дуги (при r=1):</div>
          <div className="ch2-bar-track">
            <div className="ch2-bar-fill" style={{ width: `${(arcLength / (2 * Math.PI)) * 100}%` }} />
            <div className="ch2-bar-pi" style={{ left: '25%' }}>π/2</div>
            <div className="ch2-bar-pi" style={{ left: '50%' }}>π</div>
            <div className="ch2-bar-pi" style={{ left: '75%' }}>3π/2</div>
            <div className="ch2-bar-pi" style={{ left: '100%' }}>2π</div>
          </div>
          <div className="ch2-bar-value">{fmt2(arcLength)} рад = {piRatio}π</div>
        </div>
      </div>

      <div className="ch2-right">
        <div className="ch2-panel-title">Данные</div>

        <div className="ch2-section">
          <div className="ch2-sec-label">Угол</div>
          <div className="ch2-data-row">
            <span className="ch2-key">θ в градусах</span>
            <span className="ch2-val" style={{ color: '#ff6b6b' }}>{fmt2(angleDeg)}°</span>
          </div>
          <div className="ch2-data-row">
            <span className="ch2-key">θ в радианах</span>
            <span className="ch2-val" style={{ color: '#ff9a56' }}>{fmt2(angleRad)} рад</span>
          </div>
          <div className="ch2-data-row">
            <span className="ch2-key">в долях π</span>
            <span className="ch2-val" style={{ color: '#ffd93d' }}>{piRatio}π</span>
          </div>
        </div>

        <div className="ch2-section">
          <div className="ch2-sec-label">Формулы</div>
          <div className="ch2-formula-box">
            <div className="ch2-formula-line">
              <span style={{ color: '#ff9a56' }}>θ</span> (рад) ={' '}
              <span style={{ color: '#ff6b6b' }}>θ°</span> × π / 180
            </div>
            <div className="ch2-formula-result">
              = {fmt2(angleDeg)}° × π / 180 = <span style={{ color: '#ff9a56', fontWeight: 700 }}>{fmt2(angleRad)}</span>
            </div>
          </div>
          <div className="ch2-formula-box">
            <div className="ch2-formula-line">
              <span style={{ color: '#ff6b6b' }}>θ°</span> ={' '}
              <span style={{ color: '#ff9a56' }}>θ</span> × 180 / π
            </div>
            <div className="ch2-formula-result">
              = {fmt2(angleRad)} × 180 / π = <span style={{ color: '#ff6b6b', fontWeight: 700 }}>{fmt2(angleDeg)}°</span>
            </div>
          </div>
          <div className="ch2-formula-box">
            <div className="ch2-formula-line">Длина дуги: <span style={{ color: '#ff6b6b' }}>s</span> = r·θ</div>
            <div className="ch2-formula-result">
              При r=1: s = 1 × {fmt2(angleRad)} = <span style={{ color: '#ff6b6b', fontWeight: 700 }}>{fmt2(arcLength)}</span>
            </div>
          </div>
        </div>

        <div className="ch2-section">
          <div className="ch2-sec-label">Таблица ключевых углов</div>
          <table className="ch2-table">
            <thead>
              <tr>
                <th>Градусы</th>
                <th>Радианы</th>
                <th>В π</th>
              </tr>
            </thead>
            <tbody>
              {keyAngles.filter(k => k.deg <= 360).map(ka => (
                <tr
                  key={ka.deg}
                  className={Math.abs(angleDeg - ka.deg) < 5 ? 'active-row' : ''}
                  onClick={() => setAngleDeg(ka.deg)}
                  style={{ cursor: 'pointer' }}
                >
                  <td style={{ color: ka.color }}>{ka.deg}°</td>
                  <td style={{ color: '#aaa' }}>{fmt2((ka.deg * Math.PI) / 180)}</td>
                  <td style={{ color: '#aaa' }}>{ka.label}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="ch2-section">
          <div className="ch2-sec-label">Что такое радиан?</div>
          <div className="ch2-theory">
            <p>Радиан — угол, при котором <span style={{ color: '#ff6b6b' }}>длина дуги</span> равна <span style={{ color: '#fff' }}>радиусу</span> окружности.</p>
            <p>Полный оборот = <span style={{ color: '#4ecdc4' }}>2π ≈ 6.28</span> рад = 360°</p>
            <p>Половина оборота = <span style={{ color: '#ff6b9d' }}>π ≈ 3.14</span> рад = 180°</p>
            <p>Четверть оборота = <span style={{ color: '#ffd93d' }}>π/2 ≈ 1.57</span> рад = 90°</p>
          </div>
        </div>
      </div>
    </div>
  );
}
