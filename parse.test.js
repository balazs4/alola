const { test } = require('zora');
const parse = require('./parse');

test(__filename, ({ test }) => {
  test(`response with status, headers, body`, t => {
    const input = [
      'HTTP/2 200 OK',
      'Server: dummy',
      'x-fake-response: 42',
      '',
      '{"foo":"bar"}'
    ];
    const actual = parse(input);

    const expected = {
      protocol: 'HTTP/2',
      status: 200,
      statusText: 'OK',
      headers: {
        server: 'dummy',
        'x-fake-response': '42'
      },
      body: { foo: 'bar' }
    };

    t.equal(actual, expected);
  });
});
