// import { sqrt, cbrt, nthroot } from './roots';
// import { compareError, testStability } from '../testHelper.test';

// describe('roots', () => {
//   it('handles errors', () => {
//     expect(() => nthroot(0, 2, 1)).toThrow('N cannot be zero');
//     expect(() => nthroot(-1, 2, 1)).toThrow('Negative N is not supported');
//     expect(() => nthroot(0.1, 2, 1)).toThrow('Integer is expected for N');
//   });

//   it('sqrt', () => {
//     expect(sqrt(0, 0).toFixed(0)).toBe('0');
//     expect(sqrt(0, 5).toFixed(5)).toBe('0.00000');
//     expect(sqrt(1, 0).toFixed(0)).toBe('1');
//     expect(sqrt(1, 5).toFixed(5)).toBe('1.00000');

//     for (let i = 0; i <= 144; i += 0.03) {
//       const jsResult = Math.sqrt(i).toString();
//       compareError(sqrt(i.toString(), 30), jsResult);
//     }
//   });

//   it('sqrt 2', () => {
//     expect(sqrt(2, 0).toFixed(0)).toBe('1');
//     testStability((decimals) => sqrt(2, decimals), 1000);
//   });

//   it('sqrt 3', () => {
//     expect(sqrt(3, 0).toFixed(0)).toBe('1');
//     testStability((decimals) => sqrt(3, decimals), 1000);
//   });

//   it('cbrt', () => {
//     expect(cbrt(0, 0).toFixed(0)).toBe('0');
//     expect(cbrt(0, 5).toFixed(5)).toBe('0.00000');
//     expect(cbrt(1, 0).toFixed(0)).toBe('1');
//     expect(cbrt(1, 5).toFixed(5)).toBe('1.00000');

//     for (let i = -144; i <= 144; i += 0.07) {
//       const jsResult = Math.cbrt(i).toString();
//       compareError(cbrt(i.toString(), 30), jsResult);
//     }
//   });

//   it('cbrt 2', () => {
//     expect(cbrt(2, 0).toFixed(0)).toBe('1');
//     testStability((decimals) => cbrt(2, decimals), 500);
//   });

//   it('cbrt 3', () => {
//     expect(cbrt(3, 0).toFixed(0)).toBe('1');
//     testStability((decimals) => cbrt(3, decimals), 500);
//   });

//   it('nthroot', () => {
//     expect(nthroot(1, 3, 20).toFixed(20)).toBe('3.00000000000000000000');
//     expect(nthroot(2, 3, 20).toFixed(20)).toBe('1.73205080756887729352');
//     expect(nthroot(3, 3, 20).toFixed(20)).toBe('1.44224957030740838232');
//     expect(nthroot(4, 3, 20).toFixed(20)).toBe('1.31607401295249246081');
//     expect(nthroot(5, -3, 20).toFixed(20)).toBe('-1.24573093961551732596');
//     expect(nthroot(6, 3, 20).toFixed(20)).toBe('1.20093695517600272667');
//     expect(nthroot(7, 3, 20).toFixed(20)).toBe('1.16993081275868688646');

//     expect(nthroot(2, 0, 20).toFixed(20)).toBe('0.00000000000000000000');
//     expect(nthroot(3, 0, 20).toFixed(20)).toBe('0.00000000000000000000');
//     expect(nthroot(2, '1e30', 3).toFixed(3)).toBe(`1${'0'.repeat(15)}.000`);
//     expect(nthroot(3, '1e300', 3).toFixed(3)).toBe(`1${'0'.repeat(100)}.000`);
//     expect(nthroot(3, '1e600', 3).toFixed(3)).toBe(`1${'0'.repeat(200)}.000`);
//     expect(nthroot(3, '-1e600', 3).toFixed(3)).toBe(`-1${'0'.repeat(200)}.000`);
//     expect(nthroot(3, '1e-30', 3).toFixed(3)).toBe('0.000');
//     expect(nthroot(3, '1e-300', 3).toFixed(3)).toBe('0.000');
//     expect(nthroot(3, '1e-600', 3).toFixed(3)).toBe('0.000');
//     expect(nthroot(3, '-1e-600', 3).toFixed(3)).toBe('0.000');
//   });

//   it('nthroot 193', () => {
//     for (let i = 0; i <= 144; i += 0.07) {
//       const jsResult = (i ** (1 / 193)).toString();
//       compareError(nthroot(193, i.toString(), 30), jsResult);
//     }
//   });
// });
