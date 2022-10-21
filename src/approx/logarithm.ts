import { ExactNumber } from '../ExactNumber';
import { FixedNumber } from '../FixedNumber';
import { ExactNumberType } from '../types';
import { ConstantCache } from './constant';
import { sqrt } from './roots';

// ln(x) = ln((1 + y)/(1 - y)) = 2(y + y^3/3 + y^5/5 + y^7/7 + ...)
// y = (x - 1)/(x + 1) (|y| < 1)
function* logGenerator(y: ExactNumberType, digits: number) {
  const y2 = y.pow(2n).normalize();

  let numerator = y;
  let denominator = 1n;

  let sum = ExactNumber(y);

  while (true) {
    numerator = numerator.mul(y2);
    denominator += 2n;
    const term = numerator.div(denominator).trunc(digits + 10);
    sum = sum.add(term);
    yield { term, sum };
  }
}

export const log = (x: number | bigint | string | ExactNumberType, digits: number) => {
  let input = ExactNumber(x);
  if (input.isOne()) {
    return new FixedNumber(0).toFixed(digits);
  }

  if (input.lte(0n)) {
    throw new Error('Invalid parameter');
  }

  // fastest convergence at 1
  // ln(x) = 2 * ln(sqrt(x))
  let reductions = 0;
  while (input.sub(1n).abs().gt('0.1')) {
    input = new FixedNumber(sqrt(input, digits + 10));
    reductions++;
  }

  // ln(x) = ln((1 + y)/(1 - y)) = 2(y + y^3/3 + y^5/5 + y^7/7 + ...)
  // y = (x - 1)/(x + 1) (|y| < 1)
  const y = input.sub(1n).div(input.add(1n));

  const gen = logGenerator(y, digits);
  for (const { term, sum } of gen) {
    if (term.isZero()) {
      // undo reductions
      const res = sum.mul(2n ** BigInt(reductions + 1));
      return res.toFixed(digits);
    }
  }

  return '';
};

export const logn = (n: number, x: number | bigint | string | ExactNumberType, digits: number) => {
  if (!Number.isSafeInteger(n) || n < 2) throw new Error('Invalid parameter for N');

  const numerator = log(x, digits + 10);
  const denominator = log(n, digits + 10);

  const res = new FixedNumber(numerator).div(denominator);

  return res.toFixed(digits);
};

const LOG_2 = new ConstantCache(digits => log(2n, digits), 200);

export const log2 = (x: number | bigint | string | ExactNumberType, digits: number) => {
  const res = new FixedNumber(log(x, digits + 10)).div(LOG_2.get(digits + 10));

  return res.toFixed(digits);
};

const LOG_10 = new ConstantCache(digits => log(10n, digits), 200);

export const log10 = (x: number | bigint | string | ExactNumberType, digits: number) => {
  const res = new FixedNumber(log(x, digits + 10)).div(LOG_10.get(digits + 10));

  return res.toFixed(digits);
};
