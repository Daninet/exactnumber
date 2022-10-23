import { RoundingMode } from '../types';
import { ExactNumber } from '../ExactNumber';
import { acosh, asinh, atanh } from './inverse_hyperbolic';

describe('hyperbolic', () => {
  it('asinh', () => {
    const range = [-4, 4];
    for (let i = range[0]; i <= range[1]; i += 0.004) {
      const jsResult = Math.asinh(i).toString();
      const jsRounded = ExactNumber(jsResult).round(10, RoundingMode.TO_ZERO).toFixed(10);
      const exactResult = ExactNumber(asinh(i.toString(), 10)).toFixed(10);
      expect(exactResult).toBe(jsRounded);
    }
  });

  it('asinh 7/12', () => {
    const ASINH_7_OVER_12 = asinh('7/12', 150).toFixed(150);

    for (let i = 1; i < 150; i++) {
      expect(asinh('7/12', i).toFixed(i)).toBe(ASINH_7_OVER_12.slice(0, i + 2));
    }
  });

  it('acosh', () => {
    const range = [1, 8];
    for (let i = range[0]; i <= range[1]; i += 0.004) {
      const jsResult = Math.acosh(i).toString();
      const jsRounded = ExactNumber(jsResult).round(10, RoundingMode.TO_ZERO).toFixed(10);
      const exactResult = ExactNumber(acosh(i.toString(), 10)).toFixed(10);
      expect(exactResult).toBe(jsRounded);
    }
  });

  it('acosh 17/12', () => {
    const ACOSH_17_OVER_12 = acosh('17/12', 150).toFixed(150);

    for (let i = 1; i < 150; i++) {
      expect(acosh('17/12', i).toFixed(i)).toBe(ACOSH_17_OVER_12.slice(0, i + 2));
    }
  });

  it('atanh', () => {
    const range = [-0.9999, 0.9999];
    for (let i = range[0]; i <= range[1]; i += 0.002) {
      const jsResult = Math.atanh(i).toString();
      const jsRounded = ExactNumber(jsResult).round(10, RoundingMode.TO_ZERO).toFixed(10);
      const exactResult = ExactNumber(atanh(i.toString(), 10)).toFixed(10);
      expect(exactResult).toBe(jsRounded);
    }
  });

  it('atanh 7/12', () => {
    const ATANH_7_OVER_12 = atanh('7/12', 150).toFixed(150);

    for (let i = 1; i < 150; i++) {
      expect(atanh('7/12', i).toFixed(i)).toBe(ATANH_7_OVER_12.slice(0, i + 2));
    }
  });
});
