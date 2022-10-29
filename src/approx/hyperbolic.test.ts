import { cosh, sinh, tanh } from './hyperbolic';
import { compareError, testStability } from '../testHelper.test';

describe('hyperbolic', () => {
  it('sinh', () => {
    expect(sinh(0, 30).toString()).toBe('0');

    for (let i = -4; i <= 4; i += 0.004) {
      const jsResult = Math.sinh(i).toString();
      compareError(sinh(i.toString(), 30), jsResult);
    }
  });

  it('sinh 7/12', () => {
    testStability(decimals => sinh('7/12', decimals), 350);
  });

  it('cosh', () => {
    expect(cosh(0, 30).toString()).toBe('1');

    for (let i = -4; i <= 4; i += 0.004) {
      const jsResult = Math.cosh(i).toString();
      compareError(cosh(i.toString(), 30), jsResult);
    }
  });

  it('cosh 7/12', () => {
    testStability(decimals => cosh('7/12', decimals), 350);
  });

  it('tanh', () => {
    expect(tanh(0, 30).toString()).toBe('0');

    const range = [-4, 4];
    for (let i = range[0]; i <= range[1]; i += 0.004) {
      const jsResult = Math.tanh(i).toString();
      compareError(tanh(i.toString(), 30), jsResult);
    }
  });

  it('tanh 7/12', () => {
    testStability(decimals => tanh('7/12', decimals), 350);
  });
});
