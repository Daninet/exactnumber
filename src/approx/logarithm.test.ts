import { RoundingMode } from '../types';
import { ExactNumber } from '../ExactNumber';
import { Fraction } from '../Fraction';

import { log, log10, log2 } from './logarithm';

describe('logarithm', () => {
  it('log', () => {
    for (let i = 0.01; i <= 12; i += 0.04) {
      const jsResult = Math.log(i).toString();
      const jsRounded = ExactNumber(jsResult).round(RoundingMode.TO_ZERO, 11).toFixed(11);
      const exactResult = log(i.toString(), 11);
      expect(exactResult).toBe(jsRounded);
    }
  });

  it('log large', () => {
    for (let i = 10000; i <= 10012; i += 0.04) {
      const jsResult = Math.log(i).toString();
      const jsRounded = ExactNumber(jsResult).round(RoundingMode.TO_ZERO, 10).toFixed(10);
      const exactResult = log(i.toString(), 10);
      expect(exactResult).toBe(jsRounded);
    }
  });

  it('log 3 many digits', () => {
    const ref = log(3n, 120);

    for (let i = 1; i < 120; i++) {
      expect(log(3n, i)).toBe(ref.slice(0, i + 2));
    }
  });

  it('log 73/7 many digits', () => {
    const fraction = new Fraction(73n, 7n);
    const ref = log(fraction, 120);

    for (let i = 1; i < 120; i++) {
      expect(log(fraction, i)).toBe(ref.slice(0, i + 2));
    }
  });

  it('log2', () => {
    for (let i = 0.01; i <= 12; i += 0.04) {
      const jsResult = Math.log2(i).toString();
      const jsRounded = ExactNumber(jsResult).round(RoundingMode.TO_ZERO, 11).toFixed(11);
      const exactResult = log2(i.toString(), 11);
      expect(exactResult).toBe(jsRounded);
    }
  });

  it('log10', () => {
    for (let i = 0.01; i <= 12; i += 0.04) {
      const jsResult = Math.log10(i).toString();
      const jsRounded = ExactNumber(jsResult).round(RoundingMode.TO_ZERO, 11).toFixed(11);
      const exactResult = log10(i.toString(), 11);
      expect(exactResult).toBe(jsRounded);
    }
  });
});
