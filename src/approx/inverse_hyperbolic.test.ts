import { acosh, asinh, atanh } from './inverse_hyperbolic';
import { compareError, testStability } from '../testHelper.test';

describe('hyperbolic', () => {
  it('asinh', () => {
    for (let i = -4; i <= 4; i += 0.004) {
      const jsResult = Math.asinh(i).toString();
      compareError(asinh(i.toString(), 30), jsResult);
    }
  });

  it('asinh 7/12', () => {
    testStability(decimals => asinh('7/12', decimals), 150);
  });

  it('acosh', () => {
    for (let i = 1; i <= 8; i += 0.004) {
      const jsResult = Math.acosh(i).toString();
      compareError(acosh(i.toString(), 30), jsResult);
    }
  });

  it('acosh 17/12', () => {
    testStability(decimals => acosh('17/12', decimals), 150);
  });

  it('atanh', () => {
    for (let i = -0.9999; i <= 0.9999; i += 0.002) {
      const jsResult = Math.atanh(i).toString();
      compareError(atanh(i.toString(), 30), jsResult);
    }
  });

  it('atanh 7/12', () => {
    testStability(decimals => atanh('7/12', decimals), 150);
  });
});
