/* eslint-disable no-console */
import { ExactNumberType } from 'src';
import { sin, cos, tan, sqrt, cbrt } from '../src/approx';

function run(name: string, fn: (digits: number) => ExactNumberType) {
  const max = 5000;
  const ref = fn(max).toString();

  console.time(name);
  for (let i = 1; i < max; i++) {
    console.log(i);
    const a = fn(i);
    const b = ref.slice(0, i + (ref.startsWith('-') ? 3 : 2));
    if (a.eq(b)) {
      console.log(a);
      console.log(b);
      throw new Error(`Mismatch at ${i}!`);
    }
  }
  console.timeEnd(name);
}

run('sqrt', digits => sqrt('0.00000000249999999000000001', digits));
