// import { Fraction } from '../Fraction';

// import { log, log10, log2 } from './logarithm';
// import { compareError, testStability } from '../testHelper.test';

// describe('logarithm', () => {
//   it('log', () => {
//     for (let i = 0.01; i <= 12; i += 0.04) {
//       const jsResult = Math.log(i).toString();
//       compareError(log(i.toString(), 30), jsResult);
//     }
//   });

//   it('log large', () => {
//     for (let i = 10000; i <= 10012; i += 0.04) {
//       const jsResult = Math.log(i).toString();
//       compareError(log(i.toString(), 30), jsResult);
//     }
//   });

//   it('log 3 many digits', () => {
//     testStability((decimals) => log(3, decimals), 120);
//   });

//   it('log 73/7 many digits', () => {
//     const fraction = new Fraction(73n, 7n);
//     testStability((decimals) => log(fraction, decimals), 120);
//   });

//   it('log2', () => {
//     for (let i = 0.01; i <= 12; i += 0.04) {
//       const jsResult = Math.log2(i).toString();
//       compareError(log2(i.toString(), 30), jsResult);
//     }
//   });

//   it('log10', () => {
//     for (let i = 0.01; i <= 12; i += 0.04) {
//       const jsResult = Math.log10(i).toString();
//       compareError(log10(i.toString(), 30), jsResult);
//     }
//   });
// });
