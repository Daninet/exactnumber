import { ExactNumber } from './ExactNumber';

describe('ExactNumber interface', () => {
  it('parses fixed numbers', () => {
    expect(ExactNumber(123n).toString()).toBe('123');
    expect(ExactNumber(-123n).toString()).toBe('-123');
    expect(ExactNumber(123).toString()).toBe('123');
    expect(ExactNumber(-123).toString()).toBe('-123');
    expect(ExactNumber('0').toString()).toBe('0');
    expect(ExactNumber('123').toString()).toBe('123');
    expect(ExactNumber('-123.4500').toString()).toBe('-123.45');
    expect(ExactNumber(ExactNumber('-123.4500')).toString()).toBe('-123.45');
    expect(ExactNumber(ExactNumber('-2/1')).toString()).toBe('-2');
  });

  it('allows chaining', () => {
    expect(ExactNumber(ExactNumber('-15.6')).toString()).toBe('-15.6');
    expect(ExactNumber(ExactNumber('1/7')).toString()).toBe('0.(142857)');
  });

  it('parses fractions', () => {
    expect(ExactNumber('2/1').toString()).toBe('2');
    expect(ExactNumber('1/2').toString()).toBe('0.5');
    expect(ExactNumber('-1/7').toString()).toBe('-0.(142857)');
    expect(ExactNumber('-1', 7).toString()).toBe('-0.(142857)');
    expect(ExactNumber('-1', '-7').toString()).toBe('0.(142857)');
    expect(ExactNumber('2.(142857)').toFraction()).toBe('15/7');
    expect(ExactNumber('-3/11', '1/7').toString()).toBe('-1.(90)');
    expect(ExactNumber('0.21', '0.79').toString()).toBe('0.(2658227848101)');
  });

  it('fails with invalid types', () => {
    const invalidParameters = [null, false, true, {}, [], /[1]/];
    for (const param of invalidParameters) {
      expect(() => ExactNumber(param as any)).toThrow('Unsupported parameter type');
      expect(() => ExactNumber(1n, param as any)).toThrow('Unsupported parameter type');
    }

    expect(() => (ExactNumber as any)()).toThrow('First parameter cannot be undefined');
    expect(() => (ExactNumber as any)(undefined)).toThrow('First parameter cannot be undefined');

    expect(() => ExactNumber('')).toThrow('Empty string is not allowed');
    expect(() => ExactNumber(' \n      ')).toThrow('Empty string is not allowed');
    expect(() => ExactNumber(1.5)).toThrow(
      'Floating point values as numbers are unsafe. Please provide them as a string.',
    );

    // eslint-disable-next-line @typescript-eslint/no-loss-of-precision
    expect(() => ExactNumber(123123123123123123123)).toThrow(
      'Floating point values as numbers are unsafe. Please provide them as a string.',
    );
  });

  it('it does not allow implicit number conversion', () => {
    expect(() => (ExactNumber(3) as any) + 1).toThrow('Unsafe conversion to Number type! Use toNumber() instead.');
    expect(() => 1 + (ExactNumber(3) as any)).toThrow('Unsafe conversion to Number type! Use toNumber() instead.');
    expect(() => (ExactNumber('1/7') as any) + 1).toThrow('Unsafe conversion to Number type! Use toNumber() instead.');
    expect(() => 1 + (ExactNumber('1/7') as any)).toThrow('Unsafe conversion to Number type! Use toNumber() instead.');
    expect(() => (ExactNumber(3) as any) + (ExactNumber(4) as any)).toThrow(
      'Unsafe conversion to Number type! Use toNumber() instead.',
    );
  });

  it('min()', () => {
    expect(() => ExactNumber.min().toString()).toThrow('Got empty array');
    expect(() => ExactNumber.min('x').toString()).toThrow('Cannot parse number "x"');
    expect(() => ExactNumber.min([1] as any).toString()).toThrow('Unsupported parameter type');

    expect(ExactNumber.min(5, -2, -3, 6).toString()).toBe('-3');
    expect(ExactNumber.min('0.000', '1.2', '2/5').toString()).toBe('0');
    expect(ExactNumber.min('0.000', '-0.0001', '1.2', '2/5').toString()).toBe('-0.0001');
    expect(ExactNumber.min('-1/5', '2/6', '-2/10', '-2/11').toString()).toBe('-0.2');
    expect(ExactNumber.min('12').toString()).toBe('12');
  });

  it('max()', () => {
    expect(() => ExactNumber.max().toString()).toThrow('Got empty array');
    expect(() => ExactNumber.max('x').toString()).toThrow('Cannot parse number "x"');
    expect(() => ExactNumber.max([1] as any).toString()).toThrow('Unsupported parameter type');

    expect(ExactNumber.max(5, -2, -7, 6).toString()).toBe('6');
    expect(ExactNumber.max('0.000', '0.2', '2/5').toString()).toBe('0.4');
    expect(ExactNumber.max('0.000', '-0.0001', '0.2', '2/5').toString()).toBe('0.4');
    expect(ExactNumber.max('-1/5', '2/6', '-2/10', '-2/11').toString()).toBe('0.(3)');
    expect(ExactNumber.max('12').toString()).toBe('12');
  });

  it('fromBase()', () => {
    expect(ExactNumber.fromBase('0', 2).toString()).toBe('0');
    expect(ExactNumber.fromBase('0101', 2).toString()).toBe('5');
    expect(ExactNumber.fromBase('.1', 2).toString()).toBe('0.5');
    expect(ExactNumber.fromBase('-.1', 2).toString()).toBe('-0.5');
    expect(ExactNumber.fromBase('101.00', 2).toString()).toBe('5');
    expect(ExactNumber.fromBase('101.0101', 2).toString()).toBe('5.3125');
    expect(ExactNumber.fromBase('102.21', 3).toString()).toBe('11.(7)');
    expect(ExactNumber.fromBase('-104.4(10)', 5).toString()).toBe('-29.841(6)');
    expect(ExactNumber.fromBase('-104.4(10)', 10).toString()).toBe('-104.4(10)');
    expect(ExactNumber.fromBase('159.9(EB851)', 16).toString()).toBe('345.62');

    expect(ExactNumber.fromBase('.0(2)', 5).toString()).toBe('0.1');

    const nums = ['0', '-0.02', '123.457(13)', '-5.(1)', '-0.0(1)'];
    nums.forEach(num => {
      for (let base = 2; base <= 16; base++) {
        const inBase = ExactNumber(num).toString(base);
        expect(ExactNumber.fromBase(inBase, base).toString()).toBe(num);
      }
    });
  });

  it('fromBase() invalid digits', () => {
    expect(() => ExactNumber.fromBase('2', 2)).toThrow('Invalid digit "2"');
    expect(() => ExactNumber.fromBase('3', 3)).toThrow('Invalid digit "3"');
    expect(() => ExactNumber.fromBase('b', 11)).toThrow('Invalid digit "b"');
  });

  it('fromBase() invalid parameters', () => {
    expect(() => ExactNumber.fromBase(1 as any, 4)).toThrow('First parameter must be string');
    expect(() => ExactNumber.fromBase(1n as any, 4)).toThrow('First parameter must be string');

    expect(() => ExactNumber.fromBase('1', '1' as any)).toThrow('Invalid radix');
    expect(() => ExactNumber.fromBase('1', 17)).toThrow('Invalid radix');
    expect(() => ExactNumber.fromBase('1', 1)).toThrow('Invalid radix');
    expect(() => ExactNumber.fromBase('1', -1)).toThrow('Invalid radix');
    expect(() => ExactNumber.fromBase('1', Number.MAX_SAFE_INTEGER * 2)).toThrow('Invalid radix');

    expect(() => ExactNumber.fromBase('', 2)).toThrow('Empty string is not allowed');

    expect(() => ExactNumber.fromBase('1x5', 9)).toThrow('Cannot parse number "1x5"');
  });

  it('gcd()', () => {
    expect(ExactNumber.gcd(12, -8).toString()).toBe('4');
    expect(ExactNumber.gcd(8, -12).toString()).toBe('4');
    expect(ExactNumber.gcd('0.8', '0.12').toString()).toBe('0.04');
    expect(ExactNumber.gcd('0', '0.12').toString()).toBe('0.12');
  });

  it('lcm()', () => {
    expect(ExactNumber.lcm(12, -8).toString()).toBe('24');
    expect(ExactNumber.lcm(8, -12).toString()).toBe('24');
    expect(ExactNumber.lcm('-0.8', '-0.12').toString()).toBe('2.4');
    expect(ExactNumber.lcm('0.1', '0.12').toString()).toBe('0.6');
  });
});
