import { ExactNumber } from '../ExactNumber';
import { FixedNumber } from '../FixedNumber';
import { ExactNumberType } from '../types';
import { ConstantCache } from './constant';
import { sqrt } from './roots';

// ln(x) = ln((1 + y)/(1 - y)) = 2(y + y^3/3 + y^5/5 + y^7/7 + ...)
// y = (x - 1)/(x + 1) (|y| < 1)
function* logGenerator(y: ExactNumberType, decimals: number) {
  const y2 = y.pow(2n).normalize();

  let numerator = y;
  let denominator = 1n;

  let sum = ExactNumber(y);

  while (true) {
    numerator = numerator.mul(y2);
    denominator += 2n;
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

  if (input.lte(0n)) {
    throw new Error('Invalid parameter');
  }

  // fastest convergence at 1
  // ln(x) = 2 * ln(sqrt(x))
  let reductions = 0;
  const reductionLimit = ExactNumber('0.1');
  while (input.sub(1n).abs().gt(reductionLimit)) {
    input = new FixedNumber(sqrt(input, decimals + 10));
    reductions++;
  }

  // ln(x) = ln((1 + y)/(1 - y)) = 2(y + y^3/3 + y^5/5 + y^7/7 + ...)
  // y = (x - 1)/(x + 1) (|y| < 1)
  const y = input.sub(1n).div(input.add(1n));

  const gen = logGenerator(y, decimals);
  for (const { term, sum } of gen) {
    if (term.isZero()) {
      // undo reductions
      const res = sum.mul(2n ** BigInt(reductions + 1));
      return res.trunc(decimals);
    }
  }

  return ExactNumber(0);
};

export const logn = (n: number, x: number | bigint | string | ExactNumberType, decimals: number): ExactNumberType => {
  if (!Number.isSafeInteger(n) || n < 2) throw new Error('Invalid parameter for N');

  const numerator = log(x, decimals + 10);
  const denominator = log(n, decimals + 10);

  const res = new FixedNumber(numerator).div(denominator);

  return res.trunc(decimals);
};

const LOG_2 = new ConstantCache(decimals => log(2n, decimals), 200);

export const log2 = (x: number | bigint | string | ExactNumberType, decimals: number): ExactNumberType => {
  const res = new FixedNumber(log(x, decimals + 10)).div(LOG_2.get(decimals + 10));

  return res.trunc(decimals);
};

const LOG_10 = new ConstantCache(decimals => log(10n, decimals), 200);

export const log10 = (x: number | bigint | string | ExactNumberType, decimals: number): ExactNumberType => {
  const res = new FixedNumber(log(x, decimals + 10)).div(LOG_10.get(decimals + 10));

  return res.trunc(decimals);
};
