import { ExactNumber } from '../ExactNumber';
import { ExactNumberType } from '../types';
import { log } from './logarithm';

// e^x = 1 + x + x^2/2! + x^3/3! + ...
function* expGenerator(x: ExactNumberType, digits: number) {
  let sum = x.add(1n);

  let denominator = 6n;
  let i = 4n;

  const xPow2 = x.pow(2n);

  let xPow = xPow2;

  while (true) {
    // x^2/2! + x^3/3!
    // = (x^2*(3+x))/3!

    const term = xPow.mul(x.add(i - 1n)).div(denominator);
    denominator *= i * (i + 1n);
    i += 2n;
    xPow = xPow.mul(xPow2);
    sum = sum.add(term).trunc(digits + 5);

    yield { term, sum };
  }
}

// TODO: try computing via exp(x) = sinh(x) + sqrt(1 + sinh(x) ** 2)
export const exp = (x: number | bigint | string | ExactNumberType, digits: number) => {
  const xVal = ExactNumber(x);

  const maxError = ExactNumber(`1e-${digits + 5}`);

  const gen = expGenerator(xVal, digits);
  for (const { term, sum } of gen) {
    if (term.abs().lt(maxError)) {
      return sum.toFixed(digits);
    }
  }

  return '';
};

export const pow = (
  _base: number | bigint | string | ExactNumberType,
  _exponent: number | bigint | string | ExactNumberType,
  digits: number,
) => {
  const base = ExactNumber(_base);
  const exponent = ExactNumber(_exponent);
  if (exponent.isInteger() && Number.isSafeInteger(exponent.toNumber())) {
    return base.pow(exponent).toFixed(digits);
  }

  // x^y = exp(y*ln(x))

  if (base.sign() === -1 && !exponent.isInteger()) {
    throw new Error('Complex numbers are not supported');
  }

  const logbase = log(base, digits + 5);
  const param = exponent.mul(logbase);
  return exp(param, digits);
};
