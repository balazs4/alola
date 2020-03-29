const split = require('./split');
const { test } = require('zora');

test(__filename, ({ test }) => {
  test('1 response without body (aka headers only)', t => {
    const input = [
      'HTTP/2 200 OK',
      'Server: dummy',
      'Content-Type: application/json',
      'x-fake-response: 42',
      ''
    ];

    const expected = [
      [
        'HTTP/2 200 OK',
        'Server: dummy',
        'Content-Type: application/json',
        'x-fake-response: 42'
      ]
    ];

    const actual = split(input);
    t.equal(actual, expected);
  });

  test('1 response with body', t => {
    const input = [
      'HTTP/2 200 OK',
      'Server: dummy',
      'Content-Type: application/json',
      'x-fake-response: 42',
      '',
      '{"foo": "bar"}'
    ];

    const expected = [
      [
        'HTTP/2 200 OK',
        'Server: dummy',
        'Content-Type: application/json',
        'x-fake-response: 42',
        '',
        '{"foo": "bar"}'
      ]
    ];

    const actual = split(input);
    t.equal(actual, expected);
  });

  test('2 responses with body', t => {
    const input = [
      'HTTP/1.1 301',
      'Location: http://newurl.com/',
      '',
      'HTTP/2 200 OK',
      'Server: dummy',
      'Content-Type: application/json',
      'x-fake-response: 42',
      '',
      '{"foo": "bar"}'
    ];

    const expected = [
      ['HTTP/1.1 301', 'Location: http://newurl.com/'],
      [
        'HTTP/2 200 OK',
        'Server: dummy',
        'Content-Type: application/json',
        'x-fake-response: 42',
        '',
        '{"foo": "bar"}'
      ]
    ];

    const actual = split(input);
    t.equal(actual, expected);
  });

  test('3 responses with body', t => {
    const input = [
      'HTTP/1.1 301',
      'Location: http://newurl.com/',
      '',
      'HTTP/2 301',
      'Location: https://newurl.com/',
      '',
      'HTTP/2 200 OK',
      'Server: dummy',
      'Content-Type: application/json',
      'x-fake-response: 42',
      '',
      '{"foo": "bar"}'
    ];

    const expected = [
      ['HTTP/1.1 301', 'Location: http://newurl.com/'],
      ['HTTP/2 301', 'Location: https://newurl.com/'],
      [
        'HTTP/2 200 OK',
        'Server: dummy',
        'Content-Type: application/json',
        'x-fake-response: 42',
        '',
        '{"foo": "bar"}'
      ]
    ];

    const actual = split(input);
    t.equal(actual, expected);
  });
});
