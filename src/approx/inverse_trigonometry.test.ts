import { atan, asin, acos } from './inverse_trigonometry';
import { compareError, testStability } from '../testHelper.test';

describe('inverse trigonometry', () => {
  it('atan', () => {
    const range = [-5, 5];
    for (let i = range[0]; i <= range[1]; i += 0.05) {
      const jsResult = Math.atan(i).toString();
      compareError(atan(i.toString(), 30), jsResult);
    }
  });

  it('atan many digits', () => {
    testStability(decimals => atan('7/12', decimals), 150);
  });

  it('asin', () => {
    const range = [-1, 1];
    for (let i = range[0]; i <= range[1]; i += 0.01) {
      const jsResult = Math.asin(i).toString();
      compareError(asin(i.toString(), 30), jsResult);
    }
  });

  it('asin many digits', () => {
    testStability(decimals => asin('7/12', decimals), 120);
  });

  it('acos', () => {
    const range = [-1, 1];
    for (let i = range[0]; i <= range[1]; i += 0.01) {
      const jsResult = Math.acos(i).toString();
      compareError(acos(i.toString(), 30), jsResult);
    }
  });

  it('acos many digits', () => {
    testStability(decimals => acos('7/12', decimals), 110);
  });
});
