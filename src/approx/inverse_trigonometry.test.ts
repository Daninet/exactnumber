// import { atan, asin, acos } from './inverse_trigonometry';
// import { compareError, testStability } from '../testHelper.test';

// describe('inverse trigonometry', () => {
//   it('atan', () => {
//     expect(atan(0, 30).toString()).toBe('0');
//     expect(atan(1, 30).toString()).toBe('0.785398163397448309615660845819');
//     expect(atan(-1, 30).toString()).toBe('-0.785398163397448309615660845819');

//     const range = [-5, 5];
//     for (let i = range[0]; i <= range[1]; i += 0.05) {
//       const jsResult = Math.atan(i).toString();
//       compareError(atan(i.toString(), 30), jsResult);
//     }
//   });

//   it('atan many digits', () => {
//     testStability((decimals) => atan('7/12', decimals), 150);
//   });

//   it('asin', () => {
//     expect(asin(0, 30).toString()).toBe('0');
//     expect(asin(1, 15).toString()).toBe('1.570796326794896');
//     expect(asin(-1, 15).toString()).toBe('-1.570796326794896');
//     expect(asin('1/2', 15).toString()).toBe('0.523598775598298');
//     expect(asin('-1/2', 15).toString()).toBe('-0.523598775598298');
//     expect(() => asin('-1.1', 30)).toThrow('Out of range');
//     expect(() => asin('1.1', 30)).toThrow('Out of range');

//     const range = [-1, 1];
//     for (let i = range[0]; i <= range[1]; i += 0.01) {
//       const jsResult = Math.asin(i).toString();
//       compareError(asin(i.toString(), 30), jsResult);
//     }
//   });

//   it('asin many digits', () => {
//     testStability((decimals) => asin('7/12', decimals), 120);
//   });

//   it('acos', () => {
//     expect(acos(0, 15).toString()).toBe('1.570796326794896');
//     expect(acos(1, 15).toString()).toBe('0');
//     expect(acos(-1, 15).toString()).toBe('3.141592653589793');
//     expect(acos('1/2', 15).toString()).toBe('1.047197551196597');
//     expect(acos('-1/2', 15).toString()).toBe('2.094395102393195');
//     expect(() => acos('-1.1', 30)).toThrow('Out of range');
//     expect(() => acos('1.1', 30)).toThrow('Out of range');

//     const range = [-1, 1];
//     for (let i = range[0]; i <= range[1]; i += 0.01) {
//       const jsResult = Math.acos(i).toString();
//       compareError(acos(i.toString(), 30), jsResult);
//     }
//   });

//   it('acos many digits', () => {
//     testStability((decimals) => acos('7/12', decimals), 110);
//   });
// });
