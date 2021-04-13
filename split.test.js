const assert = require('assert').strict;
const split = require('./split');

test('split > 1 response without body (aka headers only)', () => {
  const input = [
    'HTTP/2 200 OK',
    'Server: dummy',
    'Content-Type: application/json',
    'x-fake-response: 42',
    '',
  ];

  const expected = [
    [
      'HTTP/2 200 OK',
      'Server: dummy',
      'Content-Type: application/json',
      'x-fake-response: 42',
    ],
  ];

  const actual = split(input);
  assert.deepEqual(actual, expected);
});

test('split > 1 response with body', () => {
  const input = [
    'HTTP/2 200 OK',
    'Server: dummy',
    'Content-Type: application/json',
    'x-fake-response: 42',
    '',
    '{"foo": "bar"}',
  ];

  const expected = [
    [
      'HTTP/2 200 OK',
      'Server: dummy',
      'Content-Type: application/json',
      'x-fake-response: 42',
      '',
      '{"foo": "bar"}',
    ],
  ];

  const actual = split(input);
  assert.deepEqual(actual, expected);
});

test('split > 2 responses with body', () => {
  const input = [
    'HTTP/1.1 301',
    'Location: http://newurl.com/',
    '',
    'HTTP/2 200 OK',
    'Server: dummy',
    'Content-Type: application/json',
    'x-fake-response: 42',
    '',
    '{"foo": "bar"}',
  ];

  const expected = [
    ['HTTP/1.1 301', 'Location: http://newurl.com/'],
    [
      'HTTP/2 200 OK',
      'Server: dummy',
      'Content-Type: application/json',
      'x-fake-response: 42',
      '',
      '{"foo": "bar"}',
    ],
  ];

  const actual = split(input);
  assert.deepEqual(actual, expected);
});

test('split > 3 responses with body', () => {
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
    '{"foo": "bar"}',
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
      '{"foo": "bar"}',
    ],
  ];

  const actual = split(input);
  assert.deepEqual(actual, expected);
});
