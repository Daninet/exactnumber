import { FixedNumber } from '../FixedNumber';
import { ExactNumber } from '../ExactNumber';
import { ExactNumberType, RoundingMode } from '../types';
import { ConstantCache } from './constant';
import { sqrt } from './roots';
import { limitDecimals, _0N, _1N, _2N, _3N, _4N, _10N, _24N } from '../util';

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

const evaluateAngle = (x: ExactNumberType, decimals: number) => {
  const pi = new FixedNumber(PI(decimals + 5));
  const twoPi = pi.mul(2n);
  const roundedX = x.round(decimals + 5, RoundingMode.NEAREST_AWAY_FROM_ZERO);
  // a number between (-1, 1)
  let turns = roundedX.div(twoPi).fracPart();

  // normalize into the [0, 1) interval
  if (turns.lt(0n)) {
    turns = turns.add(1n);
  }

  // limit precision
  turns = turns.round(decimals + 5);

  const quadrant = turns.div('0.25').floor().toNumber() + 1;

  let subHalfPiAngle = twoPi.mul(turns);
  let quadrantDegrees = turns.mul(360n);
  if (quadrant === 4) {
    subHalfPiAngle = twoPi.sub(subHalfPiAngle);
    quadrantDegrees = ExactNumber(360).sub(quadrantDegrees);
  } else if (quadrant === 3) {
    subHalfPiAngle = subHalfPiAngle.sub(pi);
    quadrantDegrees = quadrantDegrees.sub(180);
  } else if (quadrant === 2) {
    subHalfPiAngle = pi.sub(subHalfPiAngle);
    quadrantDegrees = ExactNumber(180).sub(quadrantDegrees);
  }

  return { quadrantDegrees: quadrantDegrees.round(decimals), quadrant, subHalfPiAngle };
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

const resultHandler = (value: string | ExactNumberType, shouldNegate: boolean, decimals: number): ExactNumberType => {
  let convertedValue = ExactNumber(value);
  if (shouldNegate) {
    convertedValue = convertedValue.neg();
  }
  return convertedValue.trunc(decimals);
};

export const cos = (_angle: number | bigint | string | ExactNumberType, decimals: number): ExactNumberType => {
  const EXTRA_DECIMALS = decimals + 10;

  const angle = limitDecimals(ExactNumber(_angle), decimals + 5);
  const { quadrantDegrees, subHalfPiAngle: x, quadrant } = evaluateAngle(angle, decimals);

  const shouldNegate = quadrant === 2 || quadrant === 3;

  if (quadrantDegrees.isZero()) return resultHandler('1', shouldNegate, decimals);
  if (quadrantDegrees.eq(30n)) {
    return resultHandler(ExactNumber(sqrt(3n, decimals + 5)).div(2n), shouldNegate, decimals);
  }
  if (quadrantDegrees.eq(45n)) {
    return resultHandler(ExactNumber(sqrt(2n, decimals + 5)).div(2n), shouldNegate, decimals);
  }
  if (quadrantDegrees.eq(60n)) return resultHandler('0.5', shouldNegate, decimals);
  if (quadrantDegrees.eq(90n)) return resultHandler('0', shouldNegate, decimals);

  const maxError = ExactNumber(`1e-${EXTRA_DECIMALS}`);

  const gen = cosGenerator(x, decimals);
  for (const { term, sum } of gen) {
    if (term.lt(maxError)) {
      return resultHandler(sum, shouldNegate, decimals);
    }
  }

  return ExactNumber(0);
};

export const sin = (angle: number | bigint | string | ExactNumberType, decimals: number): ExactNumberType => {
  const pi = new FixedNumber(PI(decimals + 10));
  const x = limitDecimals(ExactNumber(angle), decimals + 5);
  return cos(pi.div(_2N).sub(x), decimals + 5).trunc(decimals);
};

export const tan = (angle: number | bigint | string | ExactNumberType, decimals: number): ExactNumberType => {
  const angleNum = limitDecimals(ExactNumber(angle), decimals + 5);

  const { quadrantDegrees, quadrant, subHalfPiAngle: x } = evaluateAngle(angleNum, decimals + 5);

  const shouldNegate = quadrant === 1 || quadrant === 3;

  if (quadrantDegrees.isZero()) return resultHandler('0', shouldNegate, decimals);
  if (quadrantDegrees.eq(30n)) {
    return resultHandler(ExactNumber(1n).div(sqrt(3n, decimals + 5)), shouldNegate, decimals);
  }
  if (quadrantDegrees.eq(45n)) {
    return resultHandler('1', shouldNegate, decimals);
  }
  if (quadrantDegrees.eq(60n)) return resultHandler(sqrt(3n, decimals + 5), shouldNegate, decimals);
  if (quadrantDegrees.eq(90n)) {
    throw new Error('Out of range');
  }

  // tan x = sqrt((1 - cos(2x)) / 1 + cos(2x))
  const cos2x = ExactNumber(cos(x.mul(_2N), decimals + 5));

  const res = ExactNumber(_1N)
    .sub(cos2x)
    .div(ExactNumber(_1N).add(cos2x))
    .round(decimals + 5);

  const root = sqrt(res, decimals + 5).trunc(decimals);

  return shouldNegate ? root : root.neg();
};
