import { ExactNumber } from '../ExactNumber';
import { ExactNumberType } from '../types';
import { sqrt } from './roots';
import { PI } from './trigonometry';

export const atan = (value: number | bigint | string | ExactNumberType, digits: number) => {
  let x = ExactNumber(value);

  if (x.isZero()) return '0';
  if (x.abs().isOne()) {
    return ExactNumber(PI(digits))
      .div(4 * x.sign())
      .toFixed(digits);
  }

  // Ensure |x| < 0.42
  // atan(x) = 2 * atan(x / (1 + sqrt(1 + x^2)))
  let reductionSteps = 0;
  while (x.abs().gt('0.42')) {
    const root = ExactNumber(sqrt(x.pow(2n).add(1n), digits + 10));
    x = x.div(root.add(1n));
    reductionSteps++;
  }

  // atan(x) = x - x^3/3 + x^5/5 - x^7/7 + ...
  const x2 = x.pow(2).normalize();
  const x4 = x2.pow(2).normalize();

  let denominator = 3n;

  let xk = x.sub(x.mul(x2).div(denominator)) as ExactNumberType;

  let xPow = x.mul(x4);

  const maxError = ExactNumber(1n).div(10n ** BigInt(digits + 10));

  while (true) {
    // x^5/d - x^7/(d + 2)
    // = x^5 * (-ax^2 + (a + 2)) / (a * (a + 2))
    denominator += 2n;
    const denominator2 = denominator + 2n;
    const numerator = xPow.mul(x2.mul(-denominator).add(denominator2));
    const term = numerator.div(denominator * denominator2);
    denominator = denominator2;
    xPow = xPow.mul(x4);

    xk = xk.add(term).trunc(digits + 10);

    if (term.abs().lt(maxError)) {
      break;
    }
  }

  // undo argument reduction
  xk = xk.mul(2n ** BigInt(reductionSteps));

  return xk.toFixed(digits);
};

export const asin = (value: number | bigint | string | ExactNumberType, digits: number): string => {
  const x = ExactNumber(value);

  if (x.isZero()) return '0';
  if (x.abs().isOne()) {
    return ExactNumber(PI(digits)).mul(x.sign()).div(2n).toFixed(digits);
  }
  if (x.abs().eq('1/2')) {
    return ExactNumber(PI(digits)).mul(x.sign()).div(6n).toFixed(digits);
  }
  if (x.gt(1n) || x.lt(-1n)) {
    throw new Error('Out of range');
  }

  // asin(x) = 2*atan(x / (1 + sqrt(1 - x^2)))

  const root = ExactNumber(sqrt(x.pow(2n).neg().add(1), digits + 10));
  const atangent = ExactNumber(atan(x.div(root.add(1n)), digits + 10));
  return atangent.mul(2).toFixed(digits);
};

export const acos = (value: number | bigint | string | ExactNumberType, digits: number): string => {
  const x = ExactNumber(value);

  if (x.isZero()) return ExactNumber(PI(digits)).div(2n).toFixed(digits);

  if (x.isOne()) {
    return '0';
  }

  if (x.abs().isOne()) {
    return PI(digits);
  }

  if (x.abs().eq('1/2')) {
    const PI_OVER_3 = ExactNumber(PI(digits)).div(3n);
    return x.sign() === -1 ? PI_OVER_3.mul(2n).toFixed(digits) : PI_OVER_3.toFixed(digits);
  }

  if (x.gt(1n) || x.lt(-1n)) {
    throw new Error('Out of range');
  }

  // acos(x) = pi/2 - asin(x)
  return ExactNumber(PI(digits + 10))
    .div(2n)
    .sub(asin(x, digits + 10))
    .toFixed(digits);
};
