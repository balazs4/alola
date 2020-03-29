const { test } = require('zora');
const finalize = require('./finalize');

test(__filename, ({ test }) => {
  test('0 items', t => {
    t.equal(finalize([]), {
      redirects: []
    });
  });

  test('1 item', t => {
    t.equal(finalize([{ status: 200 }]), {
      status: 200,
      redirects: []
    });
  });

  test('2 items', t => {
    t.equal(finalize([{ status: 301 }, { status: 200 }]), {
      status: 200,
      redirects: [{ status: 301 }]
    });
  });

  test('3 items', t => {
    t.equal(finalize([{ status: 301 }, { status: 302 }, { status: 404 }]), {
      status: 404,
      redirects: [{ status: 301 }, { status: 302 }]
    });
  });
});
