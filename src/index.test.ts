import * as API from '.';

describe('API', () => {
  it('Export all APIs', () => {
    expect(Object.keys(API)).toStrictEqual([
      'ExactNumber',
      'RoundingMode',
      'ModType',
      // 'nthroot',
      // 'sqrt',
      // 'cbrt',
      // 'pow',
      // 'exp',
      // 'log',
      // 'logn',
      // 'log10',
      // 'log2',
      // 'PI',
      // 'sin',
      // 'cos',
      // 'tan',
      // 'asin',
      // 'acos',
      // 'atan',
      // 'sinh',
      // 'cosh',
      // 'tanh',
      // 'asinh',
      // 'acosh',
      // 'atanh',
    ]);
    expect(API.ExactNumber(12).toString()).toBe('12');
  });
});
