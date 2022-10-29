import { bigIntToStr } from './util';
import { Fraction } from './Fraction';
import { ExactNumber, parseParameter } from './ExactNumber';
import { ExactNumberType, ModType, RoundingMode } from './types';

export class FixedNumber implements ExactNumberType {
  public readonly type = 'fixed';

  private readonly number: bigint;
  private decimalPos: number;

  private parseConstructorParameter(x: number | string | ExactNumberType): {
    number: bigint;
    decimalPos: number;
  } {
    if (x instanceof FixedNumber) {
      return { number: x.number, decimalPos: x.decimalPos };
    }

    if (x instanceof Fraction) {
      if (!x.isInteger()) {
        throw new Error('Cannot create FixedNumber from non-integer Fraction');
      }
      return { number: x.trunc().number, decimalPos: 0 };
    }

    if (typeof x === 'number') {
      if (!Number.isSafeInteger(x)) {
        throw new Error(
          'The specified number cannot be exactly represented as an integer. Please provide a string instead.',
        );
      }
      return { number: BigInt(x), decimalPos: 0 };
    }

    if (typeof x === 'string') {
      x = x.trim();
      if (x.length === 0) throw new Error('Empty string is not allowed');
      const m = x.match(/^(-?[0-9]*)(?:\.([0-9]*))?(?:[eE]([+-]?[0-9]+))?$/);
      if (!m) {
        throw new Error(`Cannot parse number "${x}"`);
      }

      let decimalPos = 0; // at the right end
      let str = m[1] ?? '0';
      if (m[2] !== undefined) {
        str += m[2];
        decimalPos += m[2].length;
      }

      if (m[3] !== undefined) {
        const exp = Number(m[3]);
        if (exp > 0) {
          str += '0'.repeat(exp);
        } else {
          decimalPos -= exp;
        }
      }

      return { number: BigInt(str), decimalPos };
    }

    throw new Error('Unsupported parameter!');
  }

  constructor(x: number | bigint | string | ExactNumberType, decimalPos = 0) {
    // fast path
    if (typeof x === 'bigint') {
      this.number = x;
      this.decimalPos = decimalPos;
    } else {
      const input = this.parseConstructorParameter(x);
      this.number = input.number;
      this.decimalPos = input.decimalPos;
    }
  }

  private scaleNumber(number: bigint, decimalPos: number) {
    const maxPos = Math.max(this.decimalPos, decimalPos);
    const a = maxPos === this.decimalPos ? this.number : this.number * 10n ** BigInt(maxPos - this.decimalPos);
    const b = maxPos === decimalPos ? number : number * 10n ** BigInt(maxPos - decimalPos);
    return { a, b, decimalPos: maxPos };
  }

  add(x: number | bigint | string | ExactNumberType): ExactNumberType {
    const operand = parseParameter(x);
    if (operand instanceof Fraction) {
      return operand.add(this);
    }
    const fixedOperand = operand as FixedNumber;
    const { a, b, decimalPos: newPos } = this.scaleNumber(fixedOperand.number, fixedOperand.decimalPos);
    const res = new FixedNumber(a + b, newPos);
    return res;
  }

  sub(x: number | bigint | string | ExactNumberType): ExactNumberType {
    const operand = parseParameter(x);
    return this.add(operand.neg());
  }

  mul(x: number | bigint | string | ExactNumberType): ExactNumberType {
    const operand = parseParameter(x);
    if (operand instanceof Fraction) {
      return operand.mul(this);
    }

    const fixedOperand = operand as FixedNumber;
    const product = this.number * fixedOperand.number;
    const res = new FixedNumber(product, this.decimalPos + fixedOperand.decimalPos);
    return res;
  }

  pow(x: number | bigint | string | ExactNumberType): ExactNumberType {
    const operand = parseParameter(x);
    const exp = operand.toNumber();
    if (!Number.isSafeInteger(exp)) {
      throw new Error('Unsupported parameter');
    }

    const absExp = Math.abs(exp);

    const res = new FixedNumber(this.number ** BigInt(absExp), this.decimalPos * absExp);
    return exp < 0 ? res.inv() : res;
  }

  div(x: number | bigint | string | ExactNumberType): ExactNumberType {
    const frac = this.convertToFraction();
    return frac.div(x);
  }

  divToInt(x: number | bigint | string | ExactNumberType): ExactNumberType {
    const operand = parseParameter(x);
    if (operand instanceof Fraction) {
      return this.convertToFraction().divToInt(operand);
    }

    const fixedOperand = operand as FixedNumber;
    const { a, b } = this.scaleNumber(fixedOperand.number, fixedOperand.decimalPos);
    const res = new FixedNumber(a / b);
    return res;
  }

  mod(x: number | bigint | string | ExactNumberType, type = ModType.TRUNCATED): ExactNumberType {
    const operand = parseParameter(x);
    if (operand instanceof Fraction) {
      return this.convertToFraction().mod(operand);
    }
    const fixedOperand = operand as FixedNumber;

    const { a, b, decimalPos } = this.scaleNumber(fixedOperand.number, fixedOperand.decimalPos);
    const mod = a % b;

    const res = new FixedNumber(mod, decimalPos);

    if (type === ModType.TRUNCATED) {
      return res;
    }

    if (type === ModType.FLOORED) {
      return Number(a < 0) ^ Number(b < 0) ? res.add(b) : res;
    }

    if (type === ModType.EUCLIDEAN) {
      return mod < 0 ? res.add(b < 0 ? -b : b) : res;
    }

    throw new Error('Invalid ModType');
  }

  abs(): FixedNumber {
    const res = new FixedNumber(this.number < 0 ? -this.number : this.number, this.decimalPos);
    return res;
  }

  neg() {
    return this.mul(-1n) as FixedNumber;
  }

  inv(): ExactNumberType {
    return this.convertToFraction().inv();
  }

  floor(decimals?: number) {
    if (this.decimalPos === 0) return this;

    return this.round(decimals, RoundingMode.TO_NEGATIVE);
  }

  ceil(decimals?: number) {
    if (this.decimalPos === 0) return this;

    return this.round(decimals, RoundingMode.TO_POSITIVE);
  }

  trunc(decimals?: number) {
    if (this.decimalPos === 0) return this;

    return this.round(decimals, RoundingMode.TO_ZERO);
  }

  private isTieStr(lastDigitsStr: string) {
    if (lastDigitsStr[0] !== '5') return false;
    for (let i = 1; i < lastDigitsStr.length; i++) {
      if (lastDigitsStr[i] !== '0') {
        return false;
      }
    }
    return true;
  }

  private _round(decimals?: number, roundingMode?: RoundingMode) {
    const shift = this.decimalPos - decimals;
    if (shift <= 0) {
      return this;
    }

    const exp = 10n ** BigInt(shift);
    const outDigits = this.number / exp;

    if (roundingMode === RoundingMode.TO_ZERO) {
      return new FixedNumber(outDigits, decimals);
    }

    const extraDigits = this.number % exp;
    if (extraDigits === 0n) {
      return new FixedNumber(outDigits, decimals);
    }

    if (roundingMode === RoundingMode.AWAY_FROM_ZERO) {
      const res = this.number < 0n ? outDigits - 1n : outDigits + 1n;
      return new FixedNumber(res, decimals);
    }

    if (roundingMode === RoundingMode.TO_POSITIVE) {
      const res = this.number < 0n ? outDigits : outDigits + 1n;
      return new FixedNumber(res, decimals);
    }

    if (roundingMode === RoundingMode.TO_NEGATIVE) {
      const res = this.number >= 0n ? outDigits : outDigits - 1n;
      return new FixedNumber(res, decimals);
    }

    if (
      ![
        undefined,
        RoundingMode.NEAREST_TO_ZERO,
        RoundingMode.NEAREST_AWAY_FROM_ZERO,
        RoundingMode.NEAREST_TO_POSITIVE,
        RoundingMode.NEAREST_TO_NEGATIVE,
        RoundingMode.NEAREST_TO_EVEN,
      ].includes(roundingMode)
    ) {
      throw new Error('Invalid rounding mode. Use the predefined values from the RoundingMode enum.');
    }

    let extraDigitsStr = (extraDigits < 0n ? -extraDigits : extraDigits).toString();
    // '00123' extra part will appear in extraDigitsStr as '123'
    // -> in this case we can exclude the tie case by setting the extra part to zero
    if (extraDigitsStr.length < shift) {
      extraDigitsStr = '0';
    }

    if (this.isTieStr(extraDigitsStr)) {
      if (roundingMode === RoundingMode.NEAREST_TO_ZERO) {
        return new FixedNumber(outDigits, decimals);
      }

      if (roundingMode === RoundingMode.NEAREST_AWAY_FROM_ZERO) {
        const res = this.number < 0n ? outDigits - 1n : outDigits + 1n;
        return new FixedNumber(res, decimals);
      }

      if (roundingMode === undefined || roundingMode === RoundingMode.NEAREST_TO_POSITIVE) {
        const res = this.number < 0n ? outDigits : outDigits + 1n;
        return new FixedNumber(res, decimals);
      }

      if (roundingMode === RoundingMode.NEAREST_TO_NEGATIVE) {
        const res = this.number >= 0n ? outDigits : outDigits - 1n;
        return new FixedNumber(res, decimals);
      }

      if (roundingMode === RoundingMode.NEAREST_TO_EVEN) {
        if (outDigits % 2n === 0n) {
          return new FixedNumber(outDigits, decimals);
        }

        const res = outDigits < 0n ? outDigits - 1n : outDigits + 1n;
        return new FixedNumber(res, decimals);
      }
    }

    if (Number(extraDigitsStr[0]) < 5) {
      return new FixedNumber(outDigits, decimals);
    }

    const res = this.number < 0 ? outDigits - 1n : outDigits + 1n;
    return new FixedNumber(res, decimals);
  }

  round(decimals?: number, roundingMode?: RoundingMode) {
    decimals = decimals === undefined ? 0 : decimals;
    if (!Number.isSafeInteger(decimals) || decimals < 0) {
      throw new Error('Invalid value for decimals');
    }

    return this._round(decimals, roundingMode).normalize();
  }

  _incExponent(amount: number): FixedNumber {
    if (amount === 0) return this;
    let newNumber = this.number;
    let newDecimalPos = this.decimalPos;

    if (amount < 0) {
      newDecimalPos -= amount;
    } else {
      // amount >= 0
      const maxChange = Math.min(amount, this.decimalPos);
      newDecimalPos -= maxChange;
      const rem = amount - maxChange;
      if (rem > 0) {
        newNumber *= 10n ** BigInt(rem);
      }
    }

    return new FixedNumber(newNumber, newDecimalPos);
  }

  private countDigits() {
    if (this.number === 0n) return 1;
    let digits = 0;
    let x = this.number < 0 ? -this.number : this.number;
    while (x > 0n) {
      x /= 10n;
      digits++;
    }
    return digits;
  }

  // move the number to the +-[0.1, 1) interval
  private toSubZeroNum() {
    const digits = this.countDigits();
    const subZeroNum = new FixedNumber(this.number, digits);
    const exponentDiff = digits - this.decimalPos;
    return { subZeroNum, exponentDiff };
  }

  roundToDigits(digits: number, roundingMode: RoundingMode): FixedNumber {
    if (!Number.isSafeInteger(digits) || digits < 1) {
      throw new Error('Invalid value for digits');
    }

    const { subZeroNum, exponentDiff } = this.toSubZeroNum();
    let roundedNumber = subZeroNum.round(digits, roundingMode);
    roundedNumber = roundedNumber._incExponent(exponentDiff);

    return roundedNumber;
  }

  intPart(): ExactNumberType {
    return this.trunc();
  }

  fracPart(): ExactNumberType {
    return this.sub(this.trunc());
  }

  sign(): -1 | 1 {
    return this.number < 0n ? -1 : 1;
  }

  bitwiseAnd(x: number | bigint | string | ExactNumberType): ExactNumberType {
    x = ExactNumber(x);

    if (!this.isInteger() || this.sign() === -1 || !x.isInteger() || x.sign() === -1) {
      throw new Error('Only positive integers are supported');
    }

    if (x instanceof Fraction) {
      x = x.trunc();
    }

    const pow = 2n ** 24n;
    let an = this.normalize().number;
    let bn = (x.trunc().normalize() as FixedNumber).number;
    let res = 0n;
    let shift = 1n;

    while (an > 0 && bn > 0) {
      const modA = BigInt.asUintN(24, an);
      const modB = BigInt.asUintN(24, bn);
      res += BigInt(Number(modA) & Number(modB)) * shift;
      shift *= pow;
      an /= pow;
      bn /= pow;
    }

    return new FixedNumber(res);
  }

  bitwiseOr(x: number | bigint | string | ExactNumberType): ExactNumberType {
    x = ExactNumber(x);

    if (!this.isInteger() || this.sign() === -1 || !x.isInteger() || x.sign() === -1) {
      throw new Error('Only positive integers are supported');
    }

    if (x instanceof Fraction) {
      x = x.trunc();
    }

    const pow = 2n ** 24n;
    let an = this.normalize().number;
    let bn = (x.trunc().normalize() as FixedNumber).number;
    let res = 0n;
    let shift = 1n;

    while (an > 0 || bn > 0) {
      const modA = BigInt.asUintN(24, an);
      const modB = BigInt.asUintN(24, bn);
      res += BigInt(Number(modA) | Number(modB)) * shift;
      shift *= pow;
      an /= pow;
      bn /= pow;
    }

    return new FixedNumber(res);
  }

  bitwiseXor(x: number | bigint | string | ExactNumberType): ExactNumberType {
    x = ExactNumber(x);

    if (!this.isInteger() || this.sign() === -1 || !x.isInteger() || x.sign() === -1) {
      throw new Error('Only positive integers are supported');
    }

    if (x instanceof Fraction) {
      x = x.trunc();
    }

    const pow = 2n ** 24n;
    let an = this.normalize().number;
    let bn = (x.trunc().normalize() as FixedNumber).number;
    let res = 0n;
    let shift = 1n;

    while (an > 0 || bn > 0) {
      const modA = BigInt.asUintN(24, an);
      const modB = BigInt.asUintN(24, bn);
      res += BigInt(Number(modA) ^ Number(modB)) * shift;
      shift *= pow;
      an /= pow;
      bn /= pow;
    }

    return new FixedNumber(res);
  }

  shiftLeft(bitCount: number): ExactNumberType {
    if (!this.isInteger() || this.sign() === -1) {
      throw new Error('Only positive integers are supported');
    }

    if (!Number.isSafeInteger(bitCount) || bitCount < 0) {
      throw new Error('Invalid value for bitCount');
    }

    const pow = 2n ** BigInt(bitCount);
    return this.mul(pow);
  }

  shiftRight(bitCount: number): ExactNumberType {
    if (!this.isInteger() || this.sign() === -1) {
      throw new Error('Only positive integers are supported');
    }

    if (!Number.isSafeInteger(bitCount) || bitCount < 0) {
      throw new Error('Invalid value for bitCount');
    }

    const pow = 2n ** BigInt(bitCount);
    return new FixedNumber(this.normalize().number / pow);
  }

  cmp(x: number | bigint | string | ExactNumberType): -1 | 0 | 1 {
    const operand = parseParameter(x);
    if (operand instanceof Fraction) {
      return -operand.cmp(this) as -1 | 0 | 1;
    }

    const fixedOperand = operand as FixedNumber;
    const { a, b } = this.scaleNumber(fixedOperand.number, fixedOperand.decimalPos);
    if (a === b) return 0;
    return a > b ? 1 : -1;
  }

  eq(x: number | bigint | string | ExactNumberType): boolean {
    return this.cmp(x) === 0;
  }

  lt(x: number | bigint | string | ExactNumberType): boolean {
    return this.cmp(x) === -1;
  }

  lte(x: number | bigint | string | ExactNumberType): boolean {
    return this.cmp(x) <= 0;
  }

  gt(x: number | bigint | string | ExactNumberType): boolean {
    return this.cmp(x) === 1;
  }

  gte(x: number | bigint | string | ExactNumberType): boolean {
    return this.cmp(x) >= 0;
  }

  clamp(
    min: number | bigint | string | ExactNumberType,
    max: number | bigint | string | ExactNumberType,
  ): ExactNumberType {
    const minNum = ExactNumber(min);
    const maxNum = ExactNumber(max);

    if (minNum.gt(maxNum)) throw new Error('Min parameter has to be smaller than max');
    if (this.lt(minNum)) return minNum;
    if (this.gt(maxNum)) return maxNum;
    return this;
  }

  isZero() {
    return this.number === 0n;
  }

  isOne() {
    if (this.decimalPos === 0) {
      return this.number === 1n;
    }

    const exp = 10n ** BigInt(this.decimalPos);
    const q = this.number / exp;
    return q === 1n && q * exp === this.number;
  }

  isInteger() {
    if (this.decimalPos === 0) return true;
    return this.number % 10n ** BigInt(this.decimalPos) === 0n;
  }

  serialize(): [bigint, number] {
    return [this.number, this.decimalPos];
  }

  getFractionParts(normalize = true) {
    return this.convertToFraction().getFractionParts(normalize);
  }

  normalize() {
    if (this.decimalPos === 0) return this;
    let pos = this.decimalPos;
    let n = this.number;
    while (pos > 0 && n % 10n === 0n) {
      pos--;
      n /= 10n;
    }
    return new FixedNumber(n, pos);
  }

  convertToFraction() {
    if (this.decimalPos === 0) {
      return new Fraction(this.number, 1n);
    }
    const denominator = 10n ** BigInt(this.decimalPos);
    return new Fraction(this.number, denominator);
  }

  toNumber(): number {
    return Number(this.toPrecision(20));
  }

  toFixed(decimals: number, roundingMode = RoundingMode.TO_ZERO): string {
    if (!Number.isSafeInteger(decimals) || decimals < 0) throw new Error('Invalid parameter');

    const rounded = this._round(decimals, roundingMode);

    return bigIntToStr(rounded.number, rounded.decimalPos, decimals, false);
  }

  toExponential(digits: number, roundingMode = RoundingMode.TO_ZERO): string {
    if (!Number.isSafeInteger(digits) || digits < 0) throw new Error('Invalid parameter');

    const rounded = this.roundToDigits(digits + 1, roundingMode).normalize();

    const isNegative = rounded.sign() === -1;
    const absNumber = rounded.abs();
    const str = absNumber.number.toString();

    const slicedString =
      str.length <= digits ? `${str}${'0'.repeat(digits - str.length + 1)}` : str.slice(0, digits + 1);

    const strWithPoint =
      slicedString.length > 1 ? `${slicedString.slice(0, 1)}.${slicedString.slice(1)}` : slicedString;

    const fractionalDigitsBefore = absNumber.decimalPos;
    const fractionalDigitsAfter = str.length - 1;
    const exponent = fractionalDigitsAfter - fractionalDigitsBefore;
    const res = `${isNegative ? '-' : ''}${strWithPoint}e${exponent >= 0 ? '+' : ''}${exponent}`;
    return res;
  }

  private toBase(radix: number, maxDigits?: number): string {
    if (!Number.isSafeInteger(radix) || radix < 2 || radix > 16) throw new Error('Invalid radix');

    if (maxDigits !== undefined && (!Number.isSafeInteger(maxDigits) || maxDigits < 0)) {
      throw new Error('Invalid parameter');
    }

    const num = this.normalize();
    if (num.decimalPos === 0) return num.number.toString(radix);

    const loopEnd = maxDigits === undefined ? Number.MAX_SAFE_INTEGER : maxDigits;

    let intPart = num.intPart() as FixedNumber;
    let fracPart = num.sub(intPart);

    const isNegative = num.sign() === -1;
    if (isNegative) {
      intPart = intPart.neg() as FixedNumber;
      fracPart = fracPart.neg();
    }

    const match = new Map<string, number>();

    let digits = [] as string[];
    while (!fracPart.isZero()) {
      const mul = fracPart.mul(radix);
      const mulStr = mul.toString();

      const cycleStart = match.get(mulStr);
      if (cycleStart !== undefined) {
        digits = [...digits.slice(0, cycleStart - 1), '(', ...digits.slice(cycleStart - 1), ')'];
        break;
      }

      if (digits.length === loopEnd) {
        break;
      }

      const q = Math.abs(mul.intPart().toNumber());
      digits.push(q.toString(radix));
      fracPart = mul.fracPart();

      match.set(mulStr, digits.length);
    }

    return [isNegative ? '-' : '', intPart.number.toString(radix), digits.length ? '.' : '', ...digits].join('');
  }

  toFraction(): string {
    return this.convertToFraction().toFraction();
  }

  toString(radix?: number, maxDigits?: number): string {
    if (radix === undefined || radix === 10) {
      const num = maxDigits !== undefined ? this.trunc(maxDigits) : this;
      return bigIntToStr(num.number, num.decimalPos, num.decimalPos, true);
    }

    return this.toBase(radix, maxDigits);
  }

  toPrecision(digits: number, roundingMode = RoundingMode.TO_ZERO): string {
    if (!Number.isSafeInteger(digits) || digits < 1) throw new Error('Invalid parameter');

    const rounded = this.roundToDigits(digits, roundingMode);
    const { subZeroNum, exponentDiff } = rounded.toSubZeroNum();

    const isNegative = subZeroNum.sign() === -1;
    let subZeroStr = bigIntToStr(subZeroNum.number, subZeroNum.decimalPos, subZeroNum.decimalPos, false);
    subZeroStr = subZeroStr.slice(isNegative ? 3 : 2); // '-0.' or '0.'

    // cut extra digits
    subZeroStr = subZeroStr.slice(0, Math.max(digits, exponentDiff));

    const whole = subZeroStr.slice(0, Math.max(0, exponentDiff));
    const frac = subZeroStr.slice(Math.max(0, exponentDiff));

    const suffixLength = Math.max(0, digits - whole.length - frac.length);
    const suffix = '0'.repeat(suffixLength);
    const prefix = '0'.repeat(exponentDiff < 0 ? -exponentDiff : 0);

    let res = whole || '0';
    if (frac.length + prefix.length + suffixLength > 0) {
      res += `.${prefix}${frac}${suffix}`;
    }

    return isNegative ? `-${res}` : res;
  }

  valueOf(): number {
    throw new Error('Unsafe conversion to Number type! Use toNumber() instead.');
  }
}
