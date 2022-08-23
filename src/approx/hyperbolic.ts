import { ExactNumber } from '../ExactNumber';
import { ExactNumberType } from '../types';

export const sinh = (x: number | bigint | string | ExactNumberType, digits: number) => {
  const input = ExactNumber(x);

  const x2 = input.pow(2n).normalize();

  // sinh x = x + x^3/3! + x^5/5! + ...
  let numerator = input;
  let denominator = 1n;

  let xk = input.trunc(digits + 5);

  let i = 2n;

  const maxError = ExactNumber(1n).div(10n ** BigInt(digits + 5));

  while (true) {
    numerator = numerator.mul(x2);
    denominator *= i * (i + 1n);
    i += 2n;
    const term = numerator.div(denominator);
    xk = xk.add(term).trunc(digits + 5);

    if (term.abs().lt(maxError)) {
      break;
    }
  }

  return xk.toFixed(digits);
};

export const cosh = (x: number | bigint | string | ExactNumberType, digits: number) => {
  const input = ExactNumber(x);

  const x2 = input.pow(2n).normalize();

  // cosh x = 1 + x^2/2! + x^4/4! + ...
  let numerator = x2;
  let denominator = 2n;

  let xk = numerator
    .div(denominator)
    .add(1n)
    .trunc(digits + 5);

  let i = 3n;

  const maxError = ExactNumber(1n).div(10n ** BigInt(digits + 5));

  while (true) {
    numerator = numerator.mul(x2);
    denominator *= i * (i + 1n);
    i += 2n;
    const term = numerator.div(denominator);
    xk = xk.add(term).trunc(digits + 5);

    if (term.abs().lt(maxError)) {
      break;
    }
  }

  return xk.toFixed(digits);
};
