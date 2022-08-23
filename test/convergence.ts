/* eslint-disable no-console */
import { sin, cos, tan, sqrt, cbrt } from '../src/approx';

function run(name: string, fn: (digits: number) => string) {
  const max = 5000;
  const ref = fn(max);

  console.time(name);
  for (let i = 1; i < max; i++) {
    console.log(i);
    const a = fn(i);
    const b = ref.slice(0, i + (ref.startsWith('-') ? 3 : 2));
    if (a !== b) {
      console.log(a);
      console.log(b);
      throw new Error(`Mismatch at ${i}!`);
    }
  }
  console.timeEnd(name);
}

run('sqrt', digits => sqrt('0.00000000249999999000000001', digits));
