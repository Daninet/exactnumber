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

// export const modpow = (base: bigint, exp: bigint, mod: bigint) => {
//   let res = 1n;
//   while (exp > 0n) {
//     if (exp % 2n) {
//       res = (res * base) % mod;
//     }
//     base = base ** 2n % mod;
//     exp /= 2n;
//   }
//   return res;
// };
