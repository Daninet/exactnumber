import { ExactNumber } from './ExactNumber';
import { ExactNumberParameter, ExactNumberType, RoundingMode } from './types';

export const compareError = (a: ExactNumberParameter, b: ExactNumberParameter, digits = 12) => {
  const aConv = ExactNumber(a).roundToDigits(digits, RoundingMode.NEAREST_AWAY_FROM_ZERO);
  const bConv = ExactNumber(b).roundToDigits(digits, RoundingMode.NEAREST_AWAY_FROM_ZERO);
  expect(aConv.toString()).toBe(bConv.toString());
};

export const testStability = (fn: (decimals: number) => ExactNumberType, max: number) => {
  const ref = fn(max).toFixed(max);

  for (let i = 1; i < max; i++) {
    expect(fn(i).toFixed(i)).toBe(ref.slice(0, i + 2));
  }
};

it('compareError()', () => {
  expect(() => compareError('1', '2')).toThrowError();
  expect(() => compareError('0.00123', '0.001239', 3)).toThrowError();
  expect(() => compareError('0.00123', '0.00124', 3)).toThrowError();
  expect(() => compareError('0.0123', '0.0125', 3)).toThrowError();
  expect(() => compareError('1.23', '1.239', 3)).toThrowError();
  expect(() => compareError('-1.23', '-1.239', 3)).toThrowError();
  expect(() => compareError('123.45', '123.66', 3)).toThrowError();

  compareError('0.00123', '0.0012345', 3);
  compareError('0.00123', '0.001229', 3);
  compareError('1.234', '1.231', 3);
  compareError('12.34', '12.31', 3);
  compareError('123.15', '123.49', 3);
});
