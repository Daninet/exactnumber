import { trimTrailingZeros } from './util';

describe('Util functions', () => {
  it('trimTrailingZeros()', () => {
    expect(trimTrailingZeros('0')).toBe('0');
    expect(trimTrailingZeros('-0')).toBe('-0');
    expect(trimTrailingZeros('00000')).toBe('00000');
    expect(trimTrailingZeros('0.0000')).toBe('0');
    expect(trimTrailingZeros('.0000')).toBe('0');
    expect(trimTrailingZeros('.0001')).toBe('.0001');
    expect(trimTrailingZeros('-.00010')).toBe('-.0001');
    expect(trimTrailingZeros('-123.0000')).toBe('-123');
    expect(trimTrailingZeros('-123.002')).toBe('-123.002');
    expect(trimTrailingZeros('-123.0020')).toBe('-123.002');
    expect(trimTrailingZeros('100.00')).toBe('100');
    expect(trimTrailingZeros('1231.')).toBe('1231');
    expect(trimTrailingZeros('1230.0')).toBe('1230');
    expect(trimTrailingZeros('1230.2304')).toBe('1230.2304');
    expect(trimTrailingZeros('001230.0')).toBe('001230');
    expect(trimTrailingZeros('-001230.01')).toBe('-001230.01');
    expect(trimTrailingZeros('001230.010')).toBe('001230.01');
    expect(trimTrailingZeros('001230.01000000')).toBe('001230.01');
  });
});
