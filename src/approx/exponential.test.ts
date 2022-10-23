import { RoundingMode } from '../types';
import { ExactNumber } from '../ExactNumber';
import { pow, exp } from './exponential';

describe('exponential', () => {
  it('pow', () => {
    expect(pow(2, '1/2', 20).toString()).toBe('1.4142135623730950488');
    expect(pow(2, '3/2', 20).toString()).toBe('2.8284271247461900976');
    expect(pow(2, '1/7', 20).toString()).toBe('1.10408951367381233764');
    expect(pow(2, '3/7', 20).toString()).toBe('1.34590019263235613194');

    expect(pow(-2, 3, 3).toString()).toBe('-8');
    expect(pow(-2, -3, 3).toString()).toBe('-0.125');

    expect(pow(2, '-3/7', 9).toString()).toBe('0.742997144');
  });

  it('pow compare with JS', () => {
    for (const b of ExactNumber.range(-2, 2, '0.3')) {
      for (const e of ExactNumber.range(-12, 8, '0.2')) {
        // eslint-disable-next-line prefer-exponentiation-operator, no-restricted-properties
        const jsResult = Math.pow(b.toNumber(), e.toNumber()).toString();
        if (jsResult === 'NaN') {
          expect(() => pow(b, e, 9)).toThrow('Complex numbers are not supported');
          continue;
        }
        const jsRounded = ExactNumber(jsResult).toPrecision(12, RoundingMode.NEAREST_TO_ZERO);
        const exactResult = ExactNumber(pow(b, e, 20)).toPrecision(12, RoundingMode.NEAREST_TO_ZERO);
        expect(exactResult).toBe(jsRounded);
      }
    }
  });

  it('exp', () => {
    expect(exp(0, 20).toString()).toBe('1');
    expect(exp(1, 20).toString()).toBe('2.71828182845904523536');
    expect(exp(2, 20).toString()).toBe('7.38905609893065022723');
    expect(exp(3, 20).toString()).toBe('20.08553692318766774092');
    expect(exp('1/2', 20).toString()).toBe('1.64872127070012814684');
    expect(exp('3/7', 20).toString()).toBe('1.53506300925520989744');
  });

  it('exp compare with JS', () => {
    for (let i = -12; i <= 20; i += 0.03) {
      const jsResult = Math.exp(i).toString();
      const jsRounded = ExactNumber(jsResult).toPrecision(10, RoundingMode.TO_ZERO);
      const exactResult = exp(i.toString(), 15).toPrecision(10, RoundingMode.TO_ZERO);
      expect(exactResult).toBe(jsRounded);
    }
  });

  it('exp 1 many digits', () => {
    const ref = exp(1, 500).toString();

    for (let i = 1; i < 500; i++) {
      expect(exp(1n, i).toFixed(i)).toBe(ref.slice(0, i + 2));
    }
  });

  it('exp 3/7 many digits', () => {
    const ref = exp('3/7', 500).toString();

    for (let i = 1; i < 500; i++) {
      expect(exp('3/7', i).toFixed(i)).toBe(ref.slice(0, i + 2));
    }
  });
});
