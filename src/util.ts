/* eslint-disable @typescript-eslint/naming-convention */
import { FixedNumber } from './FixedNumber';
import { ExactNumberType, RoundingMode } from './types';

/** Trims trailing zeros from numbers in fixed-point format (1.23000 -> 1.23) */
export const trimTrailingZerosFromFixed = (num: string): string => {
  const pointPos = num.indexOf('.');
  if (pointPos === -1) return num;

  let firstZeroAt = num.length;
  while (firstZeroAt > pointPos && num.charAt(firstZeroAt - 1) === '0') firstZeroAt--;

  const newLength = pointPos === firstZeroAt - 1 ? pointPos : firstZeroAt;
  if (newLength === 0) return '0';
  return num.slice(0, newLength);
};

export const bigIntToStr = (num: bigint, inputDecimals: number, outputDecimals: number, trimZeros: boolean): string => {
  let str = num.toString();
  if (inputDecimals === 0 && outputDecimals === 0) return str;

  const isNegative = str.startsWith('-');
  if (isNegative) {
    str = str.slice(1);
  }

  if (inputDecimals >= str.length) {
    str = '0'.repeat(inputDecimals - str.length + 1) + str;
  }

  if (inputDecimals > 0) {
    const wholePart = str.slice(0, -inputDecimals);
    const fracPart = str.slice(-inputDecimals);

    const outFracPart =
      outputDecimals <= inputDecimals
        ? fracPart.slice(0, outputDecimals)
        : `${fracPart}${'0'.repeat(outputDecimals - inputDecimals)}`;

    if (outFracPart.length !== 0) {
      str = `${wholePart}.${outFracPart}`;
      if (trimZeros) {
        str = trimTrailingZerosFromFixed(str);
      }
    } else {
      str = wholePart;
    }
  } else if (outputDecimals > 0 && !trimZeros) {
    str = `${str}.${'0'.repeat(outputDecimals)}`;
  }

  return isNegative ? `-${str}` : str;
};

// used by the approximation functions to limit input precision (speed optimization)
export const limitDecimals = (x: ExactNumberType, decimals: number) => {
  x = x.normalize();
  if (x instanceof FixedNumber) {
    return x.round(decimals, RoundingMode.NEAREST_AWAY_FROM_ZERO);
  }

  return x;
};

// BigInt literals (1n) are not supported by all parsers
// also, the BigInt() constructor is still too slow to call in a loop
export const _0N = BigInt(0);
export const _1N = BigInt(1);
export const _2N = BigInt(2);
export const _3N = BigInt(3);
export const _4N = BigInt(4);
export const _5N = BigInt(5);
export const _10N = BigInt(10);
export const _24N = BigInt(24);
