## 2.0.0 (August 06, 2025)
- Add limitDecimals()
- Add missing tests for Fractions
- Comment out all approximations. It takes too much effort to make it fast and correct in all edge cases.
- Migrate from ESLint and Prettier to Biome

## 1.0.4 (September 30, 2024)
- Fix Typescript types path
- Update dependencies

## 1.0.3 (August 09, 2024)
- Fixed bug with invalid rounding at some fractional values
- Added isNegative()
- Added ExactNumber.isExactNumber()
- Updating dependencies

## 1.0.2 (July 07, 2024)
- Fix bug at fraction's toExponential()

## 1.0.1 (November 05, 2022)
- Fix incorrect signs at tan() approximation and precision errors at sin()

## 1.0.0 (November 05, 2022)

- Add modular exponentiation - `powm()`
- Do not expose `trimTrailingZeros()` anymore. Zero trimming is still available through the third parameter at toFixed(), toExponential() and toPrecision()
- Radian angles handled more precisely. Trigonometric functions now provide exact results for expressions like `sin(PI/6)=0.5`
- Not using BigInt literals anymore, because they are not compatible with some FE frameworks
- Performance improvements by memoizing common BigInt values
- Fixed bug with zeros not being trimmed corectly

## 0.11.0 (October 29, 2022)

- Faster rounding and more reliable normalization of fractions
- ExactNumber.gcd() and ExactNumber.lcm()
- Limit precision of input binaries at approximations

## 0.10.0 (October 23, 2022)

- Support for negative powers without approximation
- Rewritten approximation functions. API returns ExactNumber object instead of strings
- Add ExactNumber.range(start, end, increment) helper function
- Update dependencies

## 0.9.1 (October 15, 2022)

- Fix trimming of trailing zeros

## 0.9.0 (September 30, 2022)

- Add more approximations: `tanh()`, `asinh()`, `acosh()`, `atanh()`
- Fix toNumber() bug with large fractions
- Fix roots of large numbers
- Update dependencies
