import { pow, exp } from './exponential';
import { compareError, testStability } from '../testHelper.test';

describe('exponential', () => {
  it('pow', () => {
    expect(pow('-1.2', -0, 3).toString()).toBe('1');
    expect(pow('-1.2', 0, 3).toString()).toBe('1');
    expect(pow('-1.2', 1, 3).toString()).toBe('-1.2');
    expect(pow('-1.2', 2, 3).toString()).toBe('1.44');

    expect(pow(0, 0, 3).toString()).toBe('1');
    expect(pow(0, 1, 3).toString()).toBe('0');
    expect(pow(0, 2, 3).toString()).toBe('0');

    expect(pow(2, '1/2', 20).toString()).toBe('1.4142135623730950488');
    expect(pow(2, '3/2', 20).toString()).toBe('2.8284271247461900976');
    expect(pow(2, '1/7', 20).toString()).toBe('1.10408951367381233764');
    expect(pow(2, '3/7', 20).toString()).toBe('1.34590019263235613194');
    expect(pow(2, '-3/7', 20).toString()).toBe('0.74299714456847421239');
    expect(pow(2, '-3/7', 20).toString()).toBe('0.74299714456847421239');
    expect(pow('3/7', '-3/7', 20).toString()).toBe('1.43781939157261619683');

    expect(pow(-2, 3, 3).toString()).toBe('-8');
    expect(pow(-2, -3, 3).toString()).toBe('-0.125');

    expect(pow(2, '-3/7', 9).toString()).toBe('0.742997144');
  });

  it('pow compare with JS', () => {
    for (let b = -2; b < 2; b += 0.3) {
      for (let e = -12; e < 8; e += 0.2) {
        // eslint-disable-next-line prefer-exponentiation-operator, no-restricted-properties
        const jsResult = Math.pow(b, e).toString();
        if (jsResult === 'NaN') {
          // TODO
          // expect(() => pow(b.toString(), e.toString(), 9)).toThrow('Complex numbers are not supported');
          continue;
        }

        compareError(pow(b.toString(), e.toString(), 30), jsResult, 10);
      }
    }
  });

  it('exp', () => {
    expect(exp(-1, 20).toString()).toBe('0.36787944117144232159');
    expect(exp(-0, 20).toString()).toBe('1');
    expect(exp(0, 20).toString()).toBe('1');
    expect(exp(1, 20).toString()).toBe('2.71828182845904523536');
    expect(exp(2, 20).toString()).toBe('7.38905609893065022723');
    expect(exp(3, 20).toString()).toBe('20.08553692318766774092');
    expect(exp('1/2', 20).toString()).toBe('1.64872127070012814684');
    expect(exp('3/7', 20).toString()).toBe('1.53506300925520989744');
    expect(exp('-3/7', 20).toString()).toBe('0.65143905753105559');
  });

  it('exp compare with JS', () => {
    for (let i = -12; i <= 20; i += 0.03) {
      const jsResult = Math.exp(i).toString();
      compareError(exp(i.toString(), 20), jsResult);
    }
  });

  it('exp 1 many digits', () => {
    testStability(decimals => exp(1, decimals), 500);
  });

  it('exp 3/7 many digits', () => {
    testStability(decimals => exp('3/7', decimals), 500);
  });
});
