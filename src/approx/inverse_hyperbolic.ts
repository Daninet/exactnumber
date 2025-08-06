import { _0N, _1N, _2N } from '../util';
import { ExactNumber } from '../ExactNumber';
import type { ExactNumberType } from '../types';
import { log } from './logarithm';
import { sqrt } from './roots';

export const asinh = (x: number | bigint | string | ExactNumberType, decimals: number): ExactNumberType => {
  const input = ExactNumber(x);
  if (input.isZero()) return ExactNumber(_0N);

  // asinh(x) = ln(x + sqrt(x^2 + 1))

  const root = sqrt(input.pow(_2N).add(_1N), decimals + 5);
  const res = log(input.add(root), decimals + 5);

  return res.trunc(decimals);
};

export const acosh = (x: number | bigint | string | ExactNumberType, decimals: number): ExactNumberType => {
  const input = ExactNumber(x);
  if (input.isOne()) return ExactNumber(_0N);
  if (input.lt(_1N)) throw new Error('Out of range');

  // acosh(x) = ln(x + sqrt(x^2 - 1))

  const root = sqrt(input.pow(_2N).sub(_1N), decimals + 5);
  const res = log(input.add(root), decimals + 5);

  return res.trunc(decimals);
};

export const atanh = (x: number | bigint | string | ExactNumberType, decimals: number): ExactNumberType => {
  const input = ExactNumber(x);
  if (input.abs().gte(_1N)) throw new Error('Out of range');
  if (input.isZero()) return ExactNumber(_0N);

  // atanh(x) = 0.5 * ln((1 + x) / (1 - x))

  const res = log(input.add(_1N).div(input.neg().add(_1N)), decimals + 5);

  return ExactNumber(res).div(_2N).trunc(decimals);
};
