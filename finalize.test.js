const assert = require('assert').strict;
const finalize = require('./finalize');

test('finalize > 0 items', () => {
  assert.deepEqual(finalize([]), {
    redirects: [],
  });
});

test('finalize > 1 item', () => {
  assert.deepEqual(finalize([{ status: 200 }]), {
    status: 200,
    redirects: [],
  });
});

test('finalize > 2 items', () => {
  assert.deepEqual(finalize([{ status: 301 }, { status: 200 }]), {
    status: 200,
    redirects: [{ status: 301 }],
  });
});

test('finalize > 3 items', () => {
  assert.deepEqual(
    finalize([{ status: 301 }, { status: 302 }, { status: 404 }]),
    {
      status: 404,
      redirects: [{ status: 301 }, { status: 302 }],
    }
  );
});
