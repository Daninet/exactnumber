import { trimTrailingZerosFromFixed } from './util';

describe('Util functions', () => {
  it('trimTrailingZerosFromFixed()', () => {
    expect(trimTrailingZerosFromFixed('0')).toBe('0');
    expect(trimTrailingZerosFromFixed('-0')).toBe('-0');
    expect(trimTrailingZerosFromFixed('00000')).toBe('00000');
    expect(trimTrailingZerosFromFixed('0.0000')).toBe('0');
    expect(trimTrailingZerosFromFixed('.0000')).toBe('0');
    expect(trimTrailingZerosFromFixed('.0001')).toBe('.0001');
    expect(trimTrailingZerosFromFixed('-.00010')).toBe('-.0001');
    expect(trimTrailingZerosFromFixed('-123.0000')).toBe('-123');
    expect(trimTrailingZerosFromFixed('-123.002')).toBe('-123.002');
    expect(trimTrailingZerosFromFixed('-123.0020')).toBe('-123.002');
    expect(trimTrailingZerosFromFixed('100.00')).toBe('100');
    expect(trimTrailingZerosFromFixed('1231.')).toBe('1231');
    expect(trimTrailingZerosFromFixed('1230.0')).toBe('1230');
    expect(trimTrailingZerosFromFixed('1230.2304')).toBe('1230.2304');
    expect(trimTrailingZerosFromFixed('001230.0')).toBe('001230');
    expect(trimTrailingZerosFromFixed('-001230.01')).toBe('-001230.01');
    expect(trimTrailingZerosFromFixed('001230.010')).toBe('001230.01');
    expect(trimTrailingZerosFromFixed('001230.01000000')).toBe('001230.01');
  });
});
