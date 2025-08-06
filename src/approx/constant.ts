import type { ExactNumberType } from '../types';
import { FixedNumber } from '../FixedNumber';

export class ConstantCache {
  private fn: (decimals: number) => ExactNumberType;
  private max: number;

  private cachedDecimals = 0;
  private cache: FixedNumber;

  constructor(fn: (decimals: number) => ExactNumberType, max: number) {
    this.fn = fn;
    this.max = max;
  }

  get(decimals: number): FixedNumber {
    if (decimals <= this.cachedDecimals) {
      return this.cache.trunc(decimals);
    }

    const calculated = new FixedNumber(this.fn(decimals));
    const decimalsCached = Math.min(this.max, decimals);
    if (this.cachedDecimals !== decimalsCached) {
      this.cache = calculated.trunc(decimalsCached);
      this.cachedDecimals = decimalsCached;
    }

    return calculated;
  }
}
