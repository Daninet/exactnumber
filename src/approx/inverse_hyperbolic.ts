import { ExactNumber } from '../ExactNumber';
import { ExactNumberType } from '../types';
import { log } from './logarithm';
import { sqrt } from './roots';

export const asinh = (x: number | bigint | string | ExactNumberType, digits: number) => {
  const input = ExactNumber(x);
  if (input.isZero()) return '0';

  // asinh(x) = ln(x + sqrt(x^2 + 1))

  const root = sqrt(input.pow(2).add(1n), digits + 10);
  const res = log(input.add(root), digits);

  return res;
};

export const acosh = (x: number | bigint | string | ExactNumberType, digits: number) => {
  const input = ExactNumber(x);
  if (input.isOne()) return '0';
  if (input.lt(1n)) throw new Error('Out of range');

  // acosh(x) = ln(x + sqrt(x^2 - 1))

  const root = sqrt(input.pow(2).sub(1n), digits + 10);
  const res = log(input.add(root), digits);

  return res;
};

export const atanh = (x: number | bigint | string | ExactNumberType, digits: number) => {
  const input = ExactNumber(x);
  if (input.abs().gte(1n)) throw new Error('Out of range');
  if (input.isZero()) return '0';

  // atanh(x) = 0.5 * ln((1 + x) / (1 - x))

  const res = log(input.add(1n).div(input.neg().add(1n)), digits + 5);

  return ExactNumber(res).div(2n).toFixed(digits);
};
