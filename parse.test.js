const assert = require('assert');
const parse = require('./parse');

module.exports = (test) => {
  test(`response with status, headers, body`, () => {
    const input = [
      'HTTP/2 200 OK',
      'Server: dummy',
      'x-fake-response: 42',
      '',
      '{"foo":"bar"}',
    ];
    const actual = parse(input);

    const expected = {
      protocol: 'HTTP/2',
      status: 200,
      statusText: 'OK',
      headers: {
        server: 'dummy',
        'x-fake-response': '42',
      },
      body: { foo: 'bar' },
    };

    assert.deepEqual(actual, expected);
  });
};
