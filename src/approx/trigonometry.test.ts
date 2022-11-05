import { ExactNumber } from '../ExactNumber';
import { cos, PI, sin, tan } from './trigonometry';
import { compareError, testStability } from '../testHelper.test';

describe('trigonometry', () => {
  it('PI', () => {
    expect(PI(10).toFixed(10)).toBe('3.1415926535');

    testStability(decimals => PI(decimals), 1000);
  });

  it('sin', () => {
    const range = [Math.floor(Math.PI * -4), Math.ceil(Math.PI * 4)];
    for (let i = range[0]; i <= range[1]; i += 0.01) {
      const jsResult = Math.sin(i).toString();
      compareError(sin(i.toString(), 30), jsResult, 10);
    }
  });

  it('sin many digits', () => {
    testStability(decimals => sin('7/12', decimals), 250);
  });

  it('cos reduce to half pi', () => {
    const pi = PI(100);
    const piOverTwo = pi.div(2);

    expect(cos(pi.div(3), 6).toFixed(6)).toBe('0.500000');

    for (let multiplier = -3; multiplier <= 3; multiplier++) {
      const base = pi.mul(2 * multiplier);
      expect(cos(base.add(pi.div(3)), 6).toFixed(6)).toBe('0.500000');
      expect(cos(base.add(pi.div(6).add(piOverTwo)), 6).toFixed(6)).toBe('-0.500000');
      expect(cos(base.add(pi.div(3).add(pi)), 6).toFixed(6)).toBe('-0.500000');
      expect(cos(base.add(pi.div(6).add(pi)).add(piOverTwo), 6).toFixed(6)).toBe('0.500000');
    }
  });

  it('cos', () => {
    const range = [Math.floor(Math.PI * -5), Math.ceil(Math.PI * 5)];
    for (let i = range[0]; i <= range[1]; i += 0.01) {
      const jsResult = Math.cos(i).toString();
      compareError(cos(i.toString(), 20), jsResult, 10);
    }
  });

  it('cos many digits', () => {
    testStability(decimals => cos('7/12', decimals), 250);
  });

  it('tan', () => {
    // expect(tan(PI(12).div(2), 10).toFixed(10)).toBe('3.1415926535');

    const range = [Math.floor(Math.PI * -4), Math.ceil(Math.PI * 4)];
    for (let i = range[0]; i <= range[1]; i += 0.01) {
      const jsResult = Math.tan(i);
      compareError(tan(i.toString(), 35), jsResult.toString());
    }
  });

  it('tan many digits', () => {
    testStability(decimals => tan('7/12', decimals), 250);
  });
});
