const { test } = require('node:test');
const assert = require('assert').strict;
const parse = require('./parse');

test(`parse > response with status, headers, body if body is json`, () => {
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

test(`parse > response with status, headers, body if body is text`, () => {
  const input = [
    'HTTP/2 200 OK',
    'Server: dummy',
    'x-fake-response: 42',
    '',
    'no json, just text',
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
    body: 'no json, just text',
  };

  assert.deepEqual(actual, expected);
});

test(`parse > response with status, headers, body if body is not sent`, () => {
  const input = ['HTTP/2 200 OK', 'Server: dummy', 'x-fake-response: 42'];
  const actual = parse(input);

  const expected = {
    protocol: 'HTTP/2',
    status: 200,
    statusText: 'OK',
    headers: {
      server: 'dummy',
      'x-fake-response': '42',
    },
    body: null,
  };

  assert.deepEqual(actual, expected);
});
