import { Complex, ImpedanceState } from '../types';

export const degToRad = (deg: number) => deg * (Math.PI / 180);
export const radToDeg = (rad: number) => rad * (180 / Math.PI);

export const complexFromPolar = (mag: number, angleDeg: number): Complex => ({
  real: mag * Math.cos(degToRad(angleDeg)),
  imag: mag * Math.sin(degToRad(angleDeg)),
});

export const complexToPolar = (c: Complex) => ({
  magnitude: Math.sqrt(c.real * c.real + c.imag * c.imag),
  angle: radToDeg(Math.atan2(c.imag, c.real)),
});

export const addComplex = (a: Complex, b: Complex): Complex => ({
  real: a.real + b.real,
  imag: a.imag + b.imag,
});

export const multiplyComplex = (a: Complex, b: Complex): Complex => ({
  real: a.real * b.real - a.imag * b.imag,
  imag: a.real * b.imag + a.imag * b.real,
});

export const divideComplex = (a: Complex, b: Complex): Complex => {
  const denominator = b.real * b.real + b.imag * b.imag;
  if (denominator === 0) return { real: 0, imag: 0 };
  return {
    real: (a.real * b.real + a.imag * b.imag) / denominator,
    imag: (a.imag * b.real - a.real * b.imag) / denominator,
  };
};

export const getImpedanceValue = (item: ImpedanceState, frequency: number): Complex => {
  if (item.mode === 'rectangular') {
    return { real: item.resistance, imag: item.reactance };
  } else if (item.mode === 'polar') {
    return complexFromPolar(item.magnitude, item.angle);
  } else {
    // RLC Mode
    const omega = 2 * Math.PI * frequency;
    const xl = omega * item.lVal;
    const xc = item.cVal > 0 ? 1 / (omega * item.cVal) : 0;
    return { real: item.rVal, imag: xl - xc };
  }
};

// Helper to deduce L and C from a given Impedance (Z)
// Returns { r, l, c } where l or c might be 0 depending on reactance sign
export const deduceRLC = (z: Complex, frequency: number) => {
  const omega = 2 * Math.PI * frequency;
  const r = z.real;
  let l = 0;
  let c = 0;

  if (z.imag > 0 && omega > 0) {
    // Inductive
    l = z.imag / omega;
  } else if (z.imag < 0 && omega > 0) {
    // Capacitive
    // Xc = -1 / (omega * C) -> we use magnitude for C calculation usually, 
    // but here z.imag is negative. -1/wC = z.imag => C = -1/(omega * z.imag)
    c = -1 / (omega * z.imag);
  }

  return { r, l, c };
};
