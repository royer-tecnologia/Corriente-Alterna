import React from 'react';
import { ImpedanceState, CircuitSource, InputMode } from '../types';
import { Trash2, Calculator, RefreshCw } from 'lucide-react';
import { deduceRLC, getImpedanceValue } from '../utils/math';

interface Props {
  data: ImpedanceState;
  source: CircuitSource;
  index: number;
  onChange: (id: string, updates: Partial<ImpedanceState>) => void;
  onRemove: (id: string) => void;
}

export const ImpedanceRow: React.FC<Props> = ({ data, source, index, onChange, onRemove }) => {
  
  // Helpers for inputs
  const handleNumChange = (field: keyof ImpedanceState, val: string) => {
    const num = parseFloat(val);
    onChange(data.id, { [field]: isNaN(num) ? 0 : num });
  };

  const switchMode = (newMode: InputMode) => {
    // When switching, try to preserve the actual Z value by converting
    const currentZ = getImpedanceValue(data, source.frequency);
    const updates: Partial<ImpedanceState> = { mode: newMode };

    if (newMode === 'rectangular') {
      updates.resistance = currentZ.real;
      updates.reactance = currentZ.imag;
    } else if (newMode === 'polar') {
      updates.magnitude = Math.sqrt(currentZ.real ** 2 + currentZ.imag ** 2);
      updates.angle = (Math.atan2(currentZ.imag, currentZ.real) * 180) / Math.PI;
    } else if (newMode === 'rlc') {
       const rlc = deduceRLC(currentZ, source.frequency);
       updates.rVal = rlc.r;
       updates.lVal = rlc.l;
       updates.cVal = rlc.c;
    }

    onChange(data.id, updates);
  };

  return (
    <div className="bg-slate-800 p-4 rounded-md border border-slate-700 shadow-sm flex flex-col gap-3 relative">
      <div className="flex justify-between items-center border-b border-slate-700 pb-2">
        <h3 className="font-semibold text-cyan-400">Impedancia Z{index + 1}</h3>
        <div className="flex items-center gap-2">
           <div className="flex bg-slate-900 rounded p-1 text-xs">
              <button 
                onClick={() => switchMode('rectangular')}
                className={`px-2 py-1 rounded ${data.mode === 'rectangular' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >Rect</button>
              <button 
                onClick={() => switchMode('polar')}
                className={`px-2 py-1 rounded ${data.mode === 'polar' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >Polar</button>
              <button 
                onClick={() => switchMode('rlc')}
                className={`px-2 py-1 rounded ${data.mode === 'rlc' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >RLC</button>
           </div>
           <button onClick={() => onRemove(data.id)} className="text-red-400 hover:text-red-300 p-1">
             <Trash2 size={18} />
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.mode === 'rectangular' && (
          <>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Resistencia (Ω)</label>
              <input 
                type="number" 
                step="0.1"
                value={data.resistance}
                onChange={(e) => handleNumChange('resistance', e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1 text-sm focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Reactancia (jΩ)</label>
              <input 
                type="number" 
                step="0.1"
                value={data.reactance}
                onChange={(e) => handleNumChange('reactance', e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1 text-sm focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </>
        )}

        {data.mode === 'polar' && (
          <>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Magnitud (|Z|)</label>
              <input 
                type="number" 
                step="0.1"
                min="0"
                value={data.magnitude}
                onChange={(e) => handleNumChange('magnitude', e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1 text-sm focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Ángulo (°)</label>
              <input 
                type="number" 
                step="0.1"
                value={data.angle}
                onChange={(e) => handleNumChange('angle', e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1 text-sm focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </>
        )}

        {data.mode === 'rlc' && (
          <>
             <div className="col-span-2 grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">R (Ω)</label>
                  <input 
                    type="number" step="0.1" value={data.rVal}
                    onChange={(e) => handleNumChange('rVal', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1 text-sm focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">L (H)</label>
                  <input 
                    type="number" step="0.001" value={data.lVal}
                    onChange={(e) => handleNumChange('lVal', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1 text-sm focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">C (F)</label>
                  <input 
                    type="number" step="0.000001" value={data.cVal}
                    onChange={(e) => handleNumChange('cVal', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1 text-sm focus:border-cyan-500 focus:outline-none"
                  />
                </div>
             </div>
             <div className="col-span-2 text-xs text-slate-500 italic">
               Nota: Reactancias recalculadas dinámicamente según frecuencia.
             </div>
          </>
        )}
      </div>

      {/* Quick Info Display for non-active modes */}
      <div className="mt-2 pt-2 border-t border-slate-700/50 flex justify-between text-xs text-slate-400">
          {data.mode !== 'rlc' ? (
              <span>Equiv RLC @ {source.frequency}Hz: 
                  R={deduceRLC(getImpedanceValue(data, source.frequency), source.frequency).r.toFixed(2)}Ω, 
                  L={deduceRLC(getImpedanceValue(data, source.frequency), source.frequency).l.toExponential(2)}H, 
                  C={deduceRLC(getImpedanceValue(data, source.frequency), source.frequency).c.toExponential(2)}F
              </span>
          ) : (
            <span>
              Z = {getImpedanceValue(data, source.frequency).real.toFixed(2)} 
              {getImpedanceValue(data, source.frequency).imag >= 0 ? '+' : ''}
              j{getImpedanceValue(data, source.frequency).imag.toFixed(2)} Ω
            </span>
          )}
      </div>
    </div>
  );
};
