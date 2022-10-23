import { ExactNumber } from '../ExactNumber';
import { ExactNumberType, RoundingMode } from '../types';
import { log } from './logarithm';
import { sqrt } from './roots';

export const asinh = (x: number | bigint | string | ExactNumberType, decimals: number): ExactNumberType => {
  const input = ExactNumber(x).round(decimals, RoundingMode.NEAREST_AWAY_FROM_ZERO);
  if (input.isZero()) return ExactNumber(0);

  // asinh(x) = ln(x + sqrt(x^2 + 1))

  const root = sqrt(input.pow(2).add(1n), decimals + 10);
  const res = log(input.add(root), decimals);

  return res;
};

export const acosh = (x: number | bigint | string | ExactNumberType, decimals: number): ExactNumberType => {
  const input = ExactNumber(x).round(decimals, RoundingMode.NEAREST_AWAY_FROM_ZERO);
  if (input.isOne()) return ExactNumber(0);
  if (input.lt(1n)) throw new Error('Out of range');

  // acosh(x) = ln(x + sqrt(x^2 - 1))

  const root = sqrt(input.pow(2).sub(1n), decimals + 10);
  const res = log(input.add(root), decimals);

  return res;
};

export const atanh = (x: number | bigint | string | ExactNumberType, decimals: number): ExactNumberType => {
  const input = ExactNumber(x).round(decimals, RoundingMode.NEAREST_AWAY_FROM_ZERO);
  if (input.abs().gte(1n)) throw new Error('Out of range');
  if (input.isZero()) return ExactNumber(0);

  // atanh(x) = 0.5 * ln((1 + x) / (1 - x))

  const res = log(input.add(1n).div(input.neg().add(1n)), decimals + 5);

  return ExactNumber(res).div(2n).trunc(decimals);
};
