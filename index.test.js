const { test } = require('node:test');
const assert = require('assert').strict;
const { split, finalize, parse } = require('./index');

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
