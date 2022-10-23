import { ExactNumber } from '../ExactNumber';
import { ExactNumberType, RoundingMode } from '../types';
import { sqrt } from './roots';
import { PI } from './trigonometry';

// atan x = x - x^3/3 + x^5/5 - x^7/7 + ...
function* atanGenerator(x: ExactNumberType, decimals: number) {
  const x2 = x.pow(2n).normalize();
  const x4 = x2.pow(2n).normalize();
  let denominator = 3n;

  let sum = x.sub(x.mul(x2).div(denominator));

  let xPow = x.mul(x4);

  while (true) {
    // x^5/d - x^7/(d + 2)
    // = x^5 * (-ax^2 + (a + 2)) / (a * (a + 2))
    denominator += 2n;
    const denominator2 = denominator + 2n;
    const numerator = xPow.mul(x2.mul(-denominator).add(denominator2));
    const term = numerator.div(denominator * denominator2);
    denominator = denominator2;
    xPow = xPow.mul(x4);

    sum = sum.add(term).trunc(decimals + 10);

    yield { term, sum };
  }
}

export const atan = (value: number | bigint | string | ExactNumberType, decimals: number): ExactNumberType => {
  let x = ExactNumber(value).round(decimals, RoundingMode.NEAREST_AWAY_FROM_ZERO);

  if (x.isZero()) return ExactNumber(0);
  if (x.abs().isOne()) {
    return ExactNumber(PI(decimals))
      .div(4 * x.sign())
      .trunc(decimals);
  }

  // Ensure |x| < 0.42
  // atan(x) = 2 * atan(x / (1 + sqrt(1 + x^2)))
  let reductionSteps = 0;
  const reductionLimit = ExactNumber('0.42');
  while (x.abs().gt(reductionLimit)) {
    const root = ExactNumber(sqrt(x.pow(2n).add(1n), decimals + 10));
    x = x.div(root.add(1n));
    reductionSteps++;
  }

  const maxError = ExactNumber(`1e-${decimals + 10}`);

  const gen = atanGenerator(x, decimals);
  for (const { term, sum } of gen) {
    if (term.abs().lt(maxError)) {
      // undo argument reduction
      const res = sum.mul(2n ** BigInt(reductionSteps));
      return res.trunc(decimals);
    }
  }

  return ExactNumber(0);
};

export const asin = (value: number | bigint | string | ExactNumberType, decimals: number): ExactNumberType => {
  const x = ExactNumber(value).round(decimals, RoundingMode.NEAREST_AWAY_FROM_ZERO);

  if (x.isZero()) return ExactNumber(0);
  if (x.abs().isOne()) {
    return ExactNumber(PI(decimals)).mul(x.sign()).div(2n).trunc(decimals);
  }
  if (x.abs().eq('1/2')) {
    return ExactNumber(PI(decimals)).mul(x.sign()).div(6n).trunc(decimals);
  }
  if (x.gt(1n) || x.lt(-1n)) {
    throw new Error('Out of range');
  }

  // asin(x) = 2*atan(x / (1 + sqrt(1 - x^2)))

  const root = ExactNumber(sqrt(x.pow(2n).neg().add(1), decimals + 10));
  const atangent = ExactNumber(atan(x.div(root.add(1n)), decimals + 10));
  return atangent.mul(2).trunc(decimals);
};

export const acos = (value: number | bigint | string | ExactNumberType, decimals: number): ExactNumberType => {
  const x = ExactNumber(value).round(decimals, RoundingMode.NEAREST_AWAY_FROM_ZERO);

  if (x.isZero()) return ExactNumber(PI(decimals)).div(2n).trunc(decimals);

  if (x.isOne()) {
    return ExactNumber(0);
  }

  if (x.abs().isOne()) {
    return PI(decimals);
  }

  if (x.abs().eq('1/2')) {
    const PI_OVER_3 = ExactNumber(PI(decimals)).div(3n);
    return x.sign() === -1 ? PI_OVER_3.mul(2n).trunc(decimals) : PI_OVER_3.trunc(decimals);
  }

  if (x.gt(1n) || x.lt(-1n)) {
    throw new Error('Out of range');
  }

  // acos(x) = pi/2 - asin(x)
  return ExactNumber(PI(decimals + 10))
    .div(2n)
    .sub(asin(x, decimals + 10))
    .trunc(decimals);
};
