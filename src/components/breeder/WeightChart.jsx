import { useState, useRef } from "react";
import { css } from '../../lib/styles';
import { fmt } from '../../lib/calc';

function WeightChart({ weightLog, targetWeight, showDate }) {
  const W = 600, H = 220, PAD = { top: 20, right: 20, bottom: 48, left: 48 };
  const cW = W - PAD.left - PAD.right;
  const cH = H - PAD.top - PAD.bottom;

  if (!weightLog || weightLog.length === 0) {
    return (
      <div style={{ background: "var(--surface)", borderRadius: 10, padding: "40px", textAlign: "center", color: "var(--muted)", fontSize: "0.82rem" }}>
        No weight entries yet — add a weigh-in to see your chart.
      </div>
    );
  }

  // Build data points — include show date as a future point if provided
  const allDates = weightLog.map(w => new Date(w.date));
  if (showDate) allDates.push(new Date(showDate));
  const minDate = new Date(Math.min(...allDates));
  const maxDate = new Date(Math.max(...allDates));
  const dateRange = Math.max(1, maxDate - minDate);

  const allWeights = weightLog.map(w => parseFloat(w.weight));
  if (targetWeight) allWeights.push(parseFloat(targetWeight));
  const minW = Math.max(0, Math.min(...allWeights) - 10);
  const maxW = Math.max(...allWeights) + 15;
  const weightRange = maxW - minW;

  const toX = (date) => PAD.left + ((new Date(date) - minDate) / dateRange) * cW;
  const toY = (w) => PAD.top + cH - ((parseFloat(w) - minW) / weightRange) * cH;

  // Grid lines
  const yTicks = 5;
  const gridLines = Array.from({ length: yTicks + 1 }, (_, i) => {
    const val = minW + (weightRange / yTicks) * i;
    const y = toY(val);
    return { y, val: Math.round(val) };
  });

  // Actual weight path
  const pts = weightLog.map(w => `${toX(w.date)},${toY(w.weight)}`).join(" L ");
  const pathD = `M ${pts}`;
  const areaD = weightLog.length > 0 ? `M ${toX(weightLog[0].date)},${PAD.top + cH} L ${pts} L ${toX(weightLog[weightLog.length - 1].date)},${PAD.top + cH} Z` : '';

  // Target line
  const targetY = targetWeight ? toY(targetWeight) : null;
  // Show date line
  const showX = showDate ? toX(showDate) : null;
  const todayX = toX(new Date().toISOString().split("T")[0]);

  // X axis labels — sample a few dates
  const xLabels = weightLog.filter((_, i) => i === 0 || i === weightLog.length - 1 || i === Math.floor(weightLog.length / 2));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block", borderRadius: 10, overflow: "visible" }}>
      {/* Grid lines */}
      {gridLines.map(({ y, val }) => (
        <g key={val}>
          <line x1={PAD.left} y1={y} x2={PAD.left + cW} y2={y} stroke="var(--border)" strokeWidth="1" />
          <text x={PAD.left - 6} y={y + 4} textAnchor="end" fontSize="11" fill="#5C6B88" fontFamily="Space Grotesk, sans-serif">{val}</text>
        </g>
      ))}

      {/* Today line */}
      {todayX >= PAD.left && todayX <= PAD.left + cW && (
        <line x1={todayX} y1={PAD.top} x2={todayX} y2={PAD.top + cH} stroke="rgba(59,130,246,0.3)" strokeWidth="1" strokeDasharray="3,3" />
      )}

      {/* Target weight line */}
      {targetY !== null && (
        <g>
          <line x1={PAD.left} y1={targetY} x2={PAD.left + cW} y2={targetY} stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="5,4" />
          <rect x={PAD.left + cW - 80} y={targetY - 16} width={80} height={16} rx="3" fill="rgba(245,158,11,0.15)" />
          <text x={PAD.left + cW - 4} y={targetY - 4} textAnchor="end" fontSize="10" fill="#F59E0B" fontFamily="Space Grotesk, sans-serif" fontWeight="700">Target: {targetWeight} lbs</text>
        </g>
      )}

      {/* Show date line */}
      {showX !== null && showX >= PAD.left && showX <= PAD.left + cW && (
        <g>
          <line x1={showX} y1={PAD.top} x2={showX} y2={PAD.top + cH} stroke="#10B981" strokeWidth="1.5" strokeDasharray="4,3" />
          <rect x={showX - 24} y={PAD.top} width={48} height={16} rx="3" fill="rgba(16,185,129,0.15)" />
          <text x={showX} y={PAD.top + 11} textAnchor="middle" fontSize="10" fill="#10B981" fontFamily="Space Grotesk, sans-serif" fontWeight="700">SHOW</text>
        </g>
      )}

      {/* Area fill */}
      {weightLog.length > 1 && (
        <path d={areaD} fill="url(#weightGrad)" opacity="0.3" />
      )}

      {/* Line */}
      {weightLog.length > 1 && (
        <path d={pathD} fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      )}

      {/* Data points */}
      {weightLog.map((w, i) => (
        <g key={i}>
          <circle cx={toX(w.date)} cy={toY(w.weight)} r="5" fill="#3B82F6" stroke="var(--card-bg)" strokeWidth="2" />
          {i === weightLog.length - 1 && (
            <text x={toX(w.date)} y={toY(w.weight) - 10} textAnchor="middle" fontSize="11" fill="#10B981" fontFamily="Space Grotesk, sans-serif" fontWeight="700">{w.weight} lbs</text>
          )}
        </g>
      ))}

      {/* X axis labels */}
      {xLabels.map((w, i) => (
        <text key={i} x={toX(w.date)} y={PAD.top + cH + 16} textAnchor="middle" fontSize="11" fill="#5C6B88" fontFamily="Space Grotesk, sans-serif">
          {new Date(w.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </text>
      ))}

      {/* Gradient def */}
      <defs>
        <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

//  CUSTOMER PIG DETAIL (FULL FEATURED) 

export { WeightChart };
