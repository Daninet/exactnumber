import { FixedNumber } from '../FixedNumber';
import { ExactNumber } from '../ExactNumber';
import { ExactNumberType } from '../types';

// sinh x = x + x^3/3! + x^5/5! + ...
function* sinhGenerator(x: ExactNumberType, digits: number) {
  let numerator = x;
  let denominator = 1n;
  const x2 = x.pow(2n).normalize();
  let sum = x.trunc(digits + 5);
  let i = 2n;
  while (true) {
    numerator = numerator.mul(x2);
    denominator *= i * (i + 1n);
    i += 2n;
    const term = numerator.div(denominator);
    sum = sum.add(term).trunc(digits + 5);
    yield { term, sum };
  }
}

export const sinh = (x: number | bigint | string | ExactNumberType, digits: number): string => {
  const input = ExactNumber(x);

  const maxError = new FixedNumber(`1e-${digits + 5}`);

  const gen = sinhGenerator(input, digits);
  for (const { term, sum } of gen) {
    if (term.abs().lt(maxError)) {
      return sum.toFixed(digits);
    }
  }

  return '';
};

// cosh x = 1 + x^2/2! + x^4/4! + ...
function* coshGenerator(x: ExactNumberType, digits: number) {
  const x2 = x.pow(2n).normalize();
  let numerator = x2;
  let denominator = 2n;
  let sum = numerator
    .div(denominator)
    .add(1n)
    .trunc(digits + 5);

  let i = 3n;
  while (true) {
    numerator = numerator.mul(x2);
    denominator *= i * (i + 1n);
    i += 2n;
    const term = numerator.div(denominator);
    sum = sum.add(term).trunc(digits + 5);
    yield { term, sum };
  }
}

export const cosh = (x: number | bigint | string | ExactNumberType, digits: number) => {
  const input = ExactNumber(x);

  const maxError = new FixedNumber(`1e-${digits + 5}`);

  const gen = coshGenerator(input, digits);
  for (const { term, sum } of gen) {
    if (term.abs().lt(maxError)) {
      return sum.toFixed(digits);
    }
  }

  return '';
};

export const tanh = (angle: number | bigint | string | ExactNumberType, digits: number) => {
  const angleNum = ExactNumber(angle);
  if (angleNum.isZero()) return '0';

  // tanh x = sinh x / cosh x;
  const res = ExactNumber(sinh(angle, digits + 10)).div(cosh(angle, digits + 10));
  return res.toFixed(digits);
};
