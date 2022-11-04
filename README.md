# ExactNumber

[![npm package](https://img.shields.io/npm/v/exactnumber.svg)](http://npmjs.org/package/exactnumber)
[![codecov](https://codecov.io/gh/Daninet/exactnumber/branch/master/graph/badge.svg)](https://codecov.io/gh/Daninet/exactnumber)
[![Build status](https://github.com/Daninet/exactnumber/workflows/Build/badge.svg?branch=master)](https://github.com/Daninet/exactnumber/actions)
[![JSDelivr downloads](https://data.jsdelivr.com/v1/package/npm/exactnumber/badge)](https://www.jsdelivr.com/package/npm/exactnumber)

Arbitrary-precision decimals. Enables making math calculations with rational numbers, without precision loss.

## Features

- Works with arbitrary large numbers without precision loss
- All fractions can be represented as repeating decimals like `1.23(45)`
- This repeating decimal format (`1.23(45)`) can also be parsed back
- Works with all number bases between `2` and `16`
- **No special values** like `NaN`, `Infinity` or `-0`.
- **No silent errors**: it throws errors immediatelly when a confusing parameter is received (e.g. 0/0)
- Supports bitwise operators (`and`, `or`, `xor`, `shiftLeft`, `shiftRight`)
- Includes approximation algorithms for irrational numbers like `PI`, `sin(1)`.
- Supports all modern browsers, web workers, Node.js and Deno
- Includes TypeScript type definitions: [documentation](https://daninet.github.io/exactnumber)
- Zero external dependencies
- Under the hood, it relies on the `BigInt` type. It automatically switches back and forth between fixed-precision and fractional representations.
- Tries to deliver the best possible performance
- 100% open source + MIT license

## Comparision with built-in numbers

```js
import { ExactNumber as N } from 'exactnumber';

1 + 0.36 // 1.3599999999999999
N(1).add('0.36').toString() // 1.36

(1 / 49) * 49 // 0.9999999999999999
N(1).div(49).mul(49).toString() // 1

10e16 + 5 // 100000000000000000
N('10e16').add(5).toString() // 100000000000000005

1 / 3 // 0.3333333333333333
N(1).div(3).toString() // 0.(3)

2**32 >> 32 // 0
N(2).pow(32).shiftRight(32).toString() // 1
```

## Installation

```
npm i exactnumber
```

It can also be used directly from HTML (via [jsDelivr](https://www.jsdelivr.com/package/npm/exactnumber)):

```html
<!-- loads the full, minified library into the global `exactnumber` variable -->
<script src="https://cdn.jsdelivr.net/npm/exactnumber"></script>

<!-- or loads the non-minified library -->
<script src="https://cdn.jsdelivr.net/npm/exactnumber/dist/index.umd.js"></script>
```

## Usage

```js
import { ExactNumber as N } from 'exactnumber';

N(1).add('3').toString(); // 4

N('1/7').add('1/10').toFraction(); // 17/70

N('1/7').toString(); // 0.(142857)
N('1/7').toString(6); // 0.(05)
N('1/7').toFixed(3); // 0.142
N('1/7').trunc(3).toString(); // 0.142
N('0.(3)').add('0.(6)').toString(); // 1

N('0b1100').bitwiseAnd('0b1010').toString(2); // 1000

N.max('1/1', '10/2', 3).toString(); // 5
N.fromBase('123', 4).toString(); // 27

// approximations

import { PI, sin, pow } from 'exactnumber';
PI(10).toString(); // 3.1415926535

const PI_OVER_2 = PI(10).div(2);
sin(PI_OVER_2, 5).toString(); // 1.00000

// 0.1232323 raised to the power of 2.193333, approximated with 10 decimals
pow('0.1(23)', '2.19(3)', 10).toString(); // 0.0101310867
```

## Functions

- Addition / subtraction: `add()`, `sub()`
- Multiplication / division: `mul()`, `div()`, `divToInt()`
- Exponentiation: `pow()`
- Modular arithmetic: `mod()`, `powm()`
- Getting the sign / absolute value: `sign()`, `abs()`
- Negation / inversion: `neg()`, `inv()`
- Integer and fractional parts: `intPart()`, `fracPart()`
- Comparisons: `cmp()`, `eq()`, `lt()`, `lte()`, `gt()`, `gte()`
- Special comparisons: `isZero()`, `isOne()`
- Type testing: `isInteger()`
- Rounding: `round()`, `roundToDigits()`, `floor()`, `ceil()`, `trunc()`
- Bitwise operators: `bitwiseAnd()`, `bitwiseOr()`, `bitwiseXor()`, `shiftLeft()`, `shiftRight()`
- Clamping: `clamp()`
- Fraction helper: `getFractionParts()`
- Normalization / simplifying fractions: `normalize()`
- String output: `toFixed()`, `toExponential()`, `toPrecision()`, `toString()`, `toFraction()`
- Number output: `toNumber()`
- GCD, LCM: `ExactNumber.gcd()`, `ExactNumber.lcm()`
- Minimum, maximum: `ExactNumber.min()`, `ExactNumber.max()`
- Parsing numbers in different bases: `ExactNumber.fromBase()`
- Range generator: `ExactNumber.range()`

## Rounding modes

- `NEAREST_TO_POSITIVE` - Rounds to nearest number, with ties rounded towards +Infinity. Similar to Math.round().
- `NEAREST_TO_NEGATIVE` - Rounds to nearest number, with ties rounded towards -Infinity.
- `NEAREST_TO_EVEN` - Rounds to nearest number, with ties rounded towards the nearest even number.
- `NEAREST_TO_ZERO` - Rounds to nearest number, with ties rounded towards zero.
- `NEAREST_AWAY_FROM_ZERO` - Rounds to nearest number, with ties rounded away from zero.

- `TO_POSITIVE` - Rounds towards +Infinity. Similar to Math.ceil().
- `TO_NEGATIVE` - Rounds towards -Infinity. Similar to Math.floor().
- `TO_ZERO` - Rounds towards zero. Similar to Math.trunc().
- `AWAY_FROM_ZERO` - Rounds away from zero

## Modulo variants

- `TRUNCATED`
- `FLOORED`
- `EUCLIDEAN`

Read more about them [here](https://en.wikipedia.org/wiki/Modulo_operation).

## Approximation algorithms

These functions approximate irrational numbers with arbitrary number of decimals.
The last parameter is always used to specify the number of correct decimals in the result.

- Roots: `sqrt()`, `cbrt()`, `nthroot()`
- Exponentials: `pow()`, `exp()`
- Logarithms: `log()`, `logn()`, `log10()`, `log2()`,
- Constants: `PI()`
- Trigonometric functions: `sin()`, `cos()`, `tan()`
- Inverse trigonometric functions: `asin()`, `acos()`, `atan()`
- Hyperbolic functions: `sinh()`, `cosh()`, `tanh()`
- Inverse hyperbolic functions: `asinh()`, `acosh()`, `atanh()`

## Copyright

License: MIT

Copyright © 2022 Dani Biró
