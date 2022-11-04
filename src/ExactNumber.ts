import { Fraction } from './Fraction';
import { FixedNumber } from './FixedNumber';
import { ExactNumberParameter, ExactNumberType } from './types';

export function parseParameter(x: number | bigint | string | ExactNumberType): ExactNumberType {
  if (x instanceof FixedNumber || x instanceof Fraction) {
    return x;
  }

  if (typeof x === 'bigint') {
    return new FixedNumber(x);
  }

  if (typeof x === 'number') {
    if (!Number.isSafeInteger(x)) {
      throw new Error('Floating point values as numbers are unsafe. Please provide them as a string.');
    }
    return new FixedNumber(x);
  }

  if (typeof x === 'string') {
    if (x.includes('/') || x.includes('(')) {
      return new Fraction(x, 1n);
    }
    return new FixedNumber(x);
  }

  throw new Error('Unsupported parameter type');
}

type ExactNumberInterface = {
  (x: number | bigint | string | ExactNumberType, y?: number | bigint | string | ExactNumberType): ExactNumberType;
  min: (...params: (number | bigint | string | ExactNumberType)[]) => ExactNumberType;
  max: (...params: (number | bigint | string | ExactNumberType)[]) => ExactNumberType;
  fromBase: (num: string, radix: number) => ExactNumberType;
  range: (
    start: number | bigint | string | ExactNumberType,
    end: number | bigint | string | ExactNumberType,
    increment?: number | bigint | string | ExactNumberType,
  ) => Generator<ExactNumberType, void, unknown>;
  gcd: (
    a: number | bigint | string | ExactNumberType,
    b: number | bigint | string | ExactNumberType,
  ) => ExactNumberType;
  lcm: (
    a: number | bigint | string | ExactNumberType,
    b: number | bigint | string | ExactNumberType,
  ) => ExactNumberType;
};

export const ExactNumber = <ExactNumberInterface>((
  x: number | bigint | string | ExactNumberType,
  y?: number | bigint | string | ExactNumberType,
) => {
  if (x === undefined) {
    throw new Error('First parameter cannot be undefined');
  }

  const xVal = parseParameter(x);
  if (y === undefined) {
    return xVal;
  }

  const yVal = parseParameter(y);
  return new Fraction(xVal, 1n).div(new Fraction(yVal, 1n));
});

ExactNumber.min = <ExactNumberInterface>((...params) => {
  if ((params as any).length === 0) {
    throw new Error('Got empty array');
  }

  let minVal = ExactNumber(params[0]);
  for (let i = 1; i < params.length; i++) {
    const x = ExactNumber(params[i]);
    if (x.lt(minVal)) {
      minVal = x;
    }
  }

  return minVal;
});

ExactNumber.max = <ExactNumberInterface>((...params) => {
  if ((params as any).length === 0) {
    throw new Error('Got empty array');
  }

  let maxVal = ExactNumber(params[0]);
  for (let i = 1; i < params.length; i++) {
    const x = ExactNumber(params[i]);
    if (x.gt(maxVal)) {
      maxVal = x;
    }
  }

  return maxVal;
});

const parseDigitsInBase = (str: string, radix: number) => {
  let res = 0n;
  for (let i = 0; i < str.length; i++) {
    const c = str.charAt(i);

    const digit = parseInt(c, radix);
    if (Number.isNaN(digit)) {
      throw new Error(`Invalid digit "${c}"`);
    }

    res *= BigInt(radix);
    res += BigInt(digit);
  }
  return res;
};

ExactNumber.fromBase = <ExactNumberInterface>((num: string, radix: number) => {
  if (typeof num !== 'string') {
    throw new Error('First parameter must be string');
  }

  if (!Number.isSafeInteger(radix) || radix < 2 || radix > 16) {
    throw new Error('Invalid radix');
  }

  if (radix === 10) {
    return ExactNumber(num);
  }

  num = num.trim();
  if (num.length === 0) throw new Error('Empty string is not allowed');
  const isNegative = num.startsWith('-');
  if (isNegative) {
    num = num.slice(1);
  }

  const m = num.match(/^([0-9a-f]*)(?:\.([0-9a-f]*)(?:\(([0-9a-f]+)\))?)?$/i);
  if (!m) {
    throw new Error(`Cannot parse number "${num}"`);
  }

  const wholePartStr = m[1] ?? '';
  const nonRepeatingPartStr = m[2] ?? '';
  const repeatingPartStr = m[3] ?? '';

  if (repeatingPartStr.length > 0) {
    const numerator =
      parseDigitsInBase(`${wholePartStr}${nonRepeatingPartStr}${repeatingPartStr}`, radix) -
      parseDigitsInBase(`${wholePartStr}${nonRepeatingPartStr}`, radix);

    const denominator = parseDigitsInBase(
      (radix - 1).toString(radix).repeat(repeatingPartStr.length) + '0'.repeat(nonRepeatingPartStr.length),
      radix,
    );

    const res = new Fraction(numerator, denominator).normalize();
    return isNegative ? res.neg() : res;
  }

  const whole = parseDigitsInBase(wholePartStr, radix);
  const nonRepeating = parseDigitsInBase(nonRepeatingPartStr, radix);

  const fracPath = new Fraction(nonRepeating, BigInt(radix) ** BigInt(nonRepeatingPartStr.length));

  const res = new Fraction(whole, 1n).add(fracPath).normalize();
  return isNegative ? res.neg() : res;
});

/** Used to iterate over exact rational numbers.
 * E.g. Iterating from -2 to 3 with 0.5 increments:
 * for(const x of ExactNumber.range(-2, 3, '0.5')) {} */
// eslint-disable-next-line func-names
ExactNumber.range = function* (
  _start: ExactNumberParameter,
  _end: ExactNumberParameter,
  _increment: ExactNumberParameter,
) {
  const end = ExactNumber(_end);
  const increment = ExactNumber(_increment ?? 1);
  let i = ExactNumber(_start);
  while (i.lt(end)) {
    yield i;
    i = i.add(increment);
  }
};

ExactNumber.gcd = <ExactNumberInterface>((a, b) => {
  const aNum = ExactNumber(a).abs();
  const bNum = ExactNumber(b).abs();

  let maxNum = bNum.gt(aNum) ? bNum : aNum;
  let minNum = maxNum.eq(aNum) ? bNum : aNum;

  while (true) {
    if (minNum.isZero()) return maxNum;
    maxNum = maxNum.mod(minNum);
    if (maxNum.isZero()) return minNum;
    minNum = minNum.mod(maxNum);
  }
});

ExactNumber.lcm = <ExactNumberInterface>((a, b) => {
  const aNum = ExactNumber(a).abs();
  const bNum = ExactNumber(b).abs();
  const product = aNum.mul(bNum);
  if (product.isZero()) throw new Error('LCM of zero is undefined');
  const gcd = ExactNumber.gcd(aNum, bNum);
  return product.div(gcd);
});

// ExactNumber.modpow
