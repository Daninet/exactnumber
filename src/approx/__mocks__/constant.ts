import { FixedNumber } from '../../FixedNumber';

export class ConstantCache {
  private fn: (digits: number) => string;

  constructor(fn: (digits: number) => string) {
    this.fn = fn;
  }

  get(digits: number): FixedNumber {
    const calculated = new FixedNumber(this.fn(digits));

    return calculated;
  }
}
