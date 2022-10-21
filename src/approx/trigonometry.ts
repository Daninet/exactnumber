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

const evaluateAngle = (x: ExactNumberType, digits: number) => {
  const pi = new FixedNumber(PI(digits + 5));
  const twoPi = pi.mul(2n);
  const roundedX = x.round(digits + 5, RoundingMode.NEAREST_AWAY_FROM_ZERO);
  // a number between [0, 1)
  const turns = roundedX
    .abs()
    .div(twoPi)
    .fracPart()
    .round(digits + 5);

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

  return { quadrantDegrees: quadrantDegrees.round(digits), quadrant, subHalfPiAngle };
};

// cos x = 1 - x^2/2! + x^4/4! - ...
function* cosGenerator(x: ExactNumberType, digits: number) {
  const x2 = x.round(digits + 10, RoundingMode.NEAREST_AWAY_FROM_ZERO).pow(2n);

  let xPow = x2;

  let termDenominator = 2n;
  let sum = ExactNumber(1n).sub(xPow.div(termDenominator).trunc(digits + 10));
  let i = 3n;
  // let rndErrors = 1;

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
    // rndErrors++;

    sum = sum.add(term);
    // max lagrange error = x^(k+1)/(k+1)!
    // const le = xPow.mul(x).div(termDenominator * i);

    yield { term, sum };
  }
}

export const cosResultHandler = (quadrant: number, value: string | ExactNumberType, digits: number) => {
  let convertedValue = ExactNumber(value);
  if (quadrant === 2 || quadrant === 3) {
    convertedValue = convertedValue.neg();
  }
  const strRes = convertedValue.toFixed(digits);
  return strRes;
};

export const cos = (angle: number | bigint | string | ExactNumberType, digits: number) => {
  const EXTRA_DIGITS = digits + 10;

  const { quadrantDegrees, subHalfPiAngle: x, quadrant } = evaluateAngle(ExactNumber(angle), digits);

  if (quadrantDegrees.isZero()) return cosResultHandler(quadrant, '1', digits);
  if (quadrantDegrees.eq(30n)) {
    return cosResultHandler(quadrant, ExactNumber(sqrt(3n, digits + 5)).div(2n), digits);
  }
  if (quadrantDegrees.eq(45n)) {
    return cosResultHandler(quadrant, ExactNumber(sqrt(2n, digits + 5)).div(2n), digits);
  }
  if (quadrantDegrees.eq(60n)) return cosResultHandler(quadrant, '0.5', digits);
  if (quadrantDegrees.eq(90n)) return cosResultHandler(quadrant, '0', digits);

  const maxError = ExactNumber(`1e-${EXTRA_DIGITS}`);

  const gen = cosGenerator(x, digits);
  for (const { term, sum } of gen) {
    if (term.lt(maxError)) {
      return cosResultHandler(quadrant, sum, digits);
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
  const { quadrantDegrees, quadrant, subHalfPiAngle: x } = evaluateAngle(angleNum, digits + 10);
  const cos2x = ExactNumber(cos(x.mul(2n), digits + 10));
  const res = ExactNumber(1n)
    .sub(cos2x)
    .div(ExactNumber(1n).add(cos2x))
    .round(digits + 10);
  // console.log(angle, x.toFixed(digits), quadrant, quadrantDegrees.toFixed(digits));
  const root = sqrt(res, digits);

  return quadrant === 1 || quadrant === 3 ? root : `-${root}`;
};
