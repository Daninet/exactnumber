import { ExactNumber } from './ExactNumber';
import { ExactNumberParameter, ExactNumberType, RoundingMode } from './types';

export const compareError = (a: ExactNumberParameter, b: ExactNumberParameter, digits = 12) => {
  const aConv = ExactNumber(a).roundToDigits(digits, RoundingMode.NEAREST_AWAY_FROM_ZERO);
  const bConv = ExactNumber(b).roundToDigits(digits, RoundingMode.NEAREST_AWAY_FROM_ZERO);
  const diff = aConv.sub(bConv).abs();
  if (diff.isZero()) return;

  const intPart = aConv.intPart().toString();
  const intPartDigits = intPart === '0' ? 0 : intPart.length;
  const decimals = digits - intPartDigits;

  if (!diff.lte(`1e${-decimals}`)) {
    expect(aConv.toPrecision(digits)).toBe(bConv.toPrecision(digits));
  }
};

export const testStability = (fn: (decimals: number) => ExactNumberType, max: number) => {
  const ref = fn(max).toFixed(max);

  for (let i = 1; i < max; i++) {
    expect(fn(i).toFixed(i)).toBe(ref.slice(0, i + 2));
  }
};
