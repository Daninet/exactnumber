import { FixedNumber } from './FixedNumber';
import { Fraction } from './Fraction';

describe('Bitwise operations', () => {
  const bitStrOp = (a: string, b: string, fn: (a: number, b: number) => number) => {
    const res = [] as string[];
    for (let i = Math.max(a.length, b.length); i > 0; i--) {
      const fnRes = fn(a.charAt(a.length - i) === '1' ? 1 : 0, b.charAt(b.length - i) === '1' ? 1 : 0);
      res.push(fnRes ? '1' : '0');
    }
    return res.join('');
  };

  it('bitwiseAnd()', () => {
    const run = (a: string | bigint, b: string | bigint) => new FixedNumber(a).bitwiseAnd(b).toString();

    expect(run('3', '0')).toBe('0');
    expect(run('0', '3')).toBe('0');
    expect(run('3', '3')).toBe('3');
    expect(run('3', '1')).toBe('1');

    expect(run(0b1100n, 0b0101n)).toBe('4');

    const bitStrAnd = (a: string, b: string) => bitStrOp(a, b, (x, y) => x & y);

    const bitsStr = '11000111'.repeat(30);
    const bits = BigInt(`0b${bitsStr}`);

    for (let i = 1; i < bitsStr.length; i++) {
      const b = bitsStr.slice(0, -i);
      const bNum = BigInt(`0b${b}`);
      const ref = BigInt(`0b${bitStrAnd(bitsStr, b)}`).toString();
      expect(run(bits, bNum)).toBe(ref);
      expect(run(bNum, bits)).toBe(ref);
    }
  });

  it('bitwiseOr()', () => {
    const run = (a: string | bigint, b: string | bigint) => new FixedNumber(a).bitwiseOr(b).toString();

    expect(run('3', '0')).toBe('3');
    expect(run('0', '3')).toBe('3');
    expect(run('3', '3')).toBe('3');
    expect(run('3', '1')).toBe('3');

    expect(run(0b1100n, 0b0101n)).toBe('13');

    const bitStrOr = (a: string, b: string) => bitStrOp(a, b, (x, y) => x | y);

    const bitsStr = '11000111'.repeat(30);
    const bits = BigInt(`0b${bitsStr}`);

    for (let i = 1; i < bitsStr.length; i++) {
      const b = bitsStr.slice(0, -i);
      const bNum = BigInt(`0b${b}`);
      const ref = BigInt(`0b${bitStrOr(bitsStr, b)}`).toString();
      expect(run(bits, bNum)).toBe(ref);
      expect(run(bNum, bits)).toBe(ref);
    }
  });

  it('bitwiseXor()', () => {
    const run = (a: string | bigint, b: string | bigint) => new FixedNumber(a).bitwiseXor(b).toString();

    expect(run('3', '0')).toBe('3');
    expect(run('0', '3')).toBe('3');
    expect(run('3', '3')).toBe('0');
    expect(run('3', '1')).toBe('2');

    expect(run(0b1100n, 0b0101n)).toBe('9');

    const bitStrXor = (a: string, b: string) => bitStrOp(a, b, (x, y) => x ^ y);

    const bitsStr = '11000111'.repeat(30);
    const bits = BigInt(`0b${bitsStr}`);

    for (let i = 1; i < bitsStr.length; i++) {
      const b = bitsStr.slice(0, -i);
      const bNum = BigInt(`0b${b}`);
      const ref = BigInt(`0b${bitStrXor(bitsStr, b)}`).toString();
      expect(run(bits, bNum)).toBe(ref);
      expect(run(bNum, bits)).toBe(ref);
    }
  });

  it('shiftLeft()', () => {
    const run = (a: string, count: number) => new FixedNumber(a).shiftLeft(count).toString();

    expect(run('9', 0)).toBe('9');
    expect(run('0', 1)).toBe('0');

    for (let i = 0; i < 100; i++) {
      expect(run('1', i)).toBe((2n ** BigInt(i)).toString());
    }

    for (let i = 0; i < 100; i++) {
      expect(run('7', i)).toBe(BigInt(`0b111${'0'.repeat(i)}`).toString());
    }
  });

  it('shiftRight()', () => {
    const run = (a: string | bigint, count: number) => new FixedNumber(a).shiftRight(count).toString();

    expect(run('9', 0)).toBe('9');
    expect(run('0', 1)).toBe('0');
    expect(run('9', 1)).toBe('4');
    expect(run('9', 2)).toBe('2');

    const bitsStr = '11000111'.repeat(30);
    const num = BigInt(`0b${bitsStr}`);
    for (let i = 1; i < 100; i++) {
      const shiftedInt = BigInt(`0b${bitsStr.slice(0, -i)}`);
      expect(run(num, i)).toBe(shiftedInt.toString());
    }
  });

  it('shift invalid types', () => {
    const fns = ['shiftLeft', 'shiftRight'];
    const values = ['1', 1n, -1];
    fns.forEach(fn => {
      values.forEach(val => {
        expect(() => new FixedNumber(1)[fn](val)).toThrow('Invalid value for bitCount');
        expect(() => new Fraction(1n, 1n)[fn](val)).toThrow('Invalid value for bitCount');
      });
    });
  });

  it('invalid types', () => {
    const fns = ['bitwiseAnd', 'bitwiseOr', 'bitwiseXor', 'shiftLeft', 'shiftRight'];
    fns.forEach(fn => {
      expect(() => new FixedNumber('1.1')[fn](1)).toThrow('Only positive integers are supported');
      expect(() => new FixedNumber('-2')[fn](1)).toThrow('Only positive integers are supported');
      expect(() => new Fraction('1.1', 1n)[fn](1)).toThrow('Only positive integers are supported');
      expect(() => new Fraction('-2', 1n)[fn](1)).toThrow('Only positive integers are supported');
      expect(() => new Fraction('8/7', 1n)[fn](1)).toThrow('Only positive integers are supported');
    });
  });
});
