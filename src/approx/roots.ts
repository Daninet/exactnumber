import { FixedNumber } from '../FixedNumber';
import { ExactNumberType } from '../types';
import { Fraction } from '../Fraction';
import { ExactNumber } from '../ExactNumber';

const approximateNthRoot = (n: number, x: number): string => {
  // JS doesn't work well with powers of negative numbers
  const isNegative = x < 0;
  if (isNegative) {
    x = -x;
  }

  let guess = x ** (1 / n);
  if (isNegative) {
    guess = -guess;
  }

  return guess.toString();
};

export const nthroot = (n: number, x: number | bigint | string | ExactNumberType, digits: number): string => {
  if (!Number.isSafeInteger(n)) throw new Error('Integer is expected for N');
  if (n < 0) throw new Error('Negative N is not supported');
  if (n === 0) throw new Error('N cannot be zero');

  if (n === 1) {
    return ExactNumber(x).toFixed(digits);
  }

  const xNum = ExactNumber(x);
  if (n % 2 === 0 && xNum.sign() === -1) throw new Error('Complex numbers are not supported');
  if (xNum.isZero()) return new FixedNumber(0n).toFixed(digits);
  if (xNum.isOne()) return new FixedNumber(1n).toFixed(digits);

  const c0 = new Fraction(n - 1, n);
  const c1 = new Fraction(xNum, n);

  const xNumAsNumber = xNum.toNumber();
  const initialGuess = Number.isFinite(xNumAsNumber)
    ? approximateNthRoot(n, xNumAsNumber)
    : approximateNthRoot(n, xNumAsNumber < 0 ? Number.MIN_VALUE : Number.MAX_VALUE);

  let xk = new FixedNumber(initialGuess) as ExactNumberType;

  // Newton's method
  let last = xk.trunc(digits);
  while (true) {
    xk = c0.mul(xk).add(c1.mul(xk.inv().pow(n - 1)));

    const val = xk.trunc(digits);
    if (xk.isZero() || last.eq(val)) {
      break;
    }
    last = val;
  }

  return xk.toFixed(digits);
};

export const sqrt = (x: number | bigint | string | ExactNumberType, digits: number) => nthroot(2, x, digits);
export const cbrt = (x: number | bigint | string | ExactNumberType, digits: number) => nthroot(3, x, digits);
