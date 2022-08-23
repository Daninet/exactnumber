const { approx } = require('../dist/index.umd');

function run() {
  for (let i = 0; i < 10; i++) {
    approx.log(3, 500);
  }
}

console.time('run');
run();
console.timeEnd('run');
