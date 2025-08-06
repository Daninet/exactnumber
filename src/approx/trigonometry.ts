import { FixedNumber } from '../FixedNumber';
import { ExactNumber } from '../ExactNumber';
import { type ExactNumberParameter, type ExactNumberType, RoundingMode } from '../types';
import { ConstantCache } from './constant';
import { sqrt } from './roots';
import { _0N, _1N, _2N, _3N, _4N, _10N, _24N } from '../util';

// TODO: https://en.wikipedia.org/wiki/Niven%27s_theorem
// On Lambert's Proof of the Irrationality of π: https://www.jstor.org/stable/2974737

// Faster solution here -> https://arxiv.org/pdf/1706.08835.pdf
const PIcalc = (decimals: number): ExactNumberType => {
  if (decimals === 0) return ExactNumber(_3N);

  // PI = 3 + 3(1/2)(1/3)(1/4) + 3((1/2)(3/4))(1/5)(1/4^2) + 3((1/2)(3/4)(5/6))(1/7)(1/4^3) + ...
  let i = _1N;
  let x = _3N * _10N ** BigInt(decimals + 20);
  let res = x;

  while (x !== _0N) {
    x = (x * i) / ((i + _1N) * _4N);
    i += _2N;
    res += x / i;
  }

  return ExactNumber(`3.${res.toString().slice(1, decimals + 1)}`);
};

const PI_CACHE = new ConstantCache(PIcalc, 1000);

export const PI = (decimals: number): ExactNumberType => {
  if (decimals === 0) return ExactNumber(_3N);
  return PI_CACHE.get(decimals).trunc(decimals);
};

const getMultiplierOf = (x: ExactNumberType, y: ExactNumberType, decimals: number) => {
  const precision = Math.max(3, decimals);
  const input = x.trunc(precision);
  const closestQuotient = input.div(y).round();
  const ref = y.mul(closestQuotient).trunc(precision);

  if (ref.eq(input)) {
    return closestQuotient;
  }

  return null;
};

type EvaluationRes = { specialCaseDeg: number | null; quadrant: number; subHalfPiAngle: ExactNumberType | null };

const evaluateSpecialAngle = (angleMultiplier: ExactNumberType): EvaluationRes => {
  let multiplier = angleMultiplier.mod(_24N).toNumber();
  if (multiplier < 0) {
    multiplier += 24;
  }
  const quadrant = Math.floor(multiplier / 6) + 1;

  let specialCaseDeg = multiplier * 15;
  if (quadrant === 4) {
    specialCaseDeg = 360 - specialCaseDeg;
  } else if (quadrant === 3) {
    specialCaseDeg -= 180;
  } else if (quadrant === 2) {
    specialCaseDeg = 180 - specialCaseDeg;
  }

  return {
    specialCaseDeg,
    quadrant,
    subHalfPiAngle: null,
  };
};

export const evaluateAngle = (x: ExactNumberType, decimals: number): EvaluationRes => {
  let angle = x.round(decimals + 5, RoundingMode.NEAREST_AWAY_FROM_ZERO);
  const pi = PI(decimals + 5);

  const angleMultiplier = getMultiplierOf(angle, pi.div(12), decimals);
  if (angleMultiplier !== null) {
    return evaluateSpecialAngle(angleMultiplier);
  }

  const twoPi = pi.mul(_2N);

  angle = angle.mod(twoPi);

  if (angle.sign() === -1) {
    angle = angle.add(twoPi);
  }

  const quadrant = angle.mul(_2N).div(pi).floor().toNumber() + 1;

  let subHalfPiAngle = angle;
  if (quadrant === 4) {
    subHalfPiAngle = twoPi.sub(subHalfPiAngle);
  } else if (quadrant === 3) {
    subHalfPiAngle = subHalfPiAngle.sub(pi);
  } else if (quadrant === 2) {
    subHalfPiAngle = pi.sub(subHalfPiAngle);
  }

  return {
    specialCaseDeg: null,
    quadrant,
    subHalfPiAngle,
  };
};

// cos x = 1 - x^2/2! + x^4/4! - ...
function* cosGenerator(x: ExactNumberType, decimals: number) {
  const x2 = x.round(decimals + 10, RoundingMode.NEAREST_AWAY_FROM_ZERO).pow(_2N);

  let xPow = x2;

  let termDenominator = _2N;
  let sum = ExactNumber(_1N).sub(xPow.div(termDenominator).trunc(decimals + 10));
  let i = _3N;

  while (true) {
    // term = x^4/4! - x^6/6!
    // = (5*6*x^4 - x^6)/6!
    termDenominator *= i * (i + _1N);
    i += _2N;
    const multiplier = i * (i + _1N);
    i += _2N;
    xPow = xPow.mul(x2);
    termDenominator *= multiplier;
    let termNumerator = xPow.mul(multiplier);
    xPow = xPow.mul(x2);
    termNumerator = termNumerator.sub(xPow);

    const term = termNumerator.div(termDenominator).trunc(decimals + 10);

    sum = sum.add(term);
    // max lagrange error = x^(k+1)/(k+1)!

    yield { term, sum };
  }
}

const resultHandler = (
  value: bigint | string | ExactNumberType,
  shouldNegate: boolean,
  decimals: number,
): ExactNumberType => {
  let convertedValue = ExactNumber(value);
  if (shouldNegate) {
    convertedValue = convertedValue.neg();
  }
  return convertedValue.trunc(decimals);
};

const getCosSpecialValue = (angleDeg: number, shouldNegate: boolean, decimals: number) => {
  let res: ExactNumberParameter;
  if (angleDeg === 0) {
    res = _1N;
  } else if (angleDeg === 30) {
    res = ExactNumber(sqrt(_3N, decimals + 5)).div(_2N);
  } else if (angleDeg === 45) {
    res = ExactNumber(sqrt(_2N, decimals + 5)).div(_2N);
  } else if (angleDeg === 60) {
    res = '0.5';
  } else if (angleDeg === 90) {
    res = _0N;
  } else {
    throw new Error();
  }

  return resultHandler(res, shouldNegate, decimals);
};

export const cos = (_angle: number | bigint | string | ExactNumberType, decimals: number): ExactNumberType => {
  const EXTRA_DECIMALS = decimals + 10;

  const angle = ExactNumber(_angle).limitDecimals(decimals + 5);
  const { specialCaseDeg, subHalfPiAngle: x, quadrant } = evaluateAngle(angle, decimals);

  const shouldNegate = quadrant === 2 || quadrant === 3;

  if (specialCaseDeg !== null) {
    return getCosSpecialValue(specialCaseDeg, shouldNegate, decimals);
  }

  if (decimals <= 13) {
    const jsRes = ExactNumber(Math.cos(x.toNumber()).toString()).round(
      decimals + 2,
      RoundingMode.NEAREST_AWAY_FROM_ZERO,
    );
    return resultHandler(jsRes, shouldNegate, decimals);
  }

  const maxError = ExactNumber(`1e-${EXTRA_DECIMALS}`);

  const gen = cosGenerator(x, decimals);
  for (const { term, sum } of gen) {
    if (term.lt(maxError)) {
      return resultHandler(sum, shouldNegate, decimals);
    }
  }

  return ExactNumber(0);
};

export const sin = (_angle: number | bigint | string | ExactNumberType, decimals: number): ExactNumberType => {
  const angle = ExactNumber(_angle).limitDecimals(decimals + 5);
  const { specialCaseDeg, quadrant, subHalfPiAngle: x } = evaluateAngle(angle, decimals);

  const shouldNegate = quadrant === 3 || quadrant === 4;

  if (specialCaseDeg !== null) {
    return getCosSpecialValue(90 - specialCaseDeg, shouldNegate, decimals);
  }

  if (decimals <= 13) {
    const jsRes = ExactNumber(Math.sin(x.toNumber()).toString()).round(
      decimals + 2,
      RoundingMode.NEAREST_AWAY_FROM_ZERO,
    );
    return resultHandler(jsRes, shouldNegate, decimals);
  }

  const pi = new FixedNumber(PI(decimals + 5));

  return cos(pi.div(_2N).sub(angle), decimals).trunc(decimals);
};

export const tan = (angle: number | bigint | string | ExactNumberType, decimals: number): ExactNumberType => {
  const angleNum = ExactNumber(angle);

  const { specialCaseDeg, quadrant, subHalfPiAngle: x } = evaluateAngle(angleNum, decimals);

  const shouldNegate = quadrant === 2 || quadrant === 4;

  if (specialCaseDeg !== null) {
    if (specialCaseDeg === 0) return resultHandler('0', shouldNegate, decimals);
    if (specialCaseDeg === 30) {
      return resultHandler(ExactNumber(_1N).div(sqrt(_3N, decimals + 5)), shouldNegate, decimals);
    }
    if (specialCaseDeg === 45) {
      return resultHandler('1', shouldNegate, decimals);
    }
    if (specialCaseDeg === 60) return resultHandler(sqrt(_3N, decimals + 5), shouldNegate, decimals);
    if (specialCaseDeg === 90) {
      throw new Error('Out of range');
    }
    throw new Error();
  }

  const xNumber = x.toNumber();
  if (decimals <= 13 && Math.abs(xNumber) < 1.56) {
    // 1.56 = arctan(99)
    const jsRes = ExactNumber(Math.tan(xNumber).toString()).round(decimals + 2, RoundingMode.NEAREST_AWAY_FROM_ZERO);
    return resultHandler(jsRes, shouldNegate, decimals);
  }

  // tan x = sqrt((1 - cos(2x)) / 1 + cos(2x))
  const cos2x = ExactNumber(cos(x.mul(_2N), decimals + 5));

  const res = ExactNumber(_1N)
    .sub(cos2x)
    .div(ExactNumber(_1N).add(cos2x))
    .round(decimals + 5);

  const root = sqrt(res, decimals + 5).trunc(decimals);

  return shouldNegate ? root.neg() : root;
};
