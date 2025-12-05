import React, { useState, useEffect, useMemo } from 'react';
import { ImpedanceState, CircuitSource, CircuitAnalysis, ImpedanceResult } from './types';
import { ImpedanceRow } from './components/ImpedanceRow';
import { ResultsPanel } from './components/ResultsPanel';
import { PlusCircle, Activity, Settings, Zap } from 'lucide-react';
import { addComplex, complexToPolar, getImpedanceValue, multiplyComplex, divideComplex, complexFromPolar, radToDeg } from './utils/math';

const App: React.FC = () => {
  // --- State ---
  const [source, setSource] = useState<CircuitSource>({
    voltageRMS: 230,
    frequency: 50,
  });

  const [impedances, setImpedances] = useState<ImpedanceState[]>([
    { id: '1', mode: 'rectangular', resistance: 10, reactance: 0, magnitude: 10, angle: 0, rVal: 10, lVal: 0, cVal: 0 },
  ]);

  // --- Handlers ---
  const handleSourceChange = (key: keyof CircuitSource, value: string) => {
    const num = parseFloat(value);
    setSource(prev => ({ ...prev, [key]: isNaN(num) ? 0 : num }));
  };

  const addImpedance = () => {
    const newId = Date.now().toString();
    setImpedances(prev => [
      ...prev,
      { 
        id: newId, 
        mode: 'rectangular', 
        resistance: 10, 
        reactance: 10, 
        magnitude: 14.14, 
        angle: 45,
        rVal: 10,
        lVal: 0.03, // approx for 50hz
        cVal: 0 
      }
    ]);
  };

  const removeImpedance = (id: string) => {
    setImpedances(prev => prev.filter(i => i.id !== id));
  };

  const updateImpedance = (id: string, updates: Partial<ImpedanceState>) => {
    setImpedances(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  // --- Calculation Logic ---
  const analysis: CircuitAnalysis | null = useMemo(() => {
    if (impedances.length === 0) return null;

    // 1. Calculate Total Impedance (Zt)
    let zTotal = { real: 0, imag: 0 };
    const zValues = impedances.map(imp => getImpedanceValue(imp, source.frequency));

    zValues.forEach(z => {
      zTotal = addComplex(zTotal, z);
    });

    // 2. Calculate Total Current (I = V / Zt)
    // Assume Source Voltage angle is 0 degrees reference
    const vSourceComplex = { real: source.voltageRMS, imag: 0 };
    const iTotalComplex = divideComplex(vSourceComplex, zTotal);
    const iPolar = complexToPolar(iTotalComplex);

    // 3. Calculate Power
    // S = V * I_conjugate
    const iConjugate = { real: iTotalComplex.real, imag: -iTotalComplex.imag };
    const sComplex = multiplyComplex(vSourceComplex, iConjugate); // S = P + jQ
    
    // 4. Calculate Individual Voltages
    const itemResults: ImpedanceResult[] = zValues.map((z, idx) => {
        const vDrop = multiplyComplex(iTotalComplex, z);
        const vPolar = complexToPolar(vDrop);
        return {
            id: impedances[idx].id,
            z: z,
            vDrop: vDrop,
            vRMS: vPolar.magnitude,
            vAngle: vPolar.angle
        };
    });

    // Phase difference (Voltage Angle (0) - Current Angle)
    // Positive phi means lagging current (Inductive)
    // Negative phi means leading current (Capacitive)
    // But physically, phase diff is often expressed as abs value or explicitly stated
    // Here we use angle(V) - angle(I). Since V is ref 0, it is -angle(I).
    const phaseDiff = 0 - iPolar.angle; 

    return {
      totalImpedance: zTotal,
      totalCurrent: iTotalComplex,
      totalCurrentRMS: iPolar.magnitude,
      totalCurrentAngle: iPolar.angle,
      powerFactor: Math.cos(phaseDiff * (Math.PI / 180)),
      activePower: sComplex.real,
      reactivePower: sComplex.imag,
      apparentPower: Math.sqrt(sComplex.real**2 + sComplex.imag**2),
      phaseDiff: phaseDiff,
      impedanceResults: itemResults
    };

  }, [impedances, source]);

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 p-6 sticky top-0 z-50 bg-opacity-95 backdrop-blur">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-cyan-500 rounded-lg shadow-lg shadow-cyan-500/20">
                <Zap className="text-white" size={24} />
             </div>
             <div>
               <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                 AC Circuit Master
               </h1>
               <p className="text-xs text-slate-400">Simulador de Circuitos Serie RLC</p>
             </div>
          </div>
          
          {/* Source Config */}
          <div className="flex items-center gap-4 bg-slate-800 p-3 rounded-lg border border-slate-700">
             <div className="flex items-center gap-2">
                <Settings size={16} className="text-slate-400" />
                <span className="text-sm font-semibold text-slate-300 mr-2">Fuente:</span>
             </div>
             <div>
                <label className="text-xs text-slate-500 block">Tensión (Vrms)</label>
                <input 
                  type="number" 
                  value={source.voltageRMS}
                  onChange={(e) => handleSourceChange('voltageRMS', e.target.value)}
                  className="w-20 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-sm text-cyan-300 focus:outline-none focus:border-cyan-500"
                />
             </div>
             <div>
                <label className="text-xs text-slate-500 block">Frecuencia (Hz)</label>
                <input 
                   type="number"
                   value={source.frequency}
                   onChange={(e) => handleSourceChange('frequency', e.target.value)}
                   className="w-20 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-sm text-cyan-300 focus:outline-none focus:border-cyan-500"
                />
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-6 grid grid-cols-1 xl:grid-cols-3 gap-8 mt-4">
        
        {/* Left Column: Editor */}
        <div className="xl:col-span-1 space-y-6">
           <div className="flex justify-between items-center">
             <h2 className="text-xl font-bold flex items-center gap-2">
               <Activity size={20} className="text-cyan-400" />
               Impedancias
             </h2>
             <span className="text-sm bg-slate-800 px-2 py-1 rounded text-slate-400">
               {impedances.length} Elementos
             </span>
           </div>
           
           <div className="space-y-4">
             {impedances.map((imp, index) => (
               <ImpedanceRow 
                  key={imp.id} 
                  index={index}
                  data={imp} 
                  source={source} 
                  onChange={updateImpedance}
                  onRemove={removeImpedance}
               />
             ))}
           </div>

           <button 
             onClick={addImpedance}
             className="w-full py-3 border-2 border-dashed border-slate-700 rounded-lg text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50 hover:bg-slate-800/50 transition-all flex justify-center items-center gap-2 font-medium"
           >
             <PlusCircle size={20} />
             Añadir Impedancia
           </button>
        </div>

        {/* Right Column: Results */}
        <div className="xl:col-span-2">
            {impedances.length > 0 && analysis ? (
                <ResultsPanel analysis={analysis} source={source} />
            ) : (
                <div className="h-64 flex flex-col items-center justify-center text-slate-500 bg-slate-800/30 rounded-lg border border-slate-800">
                    <Activity size={48} className="mb-4 opacity-20" />
                    <p>Añade impedancias para ver el análisis del circuito.</p>
                </div>
            )}
        </div>

      </main>
    </div>
  );
};

export default App;
