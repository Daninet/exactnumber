import { _0N, _10N, _1N, _2N } from '../util';
import { ExactNumber } from '../ExactNumber';
import { FixedNumber } from '../FixedNumber';
import type { ExactNumberType } from '../types';
import { ConstantCache } from './constant';
import { sqrt } from './roots';

// ln(x) = ln((1 + y)/(1 - y)) = 2(y + y^3/3 + y^5/5 + y^7/7 + ...)
// y = (x - 1)/(x + 1) (|y| < 1)
function* logGenerator(y: ExactNumberType, decimals: number) {
  const y2 = y.pow(_2N).normalize();

  let numerator = y;
  let denominator = _1N;

  let sum = ExactNumber(y);

  while (true) {
    numerator = numerator.mul(y2);
    denominator += _2N;
    const term = numerator.div(denominator).trunc(decimals + 10);
    sum = sum.add(term);
    yield { term, sum };
  }
}

export const log = (x: number | bigint | string | ExactNumberType, decimals: number): ExactNumberType => {
  let input = ExactNumber(x);
  if (input.isOne()) {
    return new FixedNumber(0).trunc(decimals);
  }

  if (input.lte(0)) {
    throw new Error('Invalid parameter');
  }

  // fastest convergence at 1
  // ln(x) = 2 * ln(sqrt(x))
  let reductions = 0;
  const reductionLimit = ExactNumber('0.1');
  while (input.sub(_1N).abs().gt(reductionLimit)) {
    input = new FixedNumber(sqrt(input, decimals + 10));
    reductions++;
  }

  // ln(x) = ln((1 + y)/(1 - y)) = 2(y + y^3/3 + y^5/5 + y^7/7 + ...)
  // y = (x - 1)/(x + 1) (|y| < 1)
  const y = input.sub(_1N).div(input.add(_1N));

  const gen = logGenerator(y, decimals);
  for (const { term, sum } of gen) {
    if (term.isZero()) {
      // undo reductions
      const res = sum.mul(_2N ** BigInt(reductions + 1));
      return res.trunc(decimals);
    }
  }

  return ExactNumber(_0N);
};

export const logn = (n: number, x: number | bigint | string | ExactNumberType, decimals: number): ExactNumberType => {
  if (!Number.isSafeInteger(n) || n < 2) throw new Error('Invalid parameter for N');

  const numerator = log(x, decimals + 10);
  const denominator = log(n, decimals + 10);

  const res = new FixedNumber(numerator).div(denominator);

  return res.trunc(decimals);
};

const LOG_2 = new ConstantCache((decimals) => log(_2N, decimals), 200);

export const log2 = (x: number | bigint | string | ExactNumberType, decimals: number): ExactNumberType => {
  const res = new FixedNumber(log(x, decimals + 10)).div(LOG_2.get(decimals + 10));

  return res.trunc(decimals);
};

const LOG_10 = new ConstantCache((decimals) => log(_10N, decimals), 200);

export const log10 = (x: number | bigint | string | ExactNumberType, decimals: number): ExactNumberType => {
  const res = new FixedNumber(log(x, decimals + 10)).div(LOG_10.get(decimals + 10));

  return res.trunc(decimals);
};
