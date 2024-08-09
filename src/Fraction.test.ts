import { Fraction } from './Fraction';
import { ExactNumberParameter, ModType, RoundingMode } from './types';

describe('Fraction', () => {
  it('parse string', () => {
    const run = (x: string) => new Fraction(x, 1n).serialize();

    expect(run('0')).toStrictEqual([0n, 1n]);
    expect(run('-0')).toStrictEqual([0n, 1n]);
    expect(run('2')).toStrictEqual([2n, 1n]);
    expect(run('3/4')).toStrictEqual([3n, 4n]);

    expect(() => run('2.((4))')).toThrow('Cannot parse string "2.((4))"');
    expect(() => run('2.(4')).toThrow('Cannot parse string "2.(4"');
  });

  it('parse repeating decimals', () => {
    const run = (x: string) => new Fraction(x, 1n).serialize();

    expect(run('3.25(4)')).toStrictEqual([2929n, 900n]);
    expect(run('-3.25(4)')).toStrictEqual([-2929n, 900n]);
    expect(run('1.(3)')).toStrictEqual([4n, 3n]);
    expect(run('-1.(3)')).toStrictEqual([-4n, 3n]);
    expect(run('1.0(91)')).toStrictEqual([1081n, 990n]);
    expect(run('-1.0(91)')).toStrictEqual([-1081n, 990n]);
    expect(run('0.3(789)')).toStrictEqual([631n, 1665n]);
    expect(run('-0.3(789)')).toStrictEqual([-631n, 1665n]);
    expect(run('.3(789)')).toStrictEqual([631n, 1665n]);
    expect(run('-.3(789)')).toStrictEqual([-631n, 1665n]);
    expect(run('1.(9)')).toStrictEqual([2n, 1n]);
  });

  it('parse repeating decimals with exponents', () => {
    const run = (x: string) => new Fraction(x, 1n).serialize();

    expect(run('1.(3)e0')).toStrictEqual([4n, 3n]);
    expect(run('1.(3)E+1')).toStrictEqual([40n, 3n]);
    expect(run('1.(3)E2')).toStrictEqual([400n, 3n]);
    expect(run('1.(3)e-1')).toStrictEqual([2n, 15n]);
    expect(run('1.(3)e-2')).toStrictEqual([1n, 75n]);
  });

  it('initializes with other types', () => {
    const run = (x: any) => new Fraction(x, 1n).toString();

    const errorMsg = 'Unsupported parameter!';

    expect(() => run(false)).toThrow(errorMsg);
    expect(() => run(true)).toThrow(errorMsg);
    expect(() => run(null)).toThrow(errorMsg);
    expect(() => run(undefined)).toThrow(errorMsg);
    expect(() => run([])).toThrow(errorMsg);
    expect(() => run({})).toThrow(errorMsg);
    expect(() => run(/1/)).toThrow(errorMsg);
  });

  it('toBase()', () => {
    const run = (a: string, radix: number) => new Fraction(a, 1n).toString(radix);

    expect(run('0', 2)).toBe('0');
    expect(run('100', 2)).toBe('1100100');
    expect(run('16', 2)).toBe('10000');
    expect(run('-16', 2)).toBe('-10000');
    expect(run('16.000', 2)).toBe('10000');
    expect(run('0.125', 2)).toBe('0.001');
    expect(run('0.5', 3)).toBe('0.(1)');
    expect(run('-123.500', 10)).toBe('-123.5');
    expect(run('0.4', 3)).toBe('0.(1012)');
    expect(run('0.3', 16)).toBe('0.4(c)');
    expect(run('0.013', 7)).toBe('0.(00431330261442015456)');
    expect(run('0.012', 6)).toBe('0.0(0233151220401052455413443)');
    expect(run('-0.012', 6)).toBe('-0.0(0233151220401052455413443)');
    expect(run('-15.012', 6)).toBe('-23.0(0233151220401052455413443)');

    expect(run('1/7', 2)).toBe('0.(001)');
    expect(run('-7/12', 2)).toBe('-0.10(01)');
    expect(run('-7/12', 9)).toBe('-0.5(2)');
    expect(run('-43/13', 10)).toBe('-3.(307692)');
    expect(run('-43/13', 16)).toBe('-3.(4ec)');
    expect(run('43/13', 3)).toBe('10.(022)');
  });

  it('toFraction()', () => {
    const run = (x: string, y: string) => new Fraction(x, y).toFraction();

    expect(run('1', '1')).toBe('1/1');
    expect(run('123', '1')).toBe('123/1');
    expect(run('-123.560', '1')).toBe('-3089/25');
    expect(run('0', '1')).toBe('0/1');
  });

  it('normalization', () => {
    const run = (a: string) => new Fraction(a, 1n).toFraction();

    expect(run('0/1')).toBe('0/1');
    expect(run('0/-100')).toBe('0/1');
    expect(run('0/0.02')).toBe('0/1');
    expect(run('6/3')).toBe('2/1');
    expect(run('5/20')).toBe('1/4');
    expect(run('5/-20')).toBe('-1/4');
    expect(run('-5/20')).toBe('-1/4');
    expect(run('-5/-20')).toBe('1/4');
  });

  it('add()', () => {
    const run = (a: string, b: string) => new Fraction(a, 1n).add(b).toFraction();

    expect(run('2/1', '3/1')).toBe('5/1');
    expect(run('4/2', '5/2')).toBe('9/2');
    expect(run('9/-2', '5/2')).toBe('-2/1');
    expect(run('4/3', '5/2')).toBe('23/6');
    expect(run('4/3', '-5/2')).toBe('-7/6');
  });

  it('sub()', () => {
    const run = (a: string, b: string) => new Fraction(a, 1n).sub(b).toFraction();

    expect(run('5/1', '2/1')).toBe('3/1');
    expect(run('4/2', '5/2')).toBe('-1/2');
    expect(run('9/-2', '5/2')).toBe('-7/1');
    expect(run('4/3', '-5/2')).toBe('23/6');
    expect(run('4/3', '5/2')).toBe('-7/6');
  });

  it('mul()', () => {
    const run = (a: string, b: string) => new Fraction(a, 1n).mul(b).toFraction();

    expect(run('5/1', '2/1')).toBe('10/1');
    expect(run('4/3', '5/4')).toBe('5/3');
    expect(run('4/3', '-5/4')).toBe('-5/3');
    expect(run('4/-3', '-5/4')).toBe('5/3');
    expect(run('-4/-3', '-5/4')).toBe('-5/3');

    expect(run('4/3', '0/4')).toBe('0/1');
  });

  it('div()', () => {
    const run = (a: string, b: string) => new Fraction(a, 1n).div(b).toFraction();

    expect(run('5/1', '2/1')).toBe('5/2');
    expect(run('4/3', '5/4')).toBe('16/15');
    expect(run('4/3', '-5/4')).toBe('-16/15');
    expect(run('4/-6', '-5/8')).toBe('16/15');
    expect(run('-4/-6', '-5/8')).toBe('-16/15');
    expect(run('401.65', '9')).toBe('8033/180');

    expect(() => run('1', '0/1')).toThrow('Division by zero');
  });

  it('divToInt()', () => {
    const run = (a: ExactNumberParameter, b: ExactNumberParameter) => new Fraction(a, 1n).divToInt(b).toString();

    expect(run('2/4', '4/8')).toBe('1');
    expect(run('5/7', '1/3')).toBe('2');
    expect(run('5/7', '1/4')).toBe('2');
    expect(run('1', '-1')).toBe('-1');
    expect(run('-1', '1')).toBe('-1');
    expect(run('-1', '-1')).toBe('1');

    expect(() => run('1', '0')).toThrow('Division by zero');
    expect(() => run('0', '0')).toThrow('Division by zero');
  });

  it('mod()', () => {
    const run = (a: string | number, b: string | number, type?: ModType) =>
      new Fraction(a, 1n).mod(b, type).toFraction();

    expect(run('1/7', '1')).toBe('1/7');
    expect(run('10/2', '9/3')).toBe('2/1');
    expect(run('7/12', '7/12')).toBe('0/1');
    expect(run('8/12', '7/12')).toBe('1/12');
    expect(run('21/17', '11/13')).toBe('86/221');
    expect(run('53/17', '11/13')).toBe('128/221');

    const values = [
      ['15/3', '6/2'],
      ['-15/3', '6/2'],
      ['15/3', '-6/2'],
      ['-15/3', '-6/2'],
    ];
    const table: Record<ModType, string[]> = {
      [ModType.TRUNCATED]: ['2/1', '-2/1', '2/1', '-2/1'],
      [ModType.FLOORED]: ['2/1', '1/1', '-1/1', '-2/1'],
      [ModType.EUCLIDEAN]: ['2/1', '1/1', '2/1', '1/1'],
    };

    for (const modType of Object.keys(table)) {
      const results = table[modType];
      for (const index in values) {
        const [x, y] = values[index];
        expect(run(x, y, modType as ModType)).toBe(results[index]);
      }
    }
  });

  it('pow()', () => {
    const run = (a: ExactNumberParameter, b: ExactNumberParameter) => new Fraction(a, 1n).pow(b).toFraction();

    expect(run('5', '3')).toBe('125/1');
    expect(run('5', '0')).toBe('1/1');
    expect(run('-5/7', '0')).toBe('1/1');
    expect(run('-5/7', '2/2')).toBe('-5/7');
    expect(run('4/-10', '4/2')).toBe('4/25');
    expect(run('-5/7', '4/2')).toBe('25/49');
    expect(run('-5/7', '-1')).toBe('-7/5');
    expect(run('-5/7', '-4/2')).toBe('49/25');
    expect(run('5/-7', '-6/2')).toBe('-343/125');
    expect(run('5/7', '-6/2')).toBe('343/125');

    expect(() => run('2', '1/7')).toThrow('Unsupported parameter');
  });

  it('powm()', () => {
    const run = (b: ExactNumberParameter, e: ExactNumberParameter, m: ExactNumberParameter) =>
      new Fraction(b, 1n).powm(e, m).toString();

    expect(run(3, 4, 5)).toBe('1');
    expect(run(314, 23, 971)).toBe('865');

    for (let b = 2; b <= 25; b++) {
      for (let e = 0; e <= 10; e++) {
        for (let m = 11; m <= 13; m++) {
          expect(run(b, e, m)).toBe((b ** e % m).toString());
        }
      }
    }
  });

  it('round()', () => {
    const run = (a: string, decimals?: number, rndMode?: RoundingMode) =>
      new Fraction(a, 1n).round(decimals, rndMode).toFixed(decimals ?? 0);

    expect(run('1/2', 0, RoundingMode.NEAREST_AWAY_FROM_ZERO)).toBe('1');
    expect(run('3/2', 0, RoundingMode.NEAREST_AWAY_FROM_ZERO)).toBe('2');
    expect(run('3/2', 0, RoundingMode.NEAREST_TO_ZERO)).toBe('1');
    expect(run('1/3', 0, RoundingMode.NEAREST_AWAY_FROM_ZERO)).toBe('0');

    expect(run('4/2', 0, RoundingMode.TO_POSITIVE)).toBe('2');
    expect(run('4/2', 3, RoundingMode.TO_POSITIVE)).toBe('2.000');

    expect(run('40/20', 0, RoundingMode.TO_POSITIVE)).toBe('2');
    expect(run('41/20', 0, RoundingMode.TO_POSITIVE)).toBe('3');
    expect(run('41/20', 1, RoundingMode.TO_POSITIVE)).toBe('2.1');

    expect(run('2499/1000', 0, RoundingMode.NEAREST_TO_POSITIVE)).toBe('2');
    expect(run('2500/1000', 0, RoundingMode.NEAREST_TO_POSITIVE)).toBe('3');
    expect(run('2501/1000', 0, RoundingMode.NEAREST_TO_NEGATIVE)).toBe('3');

    expect(run('2499/1000', 1, RoundingMode.NEAREST_TO_POSITIVE)).toBe('2.5');
    expect(run('2500/1000', 1, RoundingMode.NEAREST_TO_POSITIVE)).toBe('2.5');
    expect(run('2501/1000', 1, RoundingMode.NEAREST_TO_POSITIVE)).toBe('2.5');
    expect(run('2550/1000', 1, RoundingMode.NEAREST_TO_NEGATIVE)).toBe('2.5');
    expect(run('2550/1000', 1, RoundingMode.NEAREST_TO_POSITIVE)).toBe('2.6');
    expect(run('2555/1000', 1, RoundingMode.NEAREST_TO_NEGATIVE)).toBe('2.6');
  });

  it('roundToDigits()', () => {
    const run = (a: string, digits: number, rndMode: RoundingMode) =>
      new Fraction(a, 1n).roundToDigits(digits, rndMode).toString();

    expect(run('0/1', 2, RoundingMode.TO_ZERO)).toBe('0');
    expect(run('-0/1', 3, RoundingMode.TO_ZERO)).toBe('0');

    expect(run('1/1', 1, RoundingMode.TO_POSITIVE)).toBe('1');

    expect(run('-12345/1', 1, RoundingMode.TO_ZERO)).toBe('-10000');
    expect(run('-12345/1', 7, RoundingMode.TO_ZERO)).toBe('-12345');

    expect(run('123.45/1', 1, RoundingMode.TO_ZERO)).toBe('100');
    expect(run('123.45/1', 3, RoundingMode.TO_ZERO)).toBe('123');
    expect(run('-123.45/1', 4, RoundingMode.TO_ZERO)).toBe('-123.4');
    expect(run('-123.45/1', 5, RoundingMode.TO_ZERO)).toBe('-123.45');
    expect(run('123.45/1', 6, RoundingMode.TO_ZERO)).toBe('123.45');

    expect(run('129.000/1', 2, RoundingMode.TO_ZERO)).toBe('120');
    expect(run('129.000/1', 2, RoundingMode.TO_POSITIVE)).toBe('130');
    expect(run('129.000/1', 6, RoundingMode.TO_ZERO)).toBe('129');

    expect(run('0.0001234/1', 1, RoundingMode.TO_ZERO)).toBe('0.0001');
    expect(run('-0.0001234/1', 2, RoundingMode.TO_ZERO)).toBe('-0.00012');

    expect(run('45.452/1', 1, RoundingMode.NEAREST_AWAY_FROM_ZERO)).toBe('50');
    expect(run('45.452/1', 2, RoundingMode.NEAREST_AWAY_FROM_ZERO)).toBe('45');
    expect(run('45.452/1', 3, RoundingMode.NEAREST_AWAY_FROM_ZERO)).toBe('45.5');
    expect(run('45.452/1', 4, RoundingMode.NEAREST_AWAY_FROM_ZERO)).toBe('45.45');
    expect(run('45.452/1', 5, RoundingMode.NEAREST_AWAY_FROM_ZERO)).toBe('45.452');
    expect(run('45.452/1', 6, RoundingMode.NEAREST_AWAY_FROM_ZERO)).toBe('45.452');
  });

  it('intPart()', () => {
    const run = (a: string) => new Fraction(a, 1n).intPart().toString();

    expect(run('0/1')).toBe('0');
    expect(run('-8/7')).toBe('-1');
    expect(run('8/7')).toBe('1');
    expect(run('-6/7')).toBe('0');
    expect(run('1/7')).toBe('0');
    expect(run('-22/7')).toBe('-3');
    expect(run('111/11')).toBe('10');
  });

  it('fracPart()', () => {
    const run = (a: string) => new Fraction(a, 1n).fracPart().toFraction();

    expect(run('0')).toBe('0/1');
    expect(run('-8/7')).toBe('-1/7');
    expect(run('10/7')).toBe('3/7');
    expect(run('-27/7')).toBe('-6/7');
    expect(run('111/11')).toBe('1/11');
  });

  it('toFixed()', () => {
    const run = (a: string) => new Fraction(a, 1n);

    expect(run('1/2').toFixed(0)).toBe('0');
    expect(run('7/2').toFixed(0)).toBe('3');
    expect(run('-8/2').toFixed(0)).toBe('-4');
    expect(run('-0/2').toFixed(0)).toBe('0');

    expect(run('1/2').toFixed(1)).toBe('0.5');
    expect(run('1/-2').toFixed(3)).toBe('-0.500');
    expect(run('4/3').toFixed(5)).toBe('1.33333');
    expect(run('15/7').toFixed(8)).toBe('2.14285714');

    expect(run('-1/20').toFixed(0)).toBe('0');
    expect(run('-1/20').toFixed(10)).toBe('-0.0500000000');
  });

  it('toRepeatingDigits()', () => {
    const run = (a: string) => new Fraction(a, 1n);

    expect(run('1/2').toRepeatingDigits(undefined)).toBe('0.5');
    expect(run('1/3').toRepeatingDigits(undefined)).toBe('0.(3)');
    expect(run('2/3').toRepeatingDigits(undefined)).toBe('0.(6)');
    expect(run('9/11').toRepeatingDigits(undefined)).toBe('0.(81)');
    expect(run('7/12').toRepeatingDigits(undefined)).toBe('0.58(3)');
    expect(run('22/7').toRepeatingDigits(undefined)).toBe('3.(142857)');
    expect(run('-1/28').toRepeatingDigits(undefined)).toBe('-0.03(571428)');
    expect(run('15/7').toRepeatingDigits(undefined)).toBe('2.(142857)');
    expect(run('15').toRepeatingDigits(undefined)).toBe('15');
    expect(run('401.65/9').toRepeatingDigits(undefined)).toBe('44.62(7)');
  });

  it('ceil()', () => {
    const run = (a: string, b = 1n) => new Fraction(a, b).ceil().toString();

    expect(run('0')).toBe('0');
    expect(run('0.99')).toBe('1');
    expect(run('3.099')).toBe('4');
    expect(run('3.678')).toBe('4');
    expect(run('4.0000')).toBe('4');
    expect(run('1234')).toBe('1234');

    expect(run('-0')).toBe('0');
    expect(run('-0.99')).toBe('0');
    expect(run('-3.099')).toBe('-3');
    expect(run('-3.678')).toBe('-3');
    expect(run('-4.0000')).toBe('-4');
    expect(run('-4.0001')).toBe('-4');
    expect(run('-1234')).toBe('-1234');

    expect(run('-1', 2n)).toBe('0');
    expect(run('-3', 2n)).toBe('-1');
    expect(run('-3661', 86400n)).toBe('0');
    expect(run('-3661', -86400n)).toBe('1');
  });

  it('correct transients', () => {
    const run = (a: string) => expect(new Fraction(a, 1n).toString()).toBe(a);

    run('0.5');
    run('0.5(1)');
    run('0.(2)');
    run('0.(200)');
    run('0.000(5)');
    run('-12.3456(78)');
    run('-11.1111112(1)');
    run('-9.00123456(789780)');
  });

  it('aborts cycle calculation correctly', () => {
    const run = (a: string, maxDigits: number) => new Fraction(a, 1n).toString(10, maxDigits);

    expect(run('-19.51(7890)', 0)).toBe('-19');
    expect(run('-19.51(7890)', 1)).toBe('-19.5');
    expect(run('-19.51(7890)', 2)).toBe('-19.51');
    expect(run('-19.51(7890)', 3)).toBe('-19.517');
    expect(run('-19.51(7890)', 4)).toBe('-19.5178');
    expect(run('-19.51(7890)', 5)).toBe('-19.51789');
    expect(run('-19.51(7890)', 6)).toBe('-19.51(7890)');
    expect(run('-19.51(7890)', 7)).toBe('-19.51(7890)');
  });

  it('toNumber()', () => {
    const run = (a: string, b: string) => new Fraction(a, b).toNumber();

    expect(run('0', '1')).toBe(0);
    expect(run('-0', '1')).toBe(0);
    expect(run('-1', '2')).toBe(-0.5);
    expect(run('-1.00000', '1')).toBe(-1);
    expect(run('-1.5', '1')).toBe(-1.5);
    expect(run('.023456', '-1')).toBe(-0.023456);
    expect(run(Number.MAX_VALUE.toString(), '1')).toBe(Number.MAX_VALUE);
    expect(run('9'.repeat(300), '1'.repeat(300))).toBe(9);
  });

  it('toExponential()', () => {
    const run = (a: string, b: string, digits: number, trimZeros?: boolean) =>
      new Fraction(a, b).toExponential(digits, RoundingMode.TO_ZERO, trimZeros);

    expect(run('10', '2', 4)).toBe('5.0000e+0');
    expect(run('-1000', '2', 4)).toBe('-5.0000e+2');

    expect(run('1', '2', 4)).toBe('5.0000e-1');
    expect(run('-1', '2', 4)).toBe('-5.0000e-1');
    expect(run('1', '-2', 4)).toBe('-5.0000e-1');

    expect(run('1', '3', 4)).toBe('3.3333e-1');

    expect(run('0.00000898959115147590', '1', 4)).toBe('8.9895e-6');
    expect(run('-0.00000898959115147590', '1', 5)).toBe('-8.98959e-6');

    expect(run('898959115147.5903', '1', 5)).toBe('8.98959e+11');

    expect(run('0', '2', 4)).toBe('0.0000e+0');
    expect(run('3', '1', 4)).toBe('3.0000e+0');
    expect(run('123', '1', 4)).toBe('1.2300e+2');
  });

  it('toString()', () => {
    const run = (x: string) => new Fraction(x, 1n).toString();

    expect(run('0')).toBe('0');
    expect(run('-0')).toBe('0');
    expect(run('1')).toBe('1');
    expect(run('10')).toBe('10');
    expect(run('-1000')).toBe('-1000');
    expect(run('1000.00')).toBe('1000');
    expect(run('1000.01')).toBe('1000.01');
  });

  it('toString() + maxDigits', () => {
    const run = (x: string, digits: number) => new Fraction(x, 10n).toString(10, digits);

    expect(run('-1916.51(7890)', 0)).toBe('-191');
    expect(run('-1916.51(7890)', 1)).toBe('-191.6');
    expect(run('-1916.51(7890)', 3)).toBe('-191.651');
    expect(run('-1916.51(7890)', 4)).toBe('-191.6517');
    expect(run('-1916.51(7890)', 6)).toBe('-191.651789');
    expect(run('-1916.51(7890)', 7)).toBe('-191.651(7890)');
    expect(run('-1916.51(7890)', 8)).toBe('-191.651(7890)');
  });

  it('valueOf()', () => {
    const run = (x: string) => new Fraction(x, 1n).valueOf();

    expect(() => run('0')).toThrow('Unsafe conversion to Number type! Use toNumber() instead.');
    expect(() => run('2')).toThrow('Unsafe conversion to Number type! Use toNumber() instead.');
  });
});
