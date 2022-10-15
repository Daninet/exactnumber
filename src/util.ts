/** Trims trailing zeros from numbers in fixed-point format (1.23000 -> 1.23) */
export const trimTrailingZeros = (num: string): string => {
  const pointPos = num.indexOf('.');
  if (pointPos === -1) return num;

  let firstZeroAt = num.length;
  while (firstZeroAt > pointPos && num.charAt(firstZeroAt - 1) === '0') firstZeroAt--;

  const newLength = pointPos === firstZeroAt - 1 ? pointPos : firstZeroAt;
  if (newLength === 0) return '0';
  return num.slice(0, newLength);
};

export const bigIntToStr = (num: bigint, pointRightPos: number, trimZeros: boolean): string => {
  let str = num.toString();
  if (pointRightPos === 0) return str;

  const isNegative = str.startsWith('-');
  if (isNegative) {
    str = str.slice(1);
  }

  if (pointRightPos >= str.length) {
    str = '0'.repeat(pointRightPos - str.length + 1) + str;
  }

  if (pointRightPos > 0) {
    const start = str.slice(0, -pointRightPos);
    const end = str.slice(-pointRightPos);

    if (end.length !== 0) {
      str = `${start}.${end}`;
      if (trimZeros) {
        str = trimTrailingZeros(str);
      }
    } else {
      str = start;
    }
  }

  return isNegative ? `-${str}` : str;
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
