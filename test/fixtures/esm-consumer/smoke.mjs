// Loads the packed tarball's ESM entry and runs a hook end to end.
import assert from 'node:assert/strict';
import * as Surrogate from 'surrogate';

assert.ok(!('default' in Surrogate), 'the ESM entry has no default export');

const calls = [];
const target = Surrogate.wrapSurrogate({
  run() {
    calls.push('run');
  },
});

target.getSurrogate().registerPreHook('run', () => calls.push('pre'), { useNext: false });
target.run();

assert.deepEqual(calls, ['pre', 'run']);
console.log(`esm-consumer: ok (${Object.keys(Surrogate).length} exports)`);
