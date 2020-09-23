'use strict';

const path = require('path');
const assert = require('assert').strict;

const exit = (tests) => (_) => {
  return (process.exitCode = tests.filter(
    (t) => t.conclusion === 'failed'
  ).length);
};

const report = (tests) => {
  if (tests.length === 0) return;
  const passed = tests.filter((t) => t.conclusion === 'passed').length;
  const skipped = tests.filter((t) => t.conclusion === 'skipped').length;
  const failed = tests.filter((t) => t.conclusion === 'failed').length;

  if (process.env.ALOLA_REPORT === 'silent') {
    tests
      .filter((t) => t.conclusion === 'failed')
      .forEach((t) => {
        const line = [t.conclusion, t.assertion, t.reason]
          .filter((x) => x)
          .join('\t');
        process.stderr.write(`${line}\n`);
      });
    return;
  }

  if (process.env.ALOLA_REPORT === 'json') {
    console.log(JSON.stringify(tests));
    return;
  }

  const color = (conclusion) => (txt) => {
    if (conclusion === 'passed') return `\u001b[32m${txt}\u001b[39m`;
    if (conclusion === 'failed')
      return `\u001b[41m\u001b[97m${txt}\u001b[39m\u001b[49m`;
    if (conclusion === 'skipped') return `\u001b[93m${txt}\u001b[39m`;
    return txt;
  };

  console.log(' ');
  tests.forEach((t) => {
    const c = color(t.conclusion);
    const line = [
      c(t.conclusion),
      t.conclusion === 'failed' ? '<-o-<' : '>-o->',
      t.assertion,
      t.reason,
    ]
      .filter((x) => x)
      .join('\t');
    process.stdout.write(`${line}\n`);
  });

  console.log(' ');
  console.log(
    `${passed} of ${tests.length} passed (${failed} failed, ${skipped} skipped) /// ᭴lol᭴`
  );
};

const find = (key, json) => {
  if (!key) return undefined;
  if (!json) return undefined;
  return key.split('.').reduce((o, k) => {
    if (o && o[k]) return o[k];
    return undefined;
  }, json);
};

const parse = (str) => {
  if (typeof str !== 'string') return str;
  try {
    return JSON.parse(str);
  } catch (err) {
    return JSON.stringify(str);
  }
};

const match = (assertion, assertions) => {
  return Object.keys(assertions).reduce((winner, pattern) => {
    if (winner) return winner;
    const match = new RegExp(pattern).exec(assertion);
    if (match === null) return null;
    return {
      pattern,
      match,
    };
  }, null);
};

const builtin = {
  '(\\S+) should not be (.+)$': (json, assertion, regex) => {
    const [, key, expectedString] = regex.match;
    const actual = parse(find(key, json));
    const expected = parse(expectedString);
    assert.notDeepEqual(actual, expected);
  },
  '(\\S+) should not match (.+)$': (json, assertion, regex) => {
    const [, key, expectedString] = regex.match;
    const actual = parse(find(key, json));
    const expected = new RegExp(expectedString);
    assert.notDeepEqual(
      expected.test(actual),
      true,
      `${JSON.stringify(actual)} does match the regex /${expectedString}/`
    );
  },
  '(\\S+) should match (.+)$': (json, assertion, regex) => {
    const [, key, expectedString] = regex.match;
    const actual = parse(find(key, json));
    const expected = new RegExp(expectedString);
    assert.deepEqual(
      expected.test(actual),
      true,
      `${JSON.stringify(actual)} does not match the regex /${expectedString}/`
    );
  },
  '(\\S+) should be (.+)$': (json, assertion, regex) => {
    const [, key, expectedString] = regex.match;
    const actual = parse(find(key, json));
    const expected = parse(expectedString);
    assert.deepEqual(actual, expected);
  },
};

const custom = () => {
  try {
    const custompath = process.env.ALOLA_CUSTOM || path.resolve('.alola.js');
    return require(custompath);
  } catch (err) {
    return {};
  }
};

const verify = (json) => (assertion) => {
  const checks = { ...builtin, ...custom() };
  const winner = match(assertion, checks);
  if (winner === null) {
    return {
      conclusion: 'skipped',
      assertion,
      reason: 'unknown assertion',
    };
  }

  try {
    checks[winner.pattern](json, assertion, winner);
    return { conclusion: 'passed', assertion };
  } catch (err) {
    return {
      conclusion: 'failed',
      assertion,
      reason: err.message,
    };
  }
};

module.exports = (json, assertions = []) => {
  if (assertions.length === 0) return json;
  const tests = assertions.map(verify(json));
  report(tests);
  process.on('beforeExit', exit(tests));
  return json;
};
