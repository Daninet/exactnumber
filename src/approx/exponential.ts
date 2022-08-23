import { ExactNumber } from '../ExactNumber';
import { Fraction } from '../Fraction';
import { ExactNumberType } from '../types';
import { nthroot } from './roots';

export const pow = (
  base: number | bigint | string | ExactNumberType,
  exponent: number | bigint | string | ExactNumberType,
  digits: number,
) => {
  const baseFraction = new Fraction(base, 1n);
  const exponentFractionParts = new Fraction(exponent, 1n).getFractionParts(false);

  const res = nthroot(
    exponentFractionParts.denominator.toNumber(),
    baseFraction.pow(exponentFractionParts.numerator),
    digits,
  );
  return res;
};

// e^x = 1 + x + x^2/2! + x^3/3! + ...
export const exp = (x: number | bigint | string | ExactNumberType, digits: number) => {
  // TODO: try computing via exp(x) = sinh(x) + sqrt(1 + sinh(x) ** 2)
  const xVal = ExactNumber(x);

  let xk = xVal.add(1n);

  let denominator = 6n;
  let i = 4n;

  const xPow2 = xVal.pow(2n);
  let xPow = xPow2;

  const errorLimit = new Fraction(1n, 10n ** BigInt(digits + 5));
  while (true) {
    // x^2/2! + x^3/3!
    // = (x^2*(3+x))/3!

    const term = xPow.mul(xVal.add(i - 1n)).div(denominator);
    denominator *= i * (i + 1n);
    i += 2n;
    xPow = xPow.mul(xPow2);
    xk = xk.add(term).trunc(digits + 5);

    if (term.abs().lte(errorLimit)) {
      break;
    }
  }

  return xk.toFixed(digits);
};
