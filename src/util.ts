export const trimTrailingZeros = (num: string): string => {
  let zeropos = num.length;
  while (zeropos > 0 && ['0', '.'].includes(num.charAt(zeropos - 1))) zeropos--;
  if (zeropos !== num.length) {
    return num.slice(0, zeropos);
  }
  return num;
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
    let end = str.slice(-pointRightPos);

    if (trimZeros) {
      end = trimTrailingZeros(end);
    }

    str = end.length ? `${start}.${end}` : start;
  }

  return isNegative ? `-${str}` : str;
};

export const modpow = (base: bigint, exp: bigint, mod: bigint) => {
  let res = 1n;
  while (exp > 0n) {
    if (exp % 2n) {
      res = (res * base) % mod;
    }
    base = base ** 2n % mod;
    exp /= 2n;
  }
  return res;
};
