import { RoundingMode } from '../types';
import { ExactNumber } from '../ExactNumber';
import { atan, asin, acos } from './inverse_trigonometry';

describe('inverse trigonometry', () => {
  it('atan', () => {
    const range = [-5, 5];
    for (let i = range[0]; i <= range[1]; i += 0.05) {
      const jsResult = Math.atan(i).toString();
      const jsRounded = ExactNumber(jsResult).round(11, RoundingMode.TO_ZERO).toFixed(11);
      const exactResult = ExactNumber(atan(i.toString(), 11)).toFixed(11);
      expect(exactResult).toBe(jsRounded);
    }
  });

  it('atan many digits', () => {
    const ref = atan('7/12', 150);

    for (let i = 1; i < 120; i++) {
      expect(atan('7/12', i)).toBe(ref.slice(0, i + 2));
    }
  });

  it('asin', () => {
    const range = [-1, 1];
    for (let i = range[0]; i <= range[1]; i += 0.01) {
      const jsResult = Math.asin(i).toString();
      const jsRounded = ExactNumber(jsResult).round(11, RoundingMode.TO_ZERO).toFixed(11);
      const exactResult = ExactNumber(asin(i.toString(), 11)).toFixed(11);
      expect(exactResult).toBe(jsRounded);
    }
  });

  it('asin many digits', () => {
    const ref = asin('7/12', 120);

    for (let i = 1; i < 110; i++) {
      expect(asin('7/12', i)).toBe(ref.slice(0, i + 2));
    }
  });

  it('acos', () => {
    const range = [-1, 1];
    for (let i = range[0]; i <= range[1]; i += 0.01) {
      const jsResult = Math.acos(i).toString();
      const jsRounded = ExactNumber(jsResult).round(11, RoundingMode.TO_ZERO).toFixed(11);
      const exactResult = ExactNumber(acos(i.toString(), 11)).toFixed(11);
      expect(exactResult).toBe(jsRounded);
    }
  });

  it('acos many digits', () => {
    const ref = acos('7/12', 110);

    for (let i = 1; i < 100; i++) {
      expect(acos('7/12', i)).toBe(ref.slice(0, i + 2));
    }
  });
});
