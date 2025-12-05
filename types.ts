export interface Complex {
  real: number;
  imag: number;
}

export type InputMode = 'rectangular' | 'polar' | 'rlc';

export interface ImpedanceState {
  id: string;
  mode: InputMode;
  // Rectangular
  resistance: number;
  reactance: number;
  // Polar
  magnitude: number;
  angle: number;
  // RLC
  rVal: number;
  lVal: number; // Henrys
  cVal: number; // Farads
}

export interface CircuitSource {
  voltageRMS: number;
  frequency: number;
}

export interface ImpedanceResult {
  id: string;
  z: Complex; // The actual impedance used in calculation
  vDrop: Complex; // Voltage drop across this impedance
  vRMS: number;
  vAngle: number;
}

export interface CircuitAnalysis {
  totalImpedance: Complex;
  totalCurrent: Complex;
  totalCurrentRMS: number;
  totalCurrentAngle: number;
  powerFactor: number;
  activePower: number; // P (Watts)
  reactivePower: number; // Q (VAR)
  apparentPower: number; // S (VA)
  phaseDiff: number; // Difference between V and I
  impedanceResults: ImpedanceResult[];
}
