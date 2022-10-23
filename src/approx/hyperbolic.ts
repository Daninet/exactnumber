import { FixedNumber } from '../FixedNumber';
import { ExactNumber } from '../ExactNumber';
import { ExactNumberType, RoundingMode } from '../types';

// sinh x = x + x^3/3! + x^5/5! + ...
function* sinhGenerator(x: ExactNumberType, decimals: number) {
  let numerator = x;
  let denominator = 1n;
  const x2 = x.pow(2n).normalize();
  let sum = x.trunc(decimals + 5);
  let i = 2n;
  while (true) {
    numerator = numerator.mul(x2);
    denominator *= i * (i + 1n);
    i += 2n;
    const term = numerator.div(denominator);
    sum = sum.add(term).trunc(decimals + 5);
    yield { term, sum };
  }
}

export const sinh = (x: number | bigint | string | ExactNumberType, decimals: number): ExactNumberType => {
  const input = ExactNumber(x).round(decimals, RoundingMode.NEAREST_AWAY_FROM_ZERO);

  const maxError = new FixedNumber(`1e-${decimals + 5}`);

  const gen = sinhGenerator(input, decimals);
  for (const { term, sum } of gen) {
    if (term.abs().lt(maxError)) {
      return sum.trunc(decimals);
    }
  }

  return ExactNumber(0);
};

// cosh x = 1 + x^2/2! + x^4/4! + ...
function* coshGenerator(x: ExactNumberType, decimals: number) {
  const x2 = x.pow(2n).normalize();
  let numerator = x2;
  let denominator = 2n;
  let sum = numerator
    .div(denominator)
    .add(1n)
    .trunc(decimals + 5);

  let i = 3n;
  while (true) {
    numerator = numerator.mul(x2);
    denominator *= i * (i + 1n);
    i += 2n;
    const term = numerator.div(denominator);
    sum = sum.add(term).trunc(decimals + 5);
    yield { term, sum };
  }
}

export const cosh = (x: number | bigint | string | ExactNumberType, decimals: number): ExactNumberType => {
  const input = ExactNumber(x).round(decimals, RoundingMode.NEAREST_AWAY_FROM_ZERO);

  const maxError = new FixedNumber(`1e-${decimals + 5}`);

  const gen = coshGenerator(input, decimals);
  for (const { term, sum } of gen) {
    if (term.abs().lt(maxError)) {
      return sum.trunc(decimals);
    }
  }

  return ExactNumber(0);
};

export const tanh = (angle: number | bigint | string | ExactNumberType, decimals: number): ExactNumberType => {
  const angleNum = ExactNumber(angle).round(decimals, RoundingMode.NEAREST_AWAY_FROM_ZERO);
  if (angleNum.isZero()) return ExactNumber(0);

  // tanh x = sinh x / cosh x;
  const res = ExactNumber(sinh(angleNum, decimals + 10)).div(cosh(angleNum, decimals + 10));
  return res.trunc(decimals);
};
