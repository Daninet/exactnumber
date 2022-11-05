import { limitDecimals, _0N, _1N, _2N, _3N } from '../util';
import { ExactNumber } from '../ExactNumber';
import { ExactNumberType } from '../types';
import { sqrt } from './roots';
import { PI } from './trigonometry';

// atan x = x - x^3/3 + x^5/5 - x^7/7 + ...
function* atanGenerator(x: ExactNumberType, decimals: number) {
  const x2 = x.pow(_2N).normalize();
  const x4 = x2.pow(_2N).normalize();
  let denominator = _3N;

  let sum = x.sub(x.mul(x2).div(denominator));

  let xPow = x.mul(x4);

  while (true) {
    // x^5/d - x^7/(d + 2)
    // = x^5 * (-ax^2 + (a + 2)) / (a * (a + 2))
    denominator += _2N;
    const denominator2 = denominator + _2N;
    const numerator = xPow.mul(x2.mul(-denominator).add(denominator2));
    const term = numerator.div(denominator * denominator2);
    denominator = denominator2;
    xPow = xPow.mul(x4);

    sum = sum.add(term).trunc(decimals + 10);

    yield { term, sum };
  }
}

export const atan = (value: number | bigint | string | ExactNumberType, decimals: number): ExactNumberType => {
  let x = limitDecimals(ExactNumber(value), decimals);

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
    const root = ExactNumber(sqrt(x.pow(_2N).add(_1N), decimals + 10));
    x = x.div(root.add(_1N));
    reductionSteps++;
  }

  const maxError = ExactNumber(`1e-${decimals + 10}`);

  const gen = atanGenerator(x, decimals);
  for (const { term, sum } of gen) {
    if (term.abs().lt(maxError)) {
      // undo argument reduction
      const res = sum.mul(_2N ** BigInt(reductionSteps));
      return res.trunc(decimals);
    }
  }

  return ExactNumber(0);
};

export const asin = (value: number | bigint | string | ExactNumberType, decimals: number): ExactNumberType => {
  const x = limitDecimals(ExactNumber(value), decimals);

  if (x.isZero()) return ExactNumber(_0N);
  if (x.abs().isOne()) {
    return ExactNumber(PI(decimals)).mul(x.sign()).div(_2N).trunc(decimals);
  }
  if (x.abs().eq('1/2')) {
    return ExactNumber(PI(decimals)).mul(x.sign()).div(6).trunc(decimals);
  }
  if (x.gt(_1N) || x.lt(-_1N)) {
    throw new Error('Out of range');
  }

  // asin(x) = 2*atan(x / (1 + sqrt(1 - x^2)))

  const root = ExactNumber(sqrt(x.pow(_2N).neg().add(_1N), decimals + 10));
  const atangent = ExactNumber(atan(x.div(root.add(_1N)), decimals + 10));
  return atangent.mul(_2N).trunc(decimals);
};

export const acos = (value: number | bigint | string | ExactNumberType, decimals: number): ExactNumberType => {
  const x = limitDecimals(ExactNumber(value), decimals);

  if (x.isZero()) return ExactNumber(PI(decimals)).div(_2N).trunc(decimals);

  if (x.isOne()) {
    return ExactNumber(_0N);
  }

  if (x.abs().isOne()) {
    return PI(decimals);
  }

  if (x.abs().eq('1/2')) {
    const PI_OVER_3 = ExactNumber(PI(decimals)).div(_3N);
    return x.sign() === -1 ? PI_OVER_3.mul(_2N).trunc(decimals) : PI_OVER_3.trunc(decimals);
  }

  if (x.gt(_1N) || x.lt(-_1N)) {
    throw new Error('Out of range');
  }

  // acos(x) = pi/2 - asin(x)
  return ExactNumber(PI(decimals + 10))
    .div(_2N)
    .sub(asin(x, decimals + 10))
    .trunc(decimals);
};
