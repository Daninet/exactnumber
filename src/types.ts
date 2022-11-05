import { Fraction } from './Fraction';
import { FixedNumber } from './FixedNumber';

// a random, hard to guess number
const ROUNDING_MODE_BASE = 201000;

export enum RoundingMode {
  /** Rounds to nearest number, with ties rounded towards +Infinity. Similar to Math.round(). */
  NEAREST_TO_POSITIVE = ROUNDING_MODE_BASE + 8,
  /** Rounds to nearest number, with ties rounded towards -Infinity. */
  NEAREST_TO_NEGATIVE = ROUNDING_MODE_BASE + 9,
  /** Rounds to nearest number, with ties rounded towards the nearest even number. */
  NEAREST_TO_EVEN = ROUNDING_MODE_BASE + 10,
  /** Rounds to nearest number, with ties rounded towards zero. */
  NEAREST_TO_ZERO = ROUNDING_MODE_BASE + 11,
  /** Rounds to nearest number, with ties rounded away from zero. */
  NEAREST_AWAY_FROM_ZERO = ROUNDING_MODE_BASE + 12,

  /** Rounds towards +Infinity. Similar to Math.ceil(). */
  TO_POSITIVE = ROUNDING_MODE_BASE + 1,
  /** Rounds towards -Infinity. Similar to Math.floor(). */
  TO_NEGATIVE = ROUNDING_MODE_BASE + 2,
  /** Rounds towards zero. Similar to Math.trunc(). */
  TO_ZERO = ROUNDING_MODE_BASE + 3,
  /** Rounds away from zero */
  AWAY_FROM_ZERO = ROUNDING_MODE_BASE + 4,
}

export enum ModType {
  TRUNCATED = 'T',
  FLOORED = 'F',
  EUCLIDEAN = 'E',
}

export interface ExactNumberType {
  type: 'fraction' | 'fixed';

  /** Returns the sum of this number and the given one. */
  add(x: number | bigint | string | ExactNumberType): ExactNumberType;

  /** Returns the difference of this number and the given one. */
  sub(x: number | bigint | string | ExactNumberType): ExactNumberType;

  /** Returns the product of this number and the given one. */
  mul(x: number | bigint | string | ExactNumberType): ExactNumberType;

  /** Returns this number exponentiated to the given value. */
  pow(x: number | bigint | string | ExactNumberType): ExactNumberType;

  /** Returns modulo of this number exponentiated to the given value (modular exponentiation) */
  powm(
    exponent: number | bigint | string | ExactNumberType,
    modulus: number | bigint | string | ExactNumberType,
    type?: ModType,
  ): ExactNumberType;

  /** Returns the result of the division of this number by the given one. */
  div(x: number | bigint | string | ExactNumberType): ExactNumberType;

  /** Returns the result of the integer division of this number by the given one. The fractional part is truncated. */
  divToInt(x: number | bigint | string | ExactNumberType): ExactNumberType;

  mod(x: number | bigint | string | ExactNumberType, type?: ModType): ExactNumberType;

  /** Returns the absolute value of this number. */
  abs(): ExactNumberType;

  /** Returns the sign of the current value as a number (-1 or 1) */
  sign(): -1 | 1;

  /** Returns the number with inverted sign. (-x) */
  neg(): ExactNumberType;

  /** Returns the inverse of the number. (1/x) */
  inv(): ExactNumberType;

  /** Returns the integer part of the number. */
  intPart(): ExactNumberType;

  /** Returns the fractional part of the number (|res| < 1). */
  fracPart(): ExactNumberType;

  /** Returns true if the number is equal with zero. */
  isZero(): boolean;

  /** Returns true if the number is equal with one. */
  isOne(): boolean;

  /** Returns true if the number does not have a fractional part. */
  isInteger(): boolean;

  /** Returns the largest number, but less than or equal to the current number. Same as round(RoundingMode.TO_NEGATIVE). */
  floor(decimals?: number): ExactNumberType;

  /** Returns a number which is rounded up to the next largest integer. Same as round(RoundingMode.TO_POSITIVE). */
  ceil(decimals?: number): ExactNumberType;

  /** Truncates the number to the specified number of decimals. Same as round(RoundingMode.TO_ZERO). */
  trunc(decimals?: number): ExactNumberType;

  /** Rounds current number to the specified amount of decimals.
   * RoundingMode.NEAREST_TO_POSITIVE is the default
   */
  round(decimals?: number, roundingMode?: RoundingMode): ExactNumberType;

  /** Rounds current number to the specified amount of significant digits.
   * RoundingMode.NEAREST_TO_POSITIVE is the default
   */
  roundToDigits(digits: number, roundingMode: RoundingMode): ExactNumberType;

  /** Returns the integer bitwise-and combined with another integer. */
  bitwiseAnd(x: number | bigint | string | ExactNumberType): ExactNumberType;

  /** Returns the integer bitwise-or combined with another integer. */
  bitwiseOr(x: number | bigint | string | ExactNumberType): ExactNumberType;

  /** Returns the integer bitwise-xor combined with another integer. */
  bitwiseXor(x: number | bigint | string | ExactNumberType): ExactNumberType;

  /** Returns the integer left shifted by a given number of bits. */
  shiftLeft(bitCount: number): ExactNumberType;

  /** Returns the integer right shifted by a given number of bits. */
  shiftRight(bitCount: number): ExactNumberType;

  /** Compares the current number to the provided number.
   * Returns -1 when the provided number is smaller than the current one.
   * Returns 0 when the provided number is equal with the current one.
   * Returns 1 when the provided number is greater than the current one.
   */
  cmp(x: number | bigint | string | ExactNumberType): -1 | 0 | 1;

  /** Returns true if the current number is equal to the provided number */
  eq(x: number | bigint | string | ExactNumberType): boolean;

  /** Returns true if the current number is less than the provided number */
  lt(x: number | bigint | string | ExactNumberType): boolean;

  /** Returns true if the current number is less than or equal to the provided number */
  lte(x: number | bigint | string | ExactNumberType): boolean;

  /** Returns true if the current number is greater than the provided number */
  gt(x: number | bigint | string | ExactNumberType): boolean;

  /** Returns true if the current number is greater than or equal to the provided number */
  gte(x: number | bigint | string | ExactNumberType): boolean;

  /** Returns number which is clamped to the range delineated by min and max. */
  clamp(
    min: number | bigint | string | ExactNumberType,
    max: number | bigint | string | ExactNumberType,
  ): ExactNumberType;

  /** Returns the numerator and the denominator of the current number.
   * By default it simplifies the fraction */
  getFractionParts(normalize?: boolean): { numerator: ExactNumberType; denominator: ExactNumberType };

  /** Returns opimized internal representation of the current number (e.g. it simplifies fractions using GCD)
   * This is may be a slow operation, but in some cases normalization might help with performance of repeated operations. */
  normalize(): ExactNumberType;

  /** Returns a string representing the number using fixed-point notation, rounded to the specified number of decimals.
   * Defaults to RoundingMode.TO_ZERO
   */
  toFixed(decimals: number, roundingMode?: RoundingMode): string;

  /** Returns a string representing the number in exponential notation.
   * Defaults to RoundingMode.TO_ZERO
   */
  toExponential(digits: number, roundingMode?: RoundingMode): string;

  /** Returns a string representing the number using fixed-point notation, rounded to the specified number of significant digits.
   * In contrary to JS Number.toPrecision(), this function never returns exponential notation.
   * Defaults to RoundingMode.TO_ZERO
   */
  toPrecision(digits: number, roundingMode?: RoundingMode): string;

  /** Converts current value to a JavaScript Number */
  toNumber(): number;

  /** Returns string representation of the current number in a fractional format like "1/2". It always simplifies the fraction before output. */
  toFraction(): string;

  /** Returns string representation in decimal format.
   * The result might contain repeating digit sequences formatted like "1.4(3)"
   * It is recommended to set a maximum length for the fractional part to avoid performance issues when having long cycles.
   * When such limit is provided, toString() truncates the undesired digits */
  toString(radix?: number, maxDigits?: number): string;
}

export type CommonNumberFields = FixedNumber | Fraction;

export type ExactNumberParameter = number | bigint | string | ExactNumberType;
