import { FixedNumber } from './FixedNumber';
import { Fraction } from './Fraction';
import { ExactNumberParameter, ModType, RoundingMode } from './types';

describe('FixedNumber', () => {
  it('parses string', () => {
    const run = (x: string) => new FixedNumber(x).serialize();

    expect(run('0')).toStrictEqual([0n, 0]);
    expect(run('-0')).toStrictEqual([0n, 0]);
    expect(run('2')).toStrictEqual([2n, 0]);
    expect(run('2.')).toStrictEqual([2n, 0]);
    expect(run('  123 ')).toStrictEqual([123n, 0]);
    expect(run('  -123 ')).toStrictEqual([-123n, 0]);
    expect(run('123456789')).toStrictEqual([123456789n, 0]);
    expect(run('123456789123456789')).toStrictEqual([123456789123456789n, 0]);
    expect(run('0.0')).toStrictEqual([0n, 1]);
    expect(run('.0')).toStrictEqual([0n, 1]);
    expect(run('-.1')).toStrictEqual([-1n, 1]);
    expect(run('-.1234')).toStrictEqual([-1234n, 4]);
    expect(run(' 0.45600 ')).toStrictEqual([45600n, 5]);
    expect(run(' -123.45600 ')).toStrictEqual([-12345600n, 5]);
    expect(run('00.0010')).toStrictEqual([10n, 4]);
    expect(run('-00.0010')).toStrictEqual([-10n, 4]);

    expect(() => run('0x1')).toThrow('Cannot parse number "0x1"');
    expect(() => run('0b1')).toThrow('Cannot parse number "0b1"');
    expect(() => run('0o1')).toThrow('Cannot parse number "0o1"');
    expect(() => run('a')).toThrow('Cannot parse number "a"');
  });

  it('parses string with sci notation', () => {
    const run = (x: string) => new FixedNumber(x).toString();

    expect(run('0e0')).toBe('0');
    expect(run('123.4E0')).toBe('123.4');
    expect(run('123.450e-0')).toBe('123.45');
    expect(run('1E3')).toBe('1000');
    expect(run('1E20')).toBe(`1${'0'.repeat(20)}`);
    expect(run('1e-3')).toBe('0.001');
    expect(run('1.234E+2')).toBe('123.4');
    expect(run('1.234E-2')).toBe('0.01234');
    expect(run('-1.234E+2')).toBe('-123.4');
    expect(run('-1.234E-2')).toBe('-0.01234');
  });

  it('parses numbers', () => {
    const run = (x: number) => new FixedNumber(x).serialize();

    expect(run(0)).toStrictEqual([0n, 0]);
    expect(run(-0)).toStrictEqual([0n, 0]);
    expect(run(123)).toStrictEqual([123n, 0]);
    expect(run(-1234500)).toStrictEqual([-1234500n, 0]);

    const invalidNumberError =
      'The specified number cannot be exactly represented as an integer. Please provide a string instead.';

    expect(() => run(0.5)).toThrow(invalidNumberError);
    expect(() => run(1.5)).toThrow(invalidNumberError);
    expect(() => run(Infinity)).toThrow(invalidNumberError);
    expect(() => run(-Infinity)).toThrow(invalidNumberError);
    expect(() => run(NaN)).toThrow(invalidNumberError);
    expect(() => run(Number.MAX_VALUE)).toThrow(invalidNumberError);
    expect(() => run(Number.MAX_SAFE_INTEGER + 1)).toThrow(invalidNumberError);
    expect(() => run(Number.MIN_SAFE_INTEGER - 1)).toThrow(invalidNumberError);
  });

  it('parses bigints', () => {
    const run = (x: bigint) => new FixedNumber(x).serialize();

    expect(run(0n)).toStrictEqual([0n, 0]);
    expect(run(-0n)).toStrictEqual([0n, 0]);
    expect(run(-1n)).toStrictEqual([-1n, 0]);
    expect(run(1n)).toStrictEqual([1n, 0]);
    expect(run(1234567890n)).toStrictEqual([1234567890n, 0]);
  });

  it('initializes with other types', () => {
    const run = (x: any) => new FixedNumber(x).toString();

    const errorMsg = 'Unsupported parameter!';

    expect(() => run(false)).toThrow(errorMsg);
    expect(() => run(true)).toThrow(errorMsg);
    expect(() => run(null)).toThrow(errorMsg);
    expect(() => run(undefined)).toThrow(errorMsg);
    expect(() => run([])).toThrow(errorMsg);
    expect(() => run({})).toThrow(errorMsg);
    expect(() => run(/1/)).toThrow(errorMsg);
    expect(() => run(new Fraction('1.7', 1n))).toThrow('Cannot create FixedNumber from non-integer Fraction');

    expect(run(new Fraction('6', '2'))).toBe('3');
    expect(run(new FixedNumber('2.6'))).toBe('2.6');
  });

  it('add()', () => {
    const run = (a: ExactNumberParameter, b: ExactNumberParameter) => new FixedNumber(a).add(b).toString();

    expect(run('0', '2')).toBe('2');
    expect(run('7', '123')).toBe('130');
    expect(run('0', '-0')).toBe('0');
    expect(run(1, 2)).toBe('3');
    expect(run('999', 2n)).toBe('1001');
    expect(run('0.01', new FixedNumber(2))).toBe('2.01');
    expect(run('0.01', new Fraction(1, 2))).toBe('0.51');
    expect(run('0.01', '0.03')).toBe('0.04');
    expect(run('0.01', '0.003')).toBe('0.013');
    expect(run('-0.01', '0.003')).toBe('-0.007');
    expect(run('0.01', '-0.003')).toBe('0.007');
    expect(run('0.012', '0.008')).toBe('0.02');
    expect(run('0.02', '2.98')).toBe('3');
  });

  it('sub()', () => {
    const run = (a: ExactNumberParameter, b: ExactNumberParameter) => new FixedNumber(a).sub(b).toString();

    expect(run('0', '2')).toBe('-2');
    expect(run('123', '123')).toBe('0');
    expect(run('0', '-0')).toBe('0');
    expect(run('1', 2)).toBe('-1');
    expect(run('1001', 2n)).toBe('999');
    expect(run('2', new FixedNumber('0.01'))).toBe('1.99');
    expect(run('0.03', new Fraction(1, '100'))).toBe('0.02');
    expect(run('0.01', '0.003')).toBe('0.007');
    expect(run('-0.01', '-0.003')).toBe('-0.007');
    expect(run('-0.01', '0.003')).toBe('-0.013');
    expect(run('0.01', '-0.003')).toBe('0.013');
    expect(run('3.001', '0.1')).toBe('2.901');
  });

  it('mul()', () => {
    const run = (a: ExactNumberParameter, b: ExactNumberParameter) => new FixedNumber(a).mul(b).toString();

    expect(run('0', '2')).toBe('0');
    expect(run('123', '0')).toBe('0');
    expect(run('123', '123')).toBe('15129');
    expect(run('0', '-0')).toBe('0');
    expect(run('1', 2)).toBe('2');
    expect(run('1001', -2n)).toBe('-2002');
    expect(run('2', new Fraction(1, '100'))).toBe('0.02');
    expect(run('10', new FixedNumber('0.03'))).toBe('0.3');
    expect(run('100', '0.01')).toBe('1');
    expect(run('-1000', '0.06')).toBe('-60');
  });

  it('pow()', () => {
    const run = (a: ExactNumberParameter, b: ExactNumberParameter) => new FixedNumber(a).pow(b).toString();

    expect(run('0.0123', '0')).toBe('1');
    expect(run('2', '0')).toBe('1');
    expect(run('0', 2)).toBe('0');
    expect(run('12.34', 1n)).toBe('12.34');
    expect(run('2', new FixedNumber('1'))).toBe('2');
    expect(run('2', new Fraction('4', 2))).toBe('4');
    expect(run('2', '3')).toBe('8');
    expect(run('0.1', '2')).toBe('0.01');
    expect(run('0.1', '10')).toBe('0.0000000001');
  });

  it('mod()', () => {
    const run = (a: ExactNumberParameter, b: ExactNumberParameter, type?: ModType) =>
      new FixedNumber(a).mod(b, type).toString();

    expect(run('0', '2')).toBe('0');
    expect(run('1', 2)).toBe('1');
    expect(run('2', '2')).toBe('0');
    expect(run('10', 9n)).toBe('1');
    expect(run('-10', '9')).toBe('-1');
    expect(run('10.5', '9')).toBe('1.5');
    expect(run('-10.5', new Fraction('18', 2))).toBe('-1.5');
    expect(run('3.75', new FixedNumber('1.25'))).toBe('0');
    expect(run('3.751', '1.25')).toBe('0.001');
    expect(run('3.745', '1.25')).toBe('1.245');
    expect(run('-3.745', '1.25')).toBe('-1.245');
    expect(run('3.745', '-1.25')).toBe('1.245');
    expect(run('-3.745', '-1.25')).toBe('-1.245');

    const values = [
      [5, 3],
      [-5, 3],
      [5, -3],
      [-5, -3],
    ];
    const table: Record<string, string[]> = {
      [ModType.TRUNCATED]: ['2', '-2', '2', '-2'],
      [ModType.FLOORED]: ['2', '1', '-1', '-2'],
      [ModType.EUCLIDEAN]: ['2', '1', '2', '1'],
    };

    for (const modType of Object.keys(table)) {
      const results = table[modType];
      for (const index in values) {
        const [x, y] = values[index];
        expect(run(x, y, modType as ModType)).toBe(results[index]);
      }
    }
  });

  it('abs()', () => {
    const run = (a: ExactNumberParameter) => new FixedNumber(a).abs().toString();

    expect(run('0')).toBe('0');
    expect(run('-0')).toBe('0');
    expect(run(-2)).toBe('2');
    expect(run(-2n)).toBe('2');
    expect(run(new FixedNumber(-2))).toBe('2');
    expect(run(new Fraction(2, -1))).toBe('2');
    expect(() => run(new Fraction(1, -2))).toThrow('Cannot create FixedNumber from non-integer Fraction');
    expect(run('-1.234')).toBe('1.234');
    expect(run('1.234')).toBe('1.234');
    expect(run('-.234')).toBe('0.234');
    expect(run('.234')).toBe('0.234');
  });

  it('neg()', () => {
    const run = (a: string) => new FixedNumber(a).neg().toString();

    expect(run('0')).toBe('0');
    expect(run('-0')).toBe('0');
    expect(run('-1.234')).toBe('1.234');
    expect(run('1.234')).toBe('-1.234');
    expect(run('-.234')).toBe('0.234');
    expect(run('.234')).toBe('-0.234');
  });

  it('inv()', () => {
    expect(() => new FixedNumber('0').inv()).toThrow('Division by zero');
    expect(() => new FixedNumber('-0').inv()).toThrow('Division by zero');

    const run = (a: string) => new FixedNumber(a).inv().toString();

    expect(run('1')).toBe('1');
    expect(run('-1')).toBe('-1');
    expect(run('2')).toBe('0.5');
    expect(run('-123.5')).toBe('-0.(008097165991902834)');
    expect(run('.3')).toBe('3.(3)');
  });

  it('floor()', () => {
    const run = (a: string) => new FixedNumber(a).floor().toString();

    expect(run('0')).toBe('0');
    expect(run('0.99')).toBe('0');
    expect(run('3.099')).toBe('3');
    expect(run('3.678')).toBe('3');
    expect(run('4.0000')).toBe('4');
    expect(run('1234')).toBe('1234');

    expect(run('-0')).toBe('0');
    expect(run('-0.99')).toBe('-1');
    expect(run('-3.099')).toBe('-4');
    expect(run('-3.678')).toBe('-4');
    expect(run('-4.0000')).toBe('-4');
    expect(run('-4.0001')).toBe('-5');
    expect(run('-1234')).toBe('-1234');
  });

  it('ceil()', () => {
    const run = (a: string) => new FixedNumber(a).ceil().toString();

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
  });

  it('trunc()', () => {
    const run = (a: string) => new FixedNumber(a).trunc().toString();

    expect(run('0')).toBe('0');
    expect(run('0.99')).toBe('0');
    expect(run('3.099')).toBe('3');
    expect(run('3.678')).toBe('3');
    expect(run('4.0000')).toBe('4');
    expect(run('1234')).toBe('1234');

    expect(run('-0')).toBe('0');
    expect(run('-0.99')).toBe('0');
    expect(run('-3.099')).toBe('-3');
    expect(run('-3.678')).toBe('-3');
    expect(run('-4.0000')).toBe('-4');
    expect(run('-4.0001')).toBe('-4');
    expect(run('-1234')).toBe('-1234');
  });

  const testRoundTable = (values: string[], table: Record<RoundingMode, string[]>, digits?: number) => {
    Object.keys(table).forEach(rndMode => {
      const tableRow = table[rndMode as keyof typeof table];

      values.forEach((num, i) => {
        const res = new FixedNumber(num).round(rndMode as RoundingMode, digits).toString();
        expect(res).toBe(tableRow[i]);
      });
    });
  };

  it('round() with table of values - no extra digits', () => {
    const values = ['-4', '-3.7', '-3.5', '-3.3', '-3', '2', '2.3', '2.5', '2.7', '3'];
    const table: Record<RoundingMode, string[]> = {
      [RoundingMode.TO_POSITIVE]: ['-4', '-3', '-3', '-3', '-3', '2', '3', '3', '3', '3'],
      [RoundingMode.TO_NEGATIVE]: ['-4', '-4', '-4', '-4', '-3', '2', '2', '2', '2', '3'],
      [RoundingMode.TO_ZERO]: ['-4', '-3', '-3', '-3', '-3', '2', '2', '2', '2', '3'],
      [RoundingMode.AWAY_FROM_ZERO]: ['-4', '-4', '-4', '-4', '-3', '2', '3', '3', '3', '3'],
      [RoundingMode.NEAREST_TO_POSITIVE]: ['-4', '-4', '-3', '-3', '-3', '2', '2', '3', '3', '3'],
      [RoundingMode.NEAREST_TO_NEGATIVE]: ['-4', '-4', '-4', '-3', '-3', '2', '2', '2', '3', '3'],
      [RoundingMode.NEAREST_TO_EVEN]: ['-4', '-4', '-4', '-3', '-3', '2', '2', '2', '3', '3'],
      [RoundingMode.NEAREST_TO_ZERO]: ['-4', '-4', '-3', '-3', '-3', '2', '2', '2', '3', '3'],
      [RoundingMode.NEAREST_AWAY_FROM_ZERO]: ['-4', '-4', '-4', '-3', '-3', '2', '2', '3', '3', '3'],
    };

    testRoundTable(values, table);
    testRoundTable(values, table, 0);
  });

  it('round() with table of values - with extra digits', () => {
    const values = ['-4.000', '-3.77', '-3.55', '-3.33', '-3.0000', '2', '2.33', '2.55', '2.77', '3.0'];
    const table: Record<RoundingMode, string[]> = {
      [RoundingMode.TO_POSITIVE]: ['-4', '-3.7', '-3.5', '-3.3', '-3', '2', '2.4', '2.6', '2.8', '3'],
      [RoundingMode.TO_NEGATIVE]: ['-4', '-3.8', '-3.6', '-3.4', '-3', '2', '2.3', '2.5', '2.7', '3'],
      [RoundingMode.TO_ZERO]: ['-4', '-3.7', '-3.5', '-3.3', '-3', '2', '2.3', '2.5', '2.7', '3'],
      [RoundingMode.AWAY_FROM_ZERO]: ['-4', '-3.8', '-3.6', '-3.4', '-3', '2', '2.4', '2.6', '2.8', '3'],
      [RoundingMode.NEAREST_TO_POSITIVE]: ['-4', '-3.8', '-3.5', '-3.3', '-3', '2', '2.3', '2.6', '2.8', '3'],
      [RoundingMode.NEAREST_TO_NEGATIVE]: ['-4', '-3.8', '-3.6', '-3.3', '-3', '2', '2.3', '2.5', '2.8', '3'],
      [RoundingMode.NEAREST_TO_EVEN]: ['-4', '-3.8', '-3.6', '-3.3', '-3', '2', '2.3', '2.6', '2.8', '3'],
      [RoundingMode.NEAREST_TO_ZERO]: ['-4', '-3.8', '-3.5', '-3.3', '-3', '2', '2.3', '2.5', '2.8', '3'],
      [RoundingMode.NEAREST_AWAY_FROM_ZERO]: ['-4', '-3.8', '-3.6', '-3.3', '-3', '2', '2.3', '2.6', '2.8', '3'],
    };

    testRoundTable(values, table, 1);
  });

  it('round() tie or not', () => {
    const run = (a: string, rndMode?: RoundingMode, digits?: number) =>
      new FixedNumber(a).round(rndMode, digits).toFixed(digits ?? 0);

    expect(run('1.400', RoundingMode.NEAREST_TO_POSITIVE)).toBe('1');
    expect(run('1.5', RoundingMode.NEAREST_TO_NEGATIVE)).toBe('1');
    expect(run('1.50', RoundingMode.NEAREST_TO_NEGATIVE)).toBe('1');
    expect(run('1.500', RoundingMode.NEAREST_TO_NEGATIVE)).toBe('1');
    expect(run('-1.500', RoundingMode.NEAREST_TO_POSITIVE)).toBe('-1');
    expect(run('-1.501', RoundingMode.NEAREST_TO_POSITIVE)).toBe('-2');
    expect(run('1.51', RoundingMode.NEAREST_TO_NEGATIVE)).toBe('2');
    expect(run('1.501', RoundingMode.NEAREST_TO_NEGATIVE)).toBe('2');
    expect(run('1.5010', RoundingMode.NEAREST_TO_NEGATIVE)).toBe('2');
  });

  it('round() special cases', () => {
    const run = (a: string, rndMode?: RoundingMode, digits?: number) =>
      new FixedNumber(a).round(rndMode, digits).toFixed(digits ?? 0);

    expect(run('0')).toBe('0');
    expect(run('-0')).toBe('0');
    expect(run('0', RoundingMode.TO_ZERO, 2)).toBe('0.00');
    expect(run('0.1', RoundingMode.TO_ZERO, 2)).toBe('0.10');
    expect(run('0.11', RoundingMode.TO_ZERO, 2)).toBe('0.11');
    expect(run('0.111', RoundingMode.TO_ZERO, 2)).toBe('0.11');
    expect(run('0.111', RoundingMode.TO_POSITIVE, 2)).toBe('0.12');
    expect(run('1', RoundingMode.TO_ZERO, 2)).toBe('1.00');

    expect(run('0.834631259841', RoundingMode.AWAY_FROM_ZERO, 2)).toBe('0.84');
    expect(run('0.640652', RoundingMode.NEAREST_TO_ZERO, 2)).toBe('0.64');
  });

  it('roundToDigits()', () => {
    const run = (a: string, rndMode: RoundingMode, digits: number) =>
      new FixedNumber(a).roundToDigits(rndMode, digits).toString();

    expect(run('0', RoundingMode.TO_ZERO, 2)).toBe('0');
    expect(run('-0', RoundingMode.TO_ZERO, 3)).toBe('0');

    expect(run('-12345', RoundingMode.TO_ZERO, 1)).toBe('-10000');
    expect(run('-12345', RoundingMode.TO_ZERO, 7)).toBe('-12345');

    expect(run('123.45', RoundingMode.TO_ZERO, 1)).toBe('100');
    expect(run('123.45', RoundingMode.TO_ZERO, 3)).toBe('123');
    expect(run('-123.45', RoundingMode.TO_ZERO, 4)).toBe('-123.4');
    expect(run('-123.45', RoundingMode.TO_ZERO, 5)).toBe('-123.45');
    expect(run('123.45', RoundingMode.TO_ZERO, 6)).toBe('123.45');

    expect(run('129.000', RoundingMode.TO_ZERO, 2)).toBe('120');
    expect(run('129.000', RoundingMode.TO_POSITIVE, 2)).toBe('130');
    expect(run('129.000', RoundingMode.TO_ZERO, 6)).toBe('129');

    expect(run('0.0001234', RoundingMode.TO_ZERO, 1)).toBe('0.0001');
    expect(run('-0.0001234', RoundingMode.TO_ZERO, 2)).toBe('-0.00012');

    expect(run('45.452', RoundingMode.NEAREST_AWAY_FROM_ZERO, 1)).toBe('50');
    expect(run('45.452', RoundingMode.NEAREST_AWAY_FROM_ZERO, 2)).toBe('45');
    expect(run('45.452', RoundingMode.NEAREST_AWAY_FROM_ZERO, 3)).toBe('45.5');
    expect(run('45.452', RoundingMode.NEAREST_AWAY_FROM_ZERO, 4)).toBe('45.45');
    expect(run('45.452', RoundingMode.NEAREST_AWAY_FROM_ZERO, 5)).toBe('45.452');
    expect(run('45.452', RoundingMode.NEAREST_AWAY_FROM_ZERO, 6)).toBe('45.452');
  });

  it('sign()', () => {
    const run = (a: string) => new FixedNumber(a).sign();

    expect(run('0')).toBe(1);
    expect(run('-1.234')).toBe(-1);
    expect(run('1.234')).toBe(1);
    expect(run('-.234')).toBe(-1);
    expect(run('.234')).toBe(1);
  });

  it('intPart()', () => {
    const run = (a: string) => new FixedNumber(a).intPart().toString();

    expect(run('0')).toBe('0');
    expect(run('-1.234')).toBe('-1');
    expect(run('1.234')).toBe('1');
    expect(run('-.234')).toBe('0');
    expect(run('.234')).toBe('0');
    expect(run('-1234.567')).toBe('-1234');
    expect(run('12340.26700')).toBe('12340');
  });

  it('fracPart()', () => {
    const run = (a: string) => new FixedNumber(a).fracPart().toString();

    expect(run('0')).toBe('0');
    expect(run('-1.234')).toBe('-0.234');
    expect(run('1.234')).toBe('0.234');
    expect(run('-.234')).toBe('-0.234');
    expect(run('.634')).toBe('0.634');
    expect(run('-1234.005670')).toBe('-0.00567');
    expect(run('12340.26700')).toBe('0.267');
  });

  it('cmp()', () => {
    const run = (a: string, b: string) => new FixedNumber(a).cmp(b);

    expect(run('0', '0')).toBe(0);
    expect(run('0', '-0')).toBe(0);
    expect(run('1', '-1')).toBe(1);
    expect(run('1', '2')).toBe(-1);
    expect(run('123.45', '123.450')).toBe(0);
    expect(run('123.45', '123.456')).toBe(-1);
    expect(run('0.1', '1')).toBe(-1);
    expect(run('0.1000', '0.1')).toBe(0);
  });

  it('eq()', () => {
    const run = (a: string, b: string) => new FixedNumber(a).eq(b);

    expect(run('0', '0')).toBe(true);
    expect(run('0', '-0')).toBe(true);
    expect(run('1', '-1')).toBe(false);
    expect(run('1', '2')).toBe(false);
    expect(run('123.45', '123.450')).toBe(true);
    expect(run('123.45', '123.456')).toBe(false);
    expect(run('0.1', '1')).toBe(false);
    expect(run('0.1000', '0.1')).toBe(true);
  });

  it('lt()', () => {
    const run = (a: string, b: string) => new FixedNumber(a).lt(b);

    expect(run('0', '0')).toBe(false);
    expect(run('-0', '0')).toBe(false);
    expect(run('1', '2')).toBe(true);
    expect(run('2', '1')).toBe(false);
    expect(run('1', '-2')).toBe(false);
    expect(run('-1', '2')).toBe(true);
    expect(run('0.0123', '0.0124000')).toBe(true);
    expect(run('0.0123', '0.0122000')).toBe(false);
    expect(run('0.0123', '0.0123000')).toBe(false);
  });

  it('lte()', () => {
    const run = (a: string, b: string) => new FixedNumber(a).lte(b);

    expect(run('0', '0')).toBe(true);
    expect(run('-0', '0')).toBe(true);
    expect(run('1', '2')).toBe(true);
    expect(run('2', '1')).toBe(false);
    expect(run('0.0123', '0.0124000')).toBe(true);
    expect(run('0.0123', '0.0122000')).toBe(false);
    expect(run('0.0123', '0.0123000')).toBe(true);
  });

  it('gt()', () => {
    const run = (a: string, b: string) => new FixedNumber(a).gt(b);

    expect(run('0', '0')).toBe(false);
    expect(run('-0', '0')).toBe(false);
    expect(run('1', '2')).toBe(false);
    expect(run('2', '1')).toBe(true);
    expect(run('1', '-2')).toBe(true);
    expect(run('-1', '2')).toBe(false);
    expect(run('0.0123', '0.0124000')).toBe(false);
    expect(run('0.0123', '0.0122000')).toBe(true);
    expect(run('0.0123', '0.0123000')).toBe(false);
  });

  it('gte()', () => {
    const run = (a: string, b: string) => new FixedNumber(a).gte(b);

    expect(run('0', '0')).toBe(true);
    expect(run('-0', '0')).toBe(true);
    expect(run('1', '2')).toBe(false);
    expect(run('2', '1')).toBe(true);
    expect(run('0.0123', '0.0124000')).toBe(false);
    expect(run('0.0123', '0.0122000')).toBe(true);
    expect(run('0.0123', '0.0123000')).toBe(true);
  });

  it('getFractionParts()', () => {
    const run = (a: ExactNumberParameter, normalize?: boolean) => {
      const res = new FixedNumber(a).getFractionParts(normalize);
      return { numerator: res.numerator.toString(), denominator: res.denominator.toString() };
    };

    expect(run('2')).toStrictEqual({ numerator: '2', denominator: '1' });
    expect(run('0')).toStrictEqual({ numerator: '0', denominator: '1' });
    expect(run('-5')).toStrictEqual({ numerator: '-5', denominator: '1' });
    expect(run('0.4')).toStrictEqual({ numerator: '2', denominator: '5' }); // test normalization (4 / 10 = 2 / 5)
    expect(run('-0.4')).toStrictEqual({ numerator: '-2', denominator: '5' });

    expect(run('0.4', true)).toStrictEqual({ numerator: '2', denominator: '5' });
    expect(run('0.4', false)).toStrictEqual({ numerator: '4', denominator: '10' });
  });

  it('clamp()', () => {
    const run = (a: ExactNumberParameter, min: ExactNumberParameter, max: ExactNumberParameter) =>
      new FixedNumber(a).clamp(min, max).toString();

    expect(run('2', 1, 3n)).toBe('2');
    expect(() => run('2', '3', 1)).toThrow('Min parameter has to be smaller than max');
    expect(run('2', 3, 3)).toBe('3');
    expect(run('2', 3, 5)).toBe('3');
    expect(run('2.6', '2.4', '2.5')).toBe('2.5');
    expect(run('2.6', '2.4', '3.5')).toBe('2.6');
    expect(run('-2.6', '-2.5', '-1')).toBe('-2.5');
  });

  it('isZero()', () => {
    const run = (a: string) => new FixedNumber(a).isZero();

    expect(run('0.0000')).toBe(true);
    expect(run('0')).toBe(true);
    expect(run('-0')).toBe(true);
    expect(run('-0.01')).toBe(false);
    expect(run('0.01')).toBe(false);
    expect(run('-123')).toBe(false);
    expect(run('123.000')).toBe(false);
  });

  it('isOne()', () => {
    const run = (a: string) => new FixedNumber(a).isOne();

    expect(run('1.0000')).toBe(true);
    expect(run('1')).toBe(true);
    expect(run('-1.0000')).toBe(false);
    expect(run('1.0001')).toBe(false);
    expect(run('-1.0001')).toBe(false);
    expect(run('0.99')).toBe(false);
    expect(run('-0.99')).toBe(false);
    expect(run('-1')).toBe(false);
    expect(run('0')).toBe(false);
    expect(run('-0.01')).toBe(false);
    expect(run('0.01')).toBe(false);
    expect(run('-123')).toBe(false);
    expect(run('123.000')).toBe(false);
  });

  it('isInteger()', () => {
    const run = (a: string) => new FixedNumber(a).isInteger();

    expect(run('0')).toBe(true);
    expect(run('1')).toBe(true);
    expect(run('1.0000')).toBe(true);
    expect(run('-123')).toBe(true);
    expect(run('-123.0000')).toBe(true);
    expect(run('-123.00001')).toBe(false);
    expect(run('123.00001')).toBe(false);
    expect(run('.5')).toBe(false);
    expect(run('-.1')).toBe(false);
  });

  it('toString() with radix', () => {
    const run = (a: string, radix: number) => new FixedNumber(a).toString(radix);

    expect(run('0', 2)).toBe('0');
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
  });

  it('toString() with radix + maxDigits', () => {
    const run = (a: string, radix: number, maxDigits: number) => new FixedNumber(a).toString(radix, maxDigits);

    expect(run('0', 2, 0)).toBe('0');
    expect(run('-0', 2, 10)).toBe('0');
    expect(run('16.000', 2, 0)).toBe('10000');
    expect(run('0.125', 2, 0)).toBe('0');
    expect(run('0.125', 2, 2)).toBe('0.00');
    expect(run('0.125', 2, 3)).toBe('0.001');
    expect(run('0.125', 2, 4)).toBe('0.001');
    expect(run('0.5', 3, 0)).toBe('0');
    expect(run('0.5', 3, 1)).toBe('0.(1)');
    expect(run('-123.500', 10, 2)).toBe('-123.5');
    expect(run('-123.4567', 10, 2)).toBe('-123.45');
    expect(run('0.4', 3, 3)).toBe('0.101');
    expect(run('0.4', 3, 4)).toBe('0.(1012)');
    expect(run('-15.012', 6, 0)).toBe('-23');
    expect(run('-15.012', 6, 1)).toBe('-23.0');
    expect(run('-15.012', 6, 6)).toBe('-23.002331');
    expect(run('-15.012', 6, 100)).toBe('-23.0(0233151220401052455413443)');
  });

  it('toNumber()', () => {
    const run = (a: string) => new FixedNumber(a).toNumber();

    expect(run('0')).toBe(0);
    expect(run('-0')).toBe(0);
    expect(run('-1')).toBe(-1);
    expect(run('-1.00000')).toBe(-1);
    expect(run('-1.5')).toBe(-1.5);
    expect(run('.023456')).toBe(0.023456);
    expect(run(Number.MAX_VALUE.toString())).toBe(Number.MAX_VALUE);
    expect(new FixedNumber(Number.MAX_VALUE.toString()).mul(2).toNumber()).toBe(Infinity);
  });

  it('toExponential()', () => {
    const run = (a: string, digits: number) => new FixedNumber(a).toExponential(digits);

    expect(run('0', 0)).toBe('0e+0');
    expect(run('-0', 0)).toBe('0e+0');
    expect(run('0', 5)).toBe('0.00000e+0');
    expect(run('123', 0)).toBe('1e+2');
    expect(run('123', 1)).toBe('1.2e+2');
    expect(run('123', 2)).toBe('1.23e+2');
    expect(run('123', 3)).toBe('1.230e+2');
    expect(run('1234', 4)).toBe('1.2340e+3');
    expect(run('123.456', 0)).toBe('1e+2');
    expect(run('123.45600', 0)).toBe('1e+2');
    expect(run('123.45600', 2)).toBe('1.23e+2');
    expect(run('123.45600', 5)).toBe('1.23456e+2');
    expect(run('123.456', 10)).toBe('1.2345600000e+2');
    expect(run('-123.456', 3)).toBe('-1.234e+2');
    expect(run('10.0300', 0)).toBe('1e+1');
    expect(run('-10.0300', 1)).toBe('-1.0e+1');
    expect(run('-10.0300', 2)).toBe('-1.00e+1');
    expect(run('10.0300', 3)).toBe('1.003e+1');
    expect(run('10.0300', 6)).toBe('1.003000e+1');

    expect(run('.123', 0)).toBe('1e-1');
    expect(run('.0123', 0)).toBe('1e-2');
    expect(run('.0123', 1)).toBe('1.2e-2');
    expect(run('-.0123', 3)).toBe('-1.230e-2');
  });

  it('toFixed()', () => {
    const run = (x: string, digits: number) => new FixedNumber(x).toFixed(digits);

    expect(run('0', 0)).toBe('0');
    expect(run('0', 1)).toBe('0.0');
    expect(run('2', 3)).toBe('2.000');
    expect(run('-123', 2)).toBe('-123.00');
    expect(run('0.45600', 0)).toBe('0');
    expect(run('0.45600', 1)).toBe('0.4');
    expect(run('0.45600', 2)).toBe('0.45');
    expect(run('0.45600', 6)).toBe('0.456000');
    expect(run('-123.45600', 0)).toBe('-123');
    expect(run('-123.45600', 1)).toBe('-123.4');
    expect(run('-123.45600', 6)).toBe('-123.456000');
  });

  it('toString()', () => {
    const run = (x: string) => new FixedNumber(x).toString();

    expect(run('0')).toBe('0');
    expect(run('-0')).toBe('0');
    expect(run('2')).toBe('2');
    expect(run('  123 ')).toBe('123');
    expect(run('  -123 ')).toBe('-123');
    expect(run('123456789')).toBe('123456789');
    expect(run('123456789123456789')).toBe('123456789123456789');
    expect(run('0.0')).toBe('0');
    expect(run('.0')).toBe('0');
    expect(run('.01')).toBe('0.01');
    expect(run('.01000')).toBe('0.01');
    expect(run('-.1')).toBe('-0.1');
    expect(run('-.1234')).toBe('-0.1234');
    expect(run(' 0.45600 ')).toBe('0.456');
    expect(run(' -123.45600 ')).toBe('-123.456');
    expect(run('00.0010')).toBe('0.001');
    expect(run('-00.0010')).toBe('-0.001');
  });
});
