import { FixedNumber } from '../FixedNumber';
import { ExactNumber } from '../ExactNumber';
import { ExactNumberType, RoundingMode } from '../types';
import { ConstantCache } from './constant';
import { sqrt } from './roots';

// TODO: https://en.wikipedia.org/wiki/Niven%27s_theorem
// On Lambert's Proof of the Irrationality of π: https://www.jstor.org/stable/2974737

// Faster solution here -> https://arxiv.org/pdf/1706.08835.pdf
const PIcalc = (digits: number) => {
  if (digits === 0) return '3';

  // PI = 3 + 3(1/2)(1/3)(1/4) + 3((1/2)(3/4))(1/5)(1/4^2) + 3((1/2)(3/4)(5/6))(1/7)(1/4^3) + ...
  let i = 1n;
  let x = 3n * 10n ** BigInt(digits + 20);
  let res = x;
  while (x !== 0n) {
    x = (x * i) / ((i + 1n) * 4n);
    i += 2n;
    res += x / i;
  }

  return `3.${res.toString().slice(1, digits + 1)}`;
};

const PI_CACHE = new ConstantCache(PIcalc, 1000);

export const PI = (digits: number) => {
  if (digits === 0) return '3';
  return PI_CACHE.get(digits).toFixed(digits);
};

const toLessThanHalfPi = (x: ExactNumberType, digits: number) => {
  const pi = new FixedNumber(PI(digits));
  const twoPi = pi.mul(2n);
  x = x.mod(twoPi);

  // x is in the [-2PI, 2PI] interval now

  if (x.gt(pi)) {
    x = x.sub(twoPi);
  } else if (x.lt(pi.neg())) {
    x = x.add(twoPi);
  }

  // x is in the [-PI, PI] interval now

  const halfPi = pi.div(2n);

  let quadrant = 0;

  if (x.gte(halfPi)) {
    quadrant = 2;
    x = pi.sub(x);
  } else if (x.gte(0n)) {
    quadrant = 1;
  } else if (x.gte(halfPi.neg())) {
    quadrant = 4;
    x = x.neg();
  } else {
    quadrant = 3;
    x = pi.sub(x.neg());
  }

  return { quadrant, x };
};

// cos x = 1 - x^2/2! + x^4/4! - ...
function* cosGenerator(x: ExactNumberType, digits: number) {
  const x2 = x.round(digits + 10, RoundingMode.NEAREST_AWAY_FROM_ZERO).pow(2n);

  let xPow = x2;

  let termDenominator = 2n;
  let sum = ExactNumber(1n).sub(xPow.div(termDenominator).trunc(digits + 10));
  let i = 3n;
  let rndErrors = 1;

  while (true) {
    // term = x^4/4! - x^6/6!
    // = (5*6*x^4 - x^6)/6!
    termDenominator *= i * (i + 1n);
    i += 2n;
    const multiplier = i * (i + 1n);
    i += 2n;
    xPow = xPow.mul(x2);
    termDenominator *= multiplier;
    let termNumerator = xPow.mul(multiplier);
    xPow = xPow.mul(x2);
    termNumerator = termNumerator.sub(xPow);

    const term = termNumerator.div(termDenominator).trunc(digits + 10);
    rndErrors++;

    sum = sum.add(term);
    // max lagrange error = x^(k+1)/(k+1)!
    // const le = xPow.mul(x).div(termDenominator * i);

    yield { term, sum, rndErrors };
  }
}

export const cos = (angle: number | bigint | string | ExactNumberType, digits: number) => {
  const EXTRA_DIGITS = digits + 10;

  const { x, quadrant } = toLessThanHalfPi(ExactNumber(angle), EXTRA_DIGITS);

  const maxError = ExactNumber(`1e-${digits + 10}`);

  const gen = cosGenerator(x, digits);
  for (const { term, sum, rndErrors } of gen) {
    if (term.lt(maxError)) {
      const a = sum.trunc(digits);
      const err = term.add(maxError.mul(rndErrors));
      const b = sum.add(err).trunc(digits);

      if (a.eq(b)) {
        const res = quadrant === 1 || quadrant === 4 ? sum : sum.neg();
        const strRes = res.round(digits + 3, RoundingMode.TO_ZERO).toFixed(digits);
        return strRes;
      }
      // rounding errors are too large
      // has to retry with higher precision
      return ExactNumber(cos(angle, EXTRA_DIGITS + 50)).toFixed(digits);
    }
  }

  return '';
};

export const sin = (angle: number | bigint | string | ExactNumberType, digits: number): string => {
  const pi = new FixedNumber(PI(digits + 10));
  const x = ExactNumber(angle);
  return cos(pi.div(2n).sub(x), digits);
};

export const tan = (angle: number | bigint | string | ExactNumberType, digits: number): string => {
  const angleNum = ExactNumber(angle);
  if (angleNum.isZero()) return '0';

  // tan x = sqrt((1 - cos(2x)) / 1 + cos(2x))
  const { quadrant, x } = toLessThanHalfPi(angleNum, digits + 10);
  const cos2x = ExactNumber(cos(x.mul(2n), digits + 10));
  const res = ExactNumber(1n)
    .sub(cos2x)
    .div(ExactNumber(1n).add(cos2x))
    .round(digits + 10);
  // console.log(res);
  const root = sqrt(res, digits);

  return quadrant === 1 || quadrant === 3 ? root : `-${root}`;
};
