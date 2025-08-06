import { _0N, _1N, _2N, _4N } from '../util';
import { ExactNumber } from '../ExactNumber';
import type { ExactNumberType } from '../types';
import { log } from './logarithm';

// e^x = 1 + x + x^2/2! + x^3/3! + ...
function* expGenerator(x: ExactNumberType, decimals: number) {
  let sum = x.add(1);

  let denominator = BigInt(6);
  let i = _4N;

  const xPow2 = x.pow(_2N);

  let xPow = xPow2;

  while (true) {
    // x^2/2! + x^3/3!
    // = (x^2*(3+x))/3!

    const term = xPow.mul(x.add(i - _1N)).div(denominator);
    denominator *= i * (i + _1N);
    i += _2N;
    xPow = xPow.mul(xPow2);
    sum = sum.add(term).trunc(decimals + 5);

    yield { term, sum };
  }
}

// TODO: try computing via exp(x) = sinh(x) + sqrt(1 + sinh(x) ** 2)
export const exp = (x: number | bigint | string | ExactNumberType, decimals: number): ExactNumberType => {
  const xVal = ExactNumber(x);
  const maxError = ExactNumber(`1e-${decimals + 5}`);

  const gen = expGenerator(xVal, decimals);
  for (const { term, sum } of gen) {
    if (term.abs().lt(maxError)) {
      return sum.trunc(decimals);
    }
  }

  return ExactNumber(_0N);
};

export const pow = (
  _base: number | bigint | string | ExactNumberType,
  _exponent: number | bigint | string | ExactNumberType,
  decimals: number,
): ExactNumberType => {
  const base = ExactNumber(_base);
  const exponent = ExactNumber(_exponent);

  if (exponent.isInteger() && Number.isSafeInteger(exponent.toNumber())) {
    return base.pow(exponent).trunc(decimals);
  }

  // x^y = exp(y*ln(x))

  if (base.sign() === -1 && !exponent.isInteger()) {
    throw new Error('Complex numbers are not supported');
  }

  const logbase = log(base, decimals + 5);
  const param = exponent.mul(logbase);
  return exp(param, decimals + 5).trunc(decimals);
};
