import { FixedNumber } from '../FixedNumber';
import { ExactNumberType, RoundingMode } from '../types';
import { Fraction } from '../Fraction';
import { ExactNumber } from '../ExactNumber';

const approximateNthRoot = (n: number, x: ExactNumberType): string => {
  let xNum = x.toNumber();

  if (Number.isFinite(xNum)) {
    // JS doesn't work well with powers of negative numbers
    const isNegative = xNum < 0;
    if (isNegative) {
      xNum = -xNum;
    }

    let guess = xNum ** (1 / n);
    if (isNegative) {
      guess = -guess;
    }

    return guess.toString();
  }

  // approximate number of digits in the output number
  const xDigits = x.abs().toFixed(0).length;
  const outputDigits = Math.ceil(xDigits / n);
  const sign = x.sign() === 1 ? '' : '-';
  return `${sign}5e${outputDigits}`;
};

// Newton's method
const nthrootWithNewton = (n: number, x: ExactNumberType, decimals: number): ExactNumberType => {
  const initialGuess = approximateNthRoot(n, x);

  let xk = new FixedNumber(initialGuess !== '0' ? initialGuess : '1') as ExactNumberType;

  const c0 = new Fraction(n - 1, n);
  const c1 = new Fraction(x, n);
  const c2 = BigInt(n - 1);

  let last = xk.trunc(decimals + 5);

  while (true) {
    xk = c0.mul(xk).add(c1.mul(xk.pow(c2).inv()));

    xk = xk.trunc(decimals + 5);
    if (xk.isZero() || last.eq(xk)) {
      break;
    }
    last = xk;
  }

  return xk.trunc(decimals);
};

export const nthroot = (
  n: number,
  x: number | bigint | string | ExactNumberType,
  decimals: number,
): ExactNumberType => {
  if (!Number.isSafeInteger(n)) throw new Error('Integer is expected for N');
  if (n < 0) throw new Error('Negative N is not supported');
  if (n === 0) throw new Error('N cannot be zero');

  const xNum = ExactNumber(x).round(decimals, RoundingMode.NEAREST_AWAY_FROM_ZERO);
  if (n === 1) {
    return xNum.trunc(decimals);
  }

  if (n % 2 === 0 && xNum.sign() === -1) throw new Error('Complex numbers are not supported');
  if (xNum.isZero()) return new FixedNumber(0n).trunc(decimals);
  if (xNum.isOne()) return new FixedNumber(1n).trunc(decimals);

  const res = nthrootWithNewton(n, xNum, decimals);
  return res;
};

export const sqrt = (x: number | bigint | string | ExactNumberType, decimals: number) => nthroot(2, x, decimals);
export const cbrt = (x: number | bigint | string | ExactNumberType, decimals: number) => nthroot(3, x, decimals);
