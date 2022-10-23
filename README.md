# ExactNumber

[![npm package](https://img.shields.io/npm/v/exactnumber.svg)](http://npmjs.org/package/exactnumber)
[![codecov](https://codecov.io/gh/Daninet/exactnumber/branch/master/graph/badge.svg)](https://codecov.io/gh/Daninet/exactnumber)
[![Build status](https://github.com/Daninet/exactnumber/workflows/Build/badge.svg?branch=master)](https://github.com/Daninet/exactnumber/actions)
[![JSDelivr downloads](https://data.jsdelivr.com/v1/package/npm/exactnumber/badge)](https://www.jsdelivr.com/package/npm/exactnumber)

Arbitrary-precision decimals. Enables making math calculations with rational numbers, without precision loss.

## Quick comparision with JS floating-point arithmetic

```js
console.log(1 + 0.36);
// returns 1.3599999999999999

console.log(ExactNumber(1).add('0.36').toString());
// returns 1.36

console.log(1 / 3);
// returns 0.3333333333333333

console.log(ExactNumber(1).div(3).toString());
// returns 0.(3)

console.log((1 / 49) * 49);
// returns 0.9999999999999999

console.log(ExactNumber(1).div(49).mul(49).toString());
// returns 1

console.log(10e16 + 5);
// returns 100000000000000000

console.log(ExactNumber('10e16').add(5).toString());
// returns 100000000000000005
```

## Features

- Works with arbitrary large numbers without precision loss
- There is **no automatic rounding** or truncation. Rounding can be archived by **explicit calls** to rounding functions
- Works with all number bases between `2` and `16`
- There are no special values like `NaN`, `Infinity` or `-0`.
- No silent errors: it throws errors immediatelly when a confusing parameter is received.
- All fractions can be represented as repeating decimals like `1.23(45)`
- Repeating decimal format can also be parsed back
- Supports bitwise operators (`and`, `or`, `xor`, `shiftLeft`, `shiftRight`)
- Approximation algorithms for irrational numbers (_experimental_)
- Supports all modern browsers, web workers, Node.js and Deno
- Includes TypeScript type definitions: [documentation](https://daninet.github.io/exactnumber)
- Zero external dependencies
- Uses `BigInt` type under the hood. It automatically switches back and forth between fixed-precision and fractional representations.
- Tries to deliver the best possible performance
- 100% open source + MIT license

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
N('1/7').toFixed(3); // 0.142
N('1/7').trunc(3).toString(); // 0.142
N('0.(3)').add('0.(6)').toString(); // 1

N('0b1100').bitwiseAnd('0b1010').toString(2); // 1000

N.max('1/1', '10/2', 3).toString(); // 5
N.fromBase('123', 4).toString(); // 27

import { PI, sin } from 'exactnumber';
PI(10); // 3.1415926535

const PI_OVER_2 = N(PI(10)).div(2);
sin(PI_OVER_2, 5); // 1.00000
```

## Supported approximations

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
