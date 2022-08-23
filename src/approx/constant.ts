import { FixedNumber } from '../FixedNumber';

export class ConstantCache {
  private fn: (digits: number) => string;
  private max: number;

  private cachedDigits = 0;
  private cache: FixedNumber;

  constructor(fn: (digits: number) => string, max: number) {
    this.fn = fn;
    this.max = max;
  }

  get(digits: number): FixedNumber {
    if (digits <= this.cachedDigits) {
      return this.cache.trunc(digits);
    }

    const calculated = new FixedNumber(this.fn(digits));
    const digitsCached = Math.min(this.max, digits);
    if (this.cachedDigits !== digitsCached) {
      this.cache = calculated.trunc(digitsCached);
      this.cachedDigits = digitsCached;
    }

    return calculated;
  }
}
