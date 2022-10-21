import { RoundingMode } from '../types';
import { ExactNumber } from '../ExactNumber';
import { pow, exp } from './exponential';

describe('exponential', () => {
  it('pow', () => {
    expect(pow(2, '1/2', 20)).toBe('1.41421356237309504880');
    expect(pow(2, '3/2', 20)).toBe('2.82842712474619009760');
    expect(pow(2, '1/7', 20)).toBe('1.10408951367381233764');
    expect(pow(2, '3/7', 20)).toBe('1.34590019263235613194');

    expect(pow(-2, 3, 3)).toBe('-8.000');
    expect(pow(-2, -3, 3)).toBe('-0.125');

    expect(pow(2, '-3/7', 9)).toBe('0.742997144');
  });

  it('pow compare with JS', () => {
    for (let b = -2; b <= 2; b += 0.3) {
      for (let e = -12; e <= 8; e += 0.2) {
        // eslint-disable-next-line prefer-exponentiation-operator, no-restricted-properties
        const jsResult = Math.pow(b, e).toString();
        if (jsResult === 'NaN') {
          expect(() => pow(b.toString(), e.toString(), 9)).toThrow('Complex numbers are not supported');
          continue;
        }
        const jsRounded = ExactNumber(jsResult).toPrecision(8, RoundingMode.NEAREST_AWAY_FROM_ZERO);
        const exactResult = ExactNumber(pow(b.toString(), e.toString(), 20)).toPrecision(
          8,
          RoundingMode.NEAREST_AWAY_FROM_ZERO,
        );
        expect(exactResult).toBe(jsRounded);
      }
    }
  });

  it('exp', () => {
    expect(exp(0, 20)).toBe('1.00000000000000000000');
    expect(exp(1, 20)).toBe('2.71828182845904523536');
    expect(exp(2, 20)).toBe('7.38905609893065022723');
    expect(exp(3, 20)).toBe('20.08553692318766774092');
    expect(exp('1/2', 20)).toBe('1.64872127070012814684');
    expect(exp('3/7', 20)).toBe('1.53506300925520989744');
  });

  it('exp compare with JS', () => {
    for (let i = -12; i <= 20; i += 0.03) {
      const jsResult = Math.exp(i).toString();
      const jsRounded = ExactNumber(jsResult).toPrecision(10, RoundingMode.TO_ZERO);
      const exactResult = ExactNumber(exp(i.toString(), 15)).toPrecision(10, RoundingMode.TO_ZERO);
      expect(exactResult).toBe(jsRounded);
    }
  });

  it('exp 1 many digits', () => {
    const ref = exp(1, 500);

    for (let i = 1; i < 500; i++) {
      expect(exp(1n, i)).toBe(ref.slice(0, i + 2));
    }
  });

  it('exp 3/7 many digits', () => {
    const ref = exp('3/7', 500);

    for (let i = 1; i < 500; i++) {
      expect(exp('3/7', i)).toBe(ref.slice(0, i + 2));
    }
  });
});
