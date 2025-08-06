import { FixedNumber } from '../FixedNumber';
import { ExactNumber } from '../ExactNumber';
import type { ExactNumberType } from '../types';
import { sqrt } from './roots';
import { _0N, _1N, _2N, _3N } from '../util';

// sinh x = x + x^3/3! + x^5/5! + ...
function* sinhGenerator(x: ExactNumberType, decimals: number) {
  let numerator = x;
  let denominator = _1N;
  const x2 = x.pow(_2N).normalize();
  let sum = x.trunc(decimals + 5);
  let i = _2N;
  while (true) {
    numerator = numerator.mul(x2);
    denominator *= i * (i + _1N);
    i += _2N;
    const term = numerator.div(denominator);
    sum = sum.add(term).trunc(decimals + 5);
    yield { term, sum };
  }
}

export const sinh = (x: number | bigint | string | ExactNumberType, decimals: number): ExactNumberType => {
  const input = ExactNumber(x);

  const maxError = new FixedNumber(`1e-${decimals + 5}`);

  const gen = sinhGenerator(input, decimals);
  for (const { term, sum } of gen) {
    if (term.abs().lt(maxError)) {
      return sum.trunc(decimals);
    }
  }

  return ExactNumber(_0N);
};

// cosh x = 1 + x^2/2! + x^4/4! + ...
function* coshGenerator(x: ExactNumberType, decimals: number) {
  const x2 = x.pow(_2N).normalize();
  let numerator = x2;
  let denominator = _2N;
  let sum = numerator
    .div(denominator)
    .add(_1N)
    .trunc(decimals + 5);

  let i = _3N;
  while (true) {
    numerator = numerator.mul(x2);
    denominator *= i * (i + _1N);
    i += _2N;
    const term = numerator.div(denominator);
    sum = sum.add(term).trunc(decimals + 5);
    yield { term, sum };
  }
}

export const cosh = (x: number | bigint | string | ExactNumberType, decimals: number): ExactNumberType => {
  const input = ExactNumber(x);

  const maxError = new FixedNumber(`1e-${decimals + 5}`);

  const gen = coshGenerator(input, decimals);
  for (const { term, sum } of gen) {
    if (term.abs().lt(maxError)) {
      return sum.trunc(decimals);
    }
  }

  return ExactNumber(_0N);
};

export const tanh = (angle: number | bigint | string | ExactNumberType, decimals: number): ExactNumberType => {
  const angleNum = ExactNumber(angle);
  if (angleNum.isZero()) return ExactNumber(_0N);

  // tanh x = sinh x / cosh x;
  // sinh x = sqrt((cosh(x)^2) - 1);

  const coshRes = cosh(angleNum, decimals + 10).abs();
  const sinhRes = sqrt(coshRes.pow(_2N).sub(_1N), decimals + 10);

  const res = sinhRes.div(coshRes).mul(angleNum.sign());
  return res.trunc(decimals);
};
