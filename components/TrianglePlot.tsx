import React from 'react';
import { Complex } from '../types';
import { radToDeg } from '../utils/math';

interface TrianglePlotProps {
  real: number;
  imag: number;
  labelReal: string;
  labelImag: string;
  labelHyp: string;
  title: string;
  unit: string;
}

export const TrianglePlot: React.FC<TrianglePlotProps> = ({
  real,
  imag,
  labelReal,
  labelImag,
  labelHyp,
  title,
  unit
}) => {
  // Determine scale
  const maxVal = Math.max(Math.abs(real), Math.abs(imag));
  const scale = maxVal > 0 ? 80 / maxVal : 1; 

  const x = real * scale;
  const y = -imag * scale; // SVG Y is down, so negative imag goes up visually

  // Calculate angle for arc
  const angleRad = Math.atan2(Math.abs(imag), Math.abs(real));
  const arcRadius = 20;
  const arcEndX = Math.cos(angleRad) * arcRadius;
  const arcEndY = -(Math.sin(angleRad) * arcRadius); // Negate Y for SVG

  return (
    <div className="bg-slate-800 p-4 rounded-lg shadow-lg flex flex-col items-center">
      <h3 className="text-lg font-semibold mb-4 text-cyan-400">{title}</h3>
      <svg width="250" height="200" viewBox="-20 -110 240 220" className="overflow-visible">
        {/* Grid lines / Axes */}
        <line x1="-10" y1="0" x2="210" y2="0" stroke="#475569" strokeWidth="1" />
        <line x1="0" y1="-100" x2="0" y2="100" stroke="#475569" strokeWidth="1" />

        {/* Triangle Path */}
        <path
          d={`M 0 0 L ${x} 0 L ${x} ${y} Z`}
          fill="rgba(34, 211, 238, 0.1)"
          stroke="#22d3ee"
          strokeWidth="2"
        />

        {/* Vectors */}
        {/* Real Component */}
        <line x1="0" y1="0" x2={x} y2="0" stroke="#fbbf24" strokeWidth="2" />
        {/* Imag Component */}
        <line x1={x} y1="0" x2={x} y2={y} stroke="#f87171" strokeWidth="2" />
        {/* Hypotenuse */}
        <line x1="0" y1="0" x2={x} y2={y} stroke="#a78bfa" strokeWidth="2" />

        {/* Angle Arc (only if not on axis) */}
        {Math.abs(y) > 1 && Math.abs(x) > 1 && (
            <path
                d={`M ${arcRadius} 0 A ${arcRadius} ${arcRadius} 0 0 ${y < 0 ? 0 : 1} ${arcEndX} ${arcEndY}`}
                stroke="#94a3b8"
                fill="none"
            />
        )}
        
        {/* Labels */}
        <text x={x / 2} y={15} fill="#fbbf24" fontSize="10" textAnchor="middle">
          {labelReal}: {real.toFixed(2)} {unit}
        </text>
        <text x={x + 5} y={y / 2} fill="#f87171" fontSize="10" textAnchor="start">
          {labelImag}: {Math.abs(imag).toFixed(2)} {imag < 0 ? 'Cap' : 'Ind'}
        </text>
        <text x={x / 2 - 10} y={y / 2 - 10} fill="#a78bfa" fontSize="10" textAnchor="end">
          {labelHyp}: {Math.sqrt(real*real + imag*imag).toFixed(2)} {unit}
        </text>
        
        {Math.abs(y) > 1 && Math.abs(x) > 1 && (
             <text x={40} y={y < 0 ? -10 : 10} fill="#94a3b8" fontSize="10">
                 φ = {Math.abs(radToDeg(Math.atan2(imag, real))).toFixed(1)}°
             </text>
        )}

      </svg>
    </div>
  );
};