import React from 'react';
import { CircuitAnalysis, CircuitSource } from '../types';
import { TrianglePlot } from './TrianglePlot';
import { complexToPolar, radToDeg } from '../utils/math';

interface Props {
  analysis: CircuitAnalysis;
  source: CircuitSource;
}

export const ResultsPanel: React.FC<Props> = ({ analysis, source }) => {
  const { totalImpedance, totalCurrentRMS, totalCurrentAngle, powerFactor, activePower, reactivePower, apparentPower, phaseDiff, impedanceResults } = analysis;

  const zPolar = complexToPolar(totalImpedance);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
      
      {/* Scalar Results */}
      <div className="bg-slate-800 p-6 rounded-lg shadow-lg border-t-4 border-cyan-500">
        <h2 className="text-xl font-bold mb-4 text-white">Resultados Generales</h2>
        
        <div className="grid grid-cols-2 gap-y-4 gap-x-6">
            <div className="col-span-2 md:col-span-1">
                <p className="text-slate-400 text-sm">Impedancia Total (Zₜ)</p>
                <p className="text-lg font-mono text-cyan-300">
                    {zPolar.magnitude.toFixed(2)} Ω ∠ {zPolar.angle.toFixed(1)}°
                </p>
                <p className="text-xs text-slate-500 font-mono">
                    {totalImpedance.real.toFixed(2)} {totalImpedance.imag >= 0 ? '+' : ''} j{totalImpedance.imag.toFixed(2)} Ω
                </p>
            </div>

            <div className="col-span-2 md:col-span-1">
                <p className="text-slate-400 text-sm">Intensidad Total (I)</p>
                <p className="text-lg font-mono text-yellow-300">
                    {totalCurrentRMS.toFixed(3)} A ∠ {totalCurrentAngle.toFixed(1)}°
                </p>
            </div>

            <div>
                <p className="text-slate-400 text-sm">Factor de Potencia (FP)</p>
                <p className="text-xl font-semibold text-white">
                    {Math.abs(powerFactor).toFixed(3)} 
                    <span className="text-xs font-normal ml-1 text-slate-400">
                        ({phaseDiff < 0 ? 'En adelanto' : 'En retraso'})
                    </span>
                </p>
            </div>

            <div>
                <p className="text-slate-400 text-sm">Desfase (V - I)</p>
                <p className="text-xl font-semibold text-white">{phaseDiff.toFixed(2)}°</p>
            </div>
            
             <div className="col-span-2 border-t border-slate-700 pt-2 mt-2">
                <p className="text-slate-400 text-sm mb-1">Potencias</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-slate-900 p-2 rounded">
                        <span className="block text-xs text-slate-500">Activa (P)</span>
                        <span className="font-mono text-cyan-400">{activePower.toFixed(2)} W</span>
                    </div>
                    <div className="bg-slate-900 p-2 rounded">
                        <span className="block text-xs text-slate-500">Reactiva (Q)</span>
                        <span className="font-mono text-red-400">{reactivePower.toFixed(2)} VAR</span>
                    </div>
                    <div className="bg-slate-900 p-2 rounded">
                        <span className="block text-xs text-slate-500">Aparente (S)</span>
                        <span className="font-mono text-purple-400">{apparentPower.toFixed(2)} VA</span>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Triangles Visualization */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TrianglePlot 
            title="Triángulo de Impedancias"
            real={totalImpedance.real}
            imag={totalImpedance.imag}
            labelReal="R"
            labelImag="X"
            labelHyp="Z"
            unit="Ω"
          />
          <TrianglePlot 
            title="Triángulo de Potencias"
            real={activePower}
            imag={reactivePower}
            labelReal="P"
            labelImag="Q"
            labelHyp="S"
            unit="" // Units handled in label logic mostly, or we can improve the component
          />
      </div>

      {/* Component Details */}
      <div className="col-span-1 lg:col-span-2 bg-slate-800 p-6 rounded-lg shadow-lg">
         <h2 className="text-xl font-bold mb-4 text-white">Análisis por Componente</h2>
         <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-900 text-slate-400 uppercase font-medium">
                    <tr>
                        <th className="p-3">Componente</th>
                        <th className="p-3">Impedancia (Z)</th>
                        <th className="p-3">Tensión (V)</th>
                        <th className="p-3">Desfase Local</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                    {impedanceResults.map((res, idx) => {
                        const zPol = complexToPolar(res.z);
                        return (
                            <tr key={res.id} className="hover:bg-slate-700/50">
                                <td className="p-3 font-semibold text-cyan-300">Z{idx + 1}</td>
                                <td className="p-3 font-mono">
                                    {zPol.magnitude.toFixed(2)}Ω ∠{zPol.angle.toFixed(1)}°
                                </td>
                                <td className="p-3 font-mono text-yellow-300">
                                    {res.vRMS.toFixed(2)}V ∠{res.vAngle.toFixed(1)}°
                                </td>
                                <td className="p-3">
                                    {(res.vAngle - totalCurrentAngle).toFixed(1)}°
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};
