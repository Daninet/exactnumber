import { CommonNumberFields, ExactNumberType, ModType, RoundingMode } from './types';
import { FixedNumber } from './FixedNumber';
import { trimTrailingZerosFromFixed, _0N, _10N, _1N, _2N, _5N } from './util';
import { ExactNumber } from './ExactNumber';

export class Fraction implements ExactNumberType {
  public readonly type = 'fraction';

  private readonly numerator: bigint;
  private readonly denominator: bigint;

  private parseRepeatingDecimal(x: string): Fraction {
    if (!x.includes('(')) {
      return new FixedNumber(x).convertToFraction();
    }

    x = x.trim();
    const m = x.match(/^(-?[0-9]*)\.([0-9]+)?\(([0-9]+)\)(?:[eE]([+-]?[0-9]+))?$/);
    if (!m) {
      throw new Error(`Cannot parse string "${x}"`);
    }

    const wholePart = m[1] === '-' ? '-0' : m[1];
    const beforeCycle = m[2] ?? '';
    const cycle = m[3];
    const exponent = m[4];

    const numerator = BigInt(wholePart + beforeCycle + cycle) - BigInt(wholePart + beforeCycle);
    const denominator = BigInt('9'.repeat(cycle.length) + '0'.repeat(beforeCycle.length));

    const fraction = new Fraction(numerator, denominator);

    if (exponent !== undefined) {
      const isNegativeExp = exponent.startsWith('-');
      const exp = _10N ** BigInt(isNegativeExp ? exponent.slice(1) : exponent);
      if (isNegativeExp) {
        return fraction.div(exp).normalize() as Fraction;
      }
      return fraction.mul(exp).normalize() as Fraction;
    }

    return fraction.simplify();
  }

  private parseParameter(x: number | bigint | string | ExactNumberType): Fraction {
    if (x instanceof Fraction) {
      return x;
    }

    if (x instanceof FixedNumber) {
      return x.convertToFraction();
    }

    if (typeof x === 'number') {
      if (!Number.isSafeInteger(x)) {
        throw new Error('Floating point values as numbers are unsafe. Please provide them as a string.');
      }
      return new Fraction(BigInt(x), _1N);
    }

    if (typeof x === 'bigint') {
      return new Fraction(x, _1N);
    }

    if (typeof x === 'string') {
      const parts = x.split('/');
      if (parts.length > 2) throw new Error(`Cannot parse string '${x}'`);
      const numerator = this.parseRepeatingDecimal(parts[0]);
      const denominator = parts[1] ? this.parseRepeatingDecimal(parts[1]) : new Fraction(_1N, _1N);
      const res = numerator.div(denominator) as CommonNumberFields;
      const fraction = res.convertToFraction();
      return fraction;
    }

    throw new Error('Unsupported parameter!');
  }

  constructor(x: number | bigint | string | ExactNumberType, y: number | bigint | string | ExactNumberType) {
    // fast path
    if (typeof x === 'bigint' && typeof y === 'bigint') {
      this.numerator = x;
      this.denominator = y;
    } else {
      const xFraction = this.parseParameter(x);
      const yFraction = this.parseParameter(y);
      const res = xFraction.div(yFraction);
      const frac = res instanceof FixedNumber ? res.convertToFraction() : (res as Fraction);

      this.numerator = frac.numerator;
      this.denominator = frac.denominator;
    }
    if (this.denominator === _0N) {
      throw new Error('Division by zero');
    }
  }

  add(x: number | bigint | string | ExactNumberType): ExactNumberType {
    const { numerator, denominator } = this.parseParameter(x);

    if (this.denominator === denominator) {
      return new Fraction(this.numerator + numerator, this.denominator);
    }

    // if (false) {
    //   const commonDenominator = this.lcm(this.denominator, denominator);
    //   const lMultiplier = commonDenominator / this.denominator;
    //   const rMultiplier = commonDenominator / denominator;

    //   return new Fraction(this.numerator * lMultiplier + numerator * rMultiplier, commonDenominator);
    // }

    return new Fraction(this.numerator * denominator + numerator * this.denominator, denominator * this.denominator);
  }

  sub(x: number | bigint | string | ExactNumberType): ExactNumberType {
    const { numerator, denominator } = this.parseParameter(x);
    return this.add(new Fraction(-numerator, denominator));
  }

  mul(x: number | bigint | string | ExactNumberType): ExactNumberType {
    const { numerator, denominator } = this.parseParameter(x);

    const res = new Fraction(this.numerator * numerator, this.denominator * denominator);
    return res;
  }

  div(x: number | bigint | string | ExactNumberType): ExactNumberType {
    const { numerator, denominator } = this.parseParameter(x);
    return this.mul(new Fraction(denominator, numerator));
  }

  divToInt(x: number | bigint | string | ExactNumberType): ExactNumberType {
    const num = this.div(x);
    return num.trunc();
  }

  mod(r: number | bigint | string | ExactNumberType, type = ModType.TRUNCATED): ExactNumberType {
    // n1 / d1 = n2 / d2 * q + r
    // d2 * n1 = n2 * d1 * q + d1 * d2 * r
    // (d2 * n1 % n2 * d1) / (d1 * d2)

    const rFrac = this.parseParameter(r);

    const a = (rFrac.denominator * this.numerator) % (rFrac.numerator * this.denominator);
    const b = this.denominator * rFrac.denominator;
    const res = new Fraction(a, b);

    if (type === ModType.TRUNCATED) {
      return res;
    }

    if (type === ModType.FLOORED) {
      return Number(this.isNegative()) ^ Number(rFrac.isNegative()) ? res.add(rFrac) : res;
    }

    if (type === ModType.EUCLIDEAN) {
      return res.isNegative() ? res.add(rFrac.isNegative() ? rFrac.neg() : rFrac) : res;
    }

    throw new Error('Invalid ModType');
  }

  pow(x: number | bigint | string | ExactNumberType): ExactNumberType {
    const param = this.parseParameter(x);
    if (!param.isInteger()) {
      throw new Error('Unsupported parameter');
    }

    const exp = param.numerator / param.denominator;
    const absExp = exp < _0N ? -exp : exp;

    const res = new Fraction(this.numerator ** absExp, this.denominator ** absExp);
    return exp < _0N ? res.inv() : res;
  }

  powm(
    _exp: number | bigint | string | ExactNumberType,
    _mod: number | bigint | string | ExactNumberType,
    modType?: ModType,
  ): ExactNumberType {
    const exp = this.parseParameter(_exp);
    if (!exp.isInteger()) {
      throw new Error('Unsupported parameter');
    }

    let expInt = exp.toNumber();

    const mod = this.parseParameter(_mod);
    let base = this as Fraction;

    let res = new Fraction(_1N, _1N);
    while (expInt !== 0) {
      if (expInt % 2 !== 0) {
        res = res.mul(base).mod(mod, modType) as Fraction;
      }
      base = base.pow(_2N).mod(mod, modType) as Fraction;
      expInt = Math.floor(expInt / 2);
    }

    return res;
  }

  inv(): ExactNumberType {
    const res = new Fraction(this.denominator, this.numerator);
    return res;
  }

  floor(decimals?: number) {
    if (this.denominator === _1N) return new FixedNumber(this.numerator);

    return this.round(decimals, RoundingMode.TO_NEGATIVE);
  }

  ceil(decimals?: number) {
    if (this.denominator === _1N) return new FixedNumber(this.numerator);

    return this.round(decimals, RoundingMode.TO_POSITIVE);
  }

  trunc(decimals?: number) {
    if (this.denominator === _1N) return new FixedNumber(this.numerator);

    return this.round(decimals, RoundingMode.TO_ZERO);
  }

  round(decimals?: number, roundingMode?: RoundingMode): FixedNumber {
    decimals = decimals === undefined ? 0 : decimals;

    if (!Number.isSafeInteger(decimals) || decimals < 0) {
      throw new Error('Invalid value for decimals');
    }

    const fixedPart = this.toFixedNumber(decimals + 1);

    // tie case must be adjusted

    const remainder = this.sub(fixedPart);

    if (remainder.isZero()) {
      // nothing is lost
      return fixedPart.round(decimals, roundingMode);
    }

    // 0.105 might got cutted to 0.1, which might round incorrectly
    // solution: add one digit to the end

    let correctedFixedNum = new FixedNumber(`${fixedPart.toFixed(decimals + 1)}1`);

    // 0 loses negative sign, so it needs to be corrected
    if (fixedPart.isNegative() && !correctedFixedNum.isNegative()) {
      correctedFixedNum = correctedFixedNum.neg();
    }

    const res = correctedFixedNum.round(decimals, roundingMode);
    return res;
  }

  roundToDigits(digits: number, roundingMode: RoundingMode): FixedNumber {
    if (!Number.isSafeInteger(digits) || digits < 1) {
      throw new Error('Invalid value for digits');
    }

    if (this.isZero()) return new FixedNumber(_0N);

    let x = this.abs();

    // move the number to the [0.1, 1) interval
    let divisions = 0;

    while (x.gte(_1N)) {
      x = x.div(_10N);
      divisions++;
    }

    const zeroPointOne = new Fraction(_1N, _10N);
    while (x.lt(zeroPointOne)) {
      x = x.mul(_10N);
      divisions--;
    }

    let roundedNumber = x.round(digits, roundingMode) as FixedNumber;

    roundedNumber = roundedNumber._incExponent(divisions);

    return this.isNegative() ? roundedNumber.neg() : roundedNumber;
  }

  limitDecimals(maxDecimals: number, roundingMode?: RoundingMode): ExactNumberType {
    if (this.denominator === _1N) {
      return new FixedNumber(this.numerator, 0);
    }

    const { cycleLen, cycleStart } = this.getDecimalFormat(maxDecimals);

    if (cycleLen !== null && cycleStart + cycleLen <= maxDecimals) {
      return this;
    }

    const roundedNumber = this.round(maxDecimals, roundingMode);
    return roundedNumber;
  }

  private gcd(numerator: bigint, denominator: bigint): bigint {
    let a = numerator < _0N ? -numerator : numerator;
    let b = denominator < _0N ? -denominator : denominator;

    if (b > a) {
      const temp = a;
      a = b;
      b = temp;
    }

    while (true) {
      if (b === _0N) return a;
      a %= b;
      if (a === _0N) return b;
      b %= a;
    }
  }

  // private lcm(a: bigint, b: bigint): bigint {
  //   return (a * b) / this.gcd(a, b);
  // }

  private simplify() {
    let { numerator, denominator } = this;

    const gcd = this.gcd(numerator, denominator);
    if (gcd > _1N) {
      numerator /= gcd;
      denominator /= gcd;
    }

    if (denominator < _0N) {
      numerator = -numerator;
      denominator = -denominator;
    }

    return new Fraction(numerator, denominator);
  }

  normalize(): FixedNumber | Fraction {
    const { numerator, denominator } = this.simplify();

    if (denominator === _1N) {
      return new FixedNumber(numerator, 0);
    }

    const frac = new Fraction(numerator, denominator);

    // check if conversion to FixedNumber is possible
    const { cycleLen, cycleStart } = frac.getDecimalFormat(0);

    if (cycleLen !== 0) {
      return frac;
    }

    return frac.round(cycleStart, RoundingMode.TO_ZERO);
  }

  getFractionParts(normalize = true) {
    const num = normalize ? this.simplify() : this;
    return {
      numerator: new FixedNumber(num.numerator),
      denominator: new FixedNumber(num.denominator),
    };
  }

  sign(): -1 | 1 {
    const numeratorSign = this.numerator < _0N ? -1 : 1;
    const denominatorSign = this.denominator < _0N ? -1 : 1;
    return (numeratorSign * denominatorSign) as -1 | 1;
  }

  abs(): ExactNumberType {
    const res = new Fraction(
      this.numerator < _0N ? -this.numerator : this.numerator,
      this.denominator < _0N ? -this.denominator : this.denominator,
    );
    return res;
  }

  neg() {
    return this.mul(-_1N);
  }

  intPart() {
    return this.trunc();
  }

  fracPart() {
    return this.sub(this.trunc());
  }

  cmp(x: number | bigint | string | ExactNumberType): -1 | 0 | 1 {
    const rVal = this.parseParameter(x);

    const hasCommonDenominator = this.denominator === rVal.denominator;
    const a = hasCommonDenominator ? this.numerator : this.numerator * rVal.denominator;
    const b = hasCommonDenominator ? rVal.numerator : rVal.numerator * this.denominator;

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
    return this.numerator === _0N;
  }

  isOne() {
    return this.numerator === this.denominator;
  }

  isInteger() {
    return this.numerator % this.denominator === _0N;
  }

  isNegative() {
    return this.sign() === -1;
  }

  serialize(): [bigint, bigint] {
    return [this.numerator, this.denominator];
  }

  toNumber(): number {
    return Number(this.toPrecision(20));
  }

  convertToFraction() {
    return this;
  }

  private getNumberForBitwiseOp() {
    if (!this.isInteger() || this.isNegative()) {
      throw new Error('Only positive integers are supported');
    }
    return this.intPart();
  }

  bitwiseAnd(x: number | bigint | string | ExactNumberType): ExactNumberType {
    return this.getNumberForBitwiseOp().bitwiseAnd(x);
  }

  bitwiseOr(x: number | bigint | string | ExactNumberType): ExactNumberType {
    return this.getNumberForBitwiseOp().bitwiseOr(x);
  }

  bitwiseXor(x: number | bigint | string | ExactNumberType): ExactNumberType {
    return this.getNumberForBitwiseOp().bitwiseXor(x);
  }

  shiftLeft(bitCount: number): ExactNumberType {
    return this.getNumberForBitwiseOp().shiftLeft(bitCount);
  }

  shiftRight(bitCount: number): ExactNumberType {
    return this.getNumberForBitwiseOp().shiftRight(bitCount);
  }

  private getDecimalFormat(maxDigits?: number): { cycleLen: number | null; cycleStart: number } {
    maxDigits = maxDigits ?? Number.MAX_SAFE_INTEGER;

    let d = this.denominator < _0N ? -this.denominator : this.denominator;

    let twoExp = 0;
    while (d % _2N === _0N) {
      d /= _2N;
      twoExp++;
    }

    let fiveExp = 0;
    while (d % _5N === _0N) {
      d /= _5N;
      fiveExp++;
    }

    const cycleStart = Math.max(twoExp, fiveExp);

    if (d === _1N) {
      return { cycleLen: 0, cycleStart };
    }

    const end = Math.max(1, maxDigits - cycleStart);

    let rem = _10N % d;
    let cycleLen = 1;

    // 10^l ≡ 1 (mod d)
    while (rem !== _1N) {
      if (cycleLen === end) {
        // abort calculation
        return { cycleLen: null, cycleStart };
      }
      rem = (rem * _10N) % d;
      cycleLen++;
    }

    return { cycleLen, cycleStart };
  }

  toFixed(decimals: number, roundingMode = RoundingMode.TO_ZERO, trimZeros = false): string {
    if (!Number.isSafeInteger(decimals) || decimals < 0) throw new Error('Invalid parameter');

    return this.round(decimals, roundingMode).toFixed(decimals, RoundingMode.TO_ZERO, trimZeros);
  }

  private toRepeatingParts(maxDigits: number | undefined): [string, string, string] {
    if (this.isZero()) {
      return ['0', '', ''];
    }

    const { cycleLen, cycleStart } = this.simplify().getDecimalFormat(maxDigits);

    // if aborted calculation or terminating decimal
    if (cycleLen === null || cycleLen === 0) {
      const outputDigits = maxDigits ?? cycleStart;
      const str = this.toFixed(outputDigits);
      const parts = trimTrailingZerosFromFixed(str).split('.');
      return [parts[0], parts[1] ?? '', ''];
    }

    const digits = cycleStart + cycleLen;
    const str = this.toFixed(digits);

    const parts = str.split('.');
    return [parts[0], parts[1].slice(0, cycleStart), parts[1].slice(cycleStart)];
  }

  toRepeatingDigits(maxDigits: number | undefined): string {
    const parts = this.toRepeatingParts(maxDigits);

    let res = parts[0];
    if (parts[1] || parts[2]) {
      res += `.${parts[1]}`;
    }

    if (parts[2]) {
      res += `(${parts[2]})`;
    }

    return res;
  }

  toExponential(digits: number, roundingMode = RoundingMode.TO_ZERO, trimZeros = false): string {
    if (!Number.isSafeInteger(digits) || digits < 0) throw new Error('Invalid parameters');

    const fixedNum = this.toFixedNumber(digits);
    return fixedNum.toExponential(digits, roundingMode, trimZeros);
  }

  toFraction(): string {
    const { numerator, denominator } = this.getFractionParts(true);

    return `${numerator.toString()}/${denominator.toString()}`;
  }

  private toFixedNumber(digits: number): FixedNumber {
    if (this.numerator === _0N) return new FixedNumber(0, 0);
    if (this.denominator === _1N) return new FixedNumber(this.numerator, 0);

    let requiredDigits = digits;
    let absNumerator = this.numerator < 0 ? -this.numerator : this.numerator;
    while (absNumerator < this.denominator) {
      absNumerator *= _10N;
      requiredDigits++;
    }

    const factor = _10N ** BigInt(requiredDigits);
    const numerator = this.numerator * factor;
    const div = numerator / this.denominator;
    const fixedNum = new FixedNumber(div, requiredDigits);
    return fixedNum;
  }

  private toBase(radix: number, maxDigits?: number): string {
    if (!Number.isSafeInteger(radix) || radix < 2 || radix > 16) throw new Error('Invalid radix');

    if (maxDigits !== undefined && (!Number.isSafeInteger(maxDigits) || maxDigits < 0)) {
      throw new Error('Invalid parameter');
    }

    if (radix === 10) {
      return maxDigits === undefined
        ? this.toRepeatingDigits(maxDigits)
        : trimTrailingZerosFromFixed(this.toFixed(maxDigits));
    }

    const num = this.normalize();

    const loopEnd = maxDigits === undefined ? Number.MAX_SAFE_INTEGER : maxDigits + 1;

    let intPart = num.intPart();
    let fracPart = num.sub(intPart);

    const isNegative = num.isNegative();
    if (isNegative) {
      intPart = intPart.neg();
      fracPart = fracPart.neg();
    }

    const match = new Map<string, number>();

    let digits = [] as string[];
    while (!fracPart.isZero()) {
      if (digits.length === loopEnd) break;

      const mul = fracPart.mul(radix);
      const mulStr = mul.normalize().toFraction();

      const cycleStart = match.get(mulStr);
      if (cycleStart !== undefined) {
        digits = [...digits.slice(0, cycleStart - 1), '(', ...digits.slice(cycleStart - 1), ')'];
        break;
      }

      const q = Math.abs(mul.intPart().toNumber());
      digits.push(q.toString(radix));
      fracPart = mul.fracPart();

      match.set(mulStr, digits.length);
    }

    if (digits.length === loopEnd) {
      digits.pop();
    }

    const digitsStr = digits.join('');

    const res = `${isNegative ? '-' : ''}${intPart.toString(radix)}${digits.length ? '.' : ''}${digitsStr}`;

    return res;
  }

  toString(radix?: number, maxDigits?: number): string {
    if (radix === undefined || radix === 10) {
      return this.toRepeatingDigits(maxDigits);
    }

    return this.toBase(radix, maxDigits);
  }

  toPrecision(digits: number, roundingMode = RoundingMode.TO_ZERO, trimZeros = false): string {
    if (!Number.isSafeInteger(digits) || digits < 1) throw new Error('Invalid parameter');

    return this.roundToDigits(digits, roundingMode).toPrecision(digits, RoundingMode.TO_ZERO, trimZeros);
  }

  valueOf(): number {
    throw new Error('Unsafe conversion to Number type! Use toNumber() instead.');
  }
}
