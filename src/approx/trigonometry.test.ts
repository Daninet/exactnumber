import { ExactNumberType } from '../types';
import { ExactNumber } from '../ExactNumber';
import { cos, evaluateAngle, PI, sin, tan } from './trigonometry';
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

  it('evaluates angles', () => {
    const precision = 10;
    const pi = PI(15);

    const toRad = (x: ExactNumberType) => ExactNumber(x).div(180).mul(pi).trunc(precision);
    const normalizeAngle = (x: ExactNumberType) => {
      let ref = ExactNumber(x).mod(360);
      if (ref.sign() === -1) ref = ref.add(360);
      return ref;
    };

    for (let deg = -3600; deg <= 3600; deg++) {
      const rad = toRad(ExactNumber(deg));
      const ref = normalizeAngle(ExactNumber(deg));
      const quadrant = ref.div(90).floor().toNumber() + 1;
      const res = evaluateAngle(rad, precision);
      expect(res.quadrant).toBe(quadrant);

      if (deg % 15 === 0) {
        expect(res.specialCaseDeg).not.toBe(null);
        expect(res.specialCaseDeg).toBeGreaterThanOrEqual(0);
        expect(res.specialCaseDeg).toBeLessThanOrEqual(90);
        expect(res.subHalfPiAngle).toBe(null);
      } else {
        expect(res.specialCaseDeg).toBe(null);
        expect(res.subHalfPiAngle.gte(0)).toBe(true);
        expect(res.subHalfPiAngle.lte('1.571')).toBe(true);
      }
    }
  });

  it('reduces angles correctly', () => {
    const precision = 10;
    const pi = PI(100);
    const piOver2 = pi.div(2);

    const seq = [ExactNumber(0), pi.div(6), pi.div(4), pi.div(3)];

    for (let base = ExactNumber(0); base.lt(200); base = base.add(pi.mul(2))) {
      for (let quadrant = 1; quadrant <= 4; quadrant++) {
        const basePlusQuadrant = base.add(piOver2.mul(quadrant - 1));
        for (const angle of seq) {
          const x = basePlusQuadrant.add(angle).trunc(precision);
          const res = evaluateAngle(x, precision);
          expect(res.quadrant).toBe(quadrant);
        }
      }
    }
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
