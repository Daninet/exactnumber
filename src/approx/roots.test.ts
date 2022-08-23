import { RoundingMode } from '../types';
import { ExactNumber } from '../ExactNumber';
import { sqrt, cbrt, nthroot } from './roots';

describe('roots', () => {
  it('handles errors', () => {
    expect(() => nthroot(0, 2, 1)).toThrow('N cannot be zero');
    expect(() => nthroot(-1, 2, 1)).toThrow('Negative N is not supported');
    expect(() => nthroot(0.1, 2, 1)).toThrow('Integer is expected for N');
  });

  it('sqrt', () => {
    expect(sqrt(0, 0)).toBe('0');
    expect(sqrt(0, 5)).toBe('0.00000');
    expect(sqrt(1, 0)).toBe('1');
    expect(sqrt(1, 5)).toBe('1.00000');

    for (let i = 0; i <= 144; i += 0.03) {
      const jsResult = Math.sqrt(i).toString();
      const jsRounded = ExactNumber(jsResult).round(RoundingMode.TO_ZERO, 10).toFixed(10);
      const exactResult = sqrt(i.toString(), 10);
      expect(exactResult).toBe(jsRounded);
    }
  });

  it('sqrt 2', () => {
    expect(sqrt(2, 0)).toBe('1');

    const ref = sqrt(2, 1000);

    for (let i = 1; i < 1000; i++) {
      expect(sqrt(2, i)).toBe(ref.slice(0, i + 2));
    }
  });

  it('sqrt 3', () => {
    expect(sqrt(3, 0)).toBe('1');

    const ref = sqrt(3, 1000);

    for (let i = 1; i < 1000; i++) {
      expect(sqrt(3, i)).toBe(ref.slice(0, i + 2));
    }
  });

  it('cbrt', () => {
    expect(cbrt(0, 0)).toBe('0');
    expect(cbrt(0, 5)).toBe('0.00000');
    expect(cbrt(1, 0)).toBe('1');
    expect(cbrt(1, 5)).toBe('1.00000');

    for (let i = -144; i <= 144; i += 0.07) {
      const jsResult = Math.cbrt(i).toString();
      const jsRounded = ExactNumber(jsResult).round(RoundingMode.TO_ZERO, 10).toFixed(10);
      const exactResult = cbrt(i.toString(), 10);
      expect(exactResult).toBe(jsRounded);
    }
  });

  it('cbrt 2', () => {
    expect(cbrt(2, 0)).toBe('1');

    const ref = cbrt(2, 500);

    for (let i = 1; i < 500; i++) {
      expect(cbrt(2, i)).toBe(ref.slice(0, i + 2));
    }
  });

  it('cbrt 3', () => {
    expect(cbrt(3, 0)).toBe('1');

    const ref = cbrt(3, 500);

    for (let i = 1; i < 500; i++) {
      expect(cbrt(3, i)).toBe(ref.slice(0, i + 2));
    }
  });

  it('nthroot', () => {
    expect(nthroot(1, 3, 20)).toBe('3.00000000000000000000');
    expect(nthroot(2, 3, 20)).toBe('1.73205080756887729352');
    expect(nthroot(3, 3, 20)).toBe('1.44224957030740838232');
    expect(nthroot(4, 3, 20)).toBe('1.31607401295249246081');
    expect(nthroot(5, -3, 20)).toBe('-1.24573093961551732596');
    expect(nthroot(6, 3, 20)).toBe('1.20093695517600272667');
    expect(nthroot(7, 3, 20)).toBe('1.16993081275868688646');
  });
});
