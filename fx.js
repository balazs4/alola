'use strict';

const assert = require('assert').strict;

const find = (key, json) => {
  if (!key) return undefined;
  if (!json) return undefined;
  return key.split('.').reduce((o, k) => {
    if (o && o[k]) return o[k];
    return undefined;
  }, json);
};

const delosslessify = (tmp) => {
  return tmp === undefined
    ? undefined
    : JSON.parse(
        JSON.stringify(tmp, (_, value) => {
          return value && value.valueOf ? value.valueOf() : value;
        })
      );
};

const tests = [];

process.on('beforeExit', (code) => {
  if (tests.length === 0) return;
  const passed = tests.filter((t) => t.conclusion === 'passed').length;
  const skipped = tests.filter((t) => t.conclusion === 'skipped').length;
  const failed = tests.filter((t) => t.conclusion === 'failed').length;
  process.exitCode = failed;

  if (process.env.ALOLA_FX_REPORT === 'silent') {
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

  if (process.env.ALOLA_FX_REPORT === 'json') {
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
});

const parse = (str) => {
  if (typeof str !== 'string') return str;
  try {
    return JSON.parse(str);
  } catch (err) {
    return JSON.stringify(str);
  }
};

const regex = (custom) => (assertion) => {
  if (!custom) return null;
  return Object.keys(custom).reduce((winner, pattern) => {
    if (winner) return winner;
    const match = new RegExp(pattern).exec(assertion);
    if (match === null) return null;
    return {
      pattern,
      match,
    };
  }, null);
};

module.exports = (custom) => (assertion) => (losslessjson) => {
  if (assertion === undefined) return losslessjson;
  if (assertion === null) return losslessjson;

  const winner = custom ? regex(custom)(assertion) : null;

  if (winner) {
    try {
      custom[winner.pattern](losslessjson, assertion, winner);
      tests.push({ conclusion: 'passed', assertion, custom: true });
    } catch (err) {
      tests.push({
        conclusion: 'failed',
        assertion,
        custom: true,
        reason: err.message,
      });
    }

    return losslessjson;
  }

  try {
    const [, key, verb, expectedString] =
      /(\S+) (should not be|should not match|should be|should match) (.+)$/.exec(
        assertion
      ) || [];

    if (verb === 'should not be') {
      const json = delosslessify(losslessjson);
      const actual = parse(find(key, json));
      const expected = parse(expectedString);
      assert.notDeepEqual(actual, expected);
      tests.push({ conclusion: 'passed', assertion });
      return losslessjson;
    }

    if (verb === 'should be') {
      const json = delosslessify(losslessjson);
      const actual = parse(find(key, json));
      const expected = parse(expectedString);
      assert.deepEqual(actual, expected);
      tests.push({ conclusion: 'passed', assertion });
      return losslessjson;
    }

    if (verb === 'should match') {
      const json = delosslessify(losslessjson);
      const actual = parse(find(key, json));
      const expected = new RegExp(expectedString);
      assert.deepEqual(
        expected.test(actual),
        true,
        `${JSON.stringify(actual)} does not match the regex /${expectedString}/`
      );
      tests.push({ conclusion: 'passed', assertion });
      return losslessjson;
    }

    if (verb === 'should not match') {
      const json = delosslessify(losslessjson);
      const actual = parse(find(key, json));
      const expected = new RegExp(expectedString);
      assert.notDeepEqual(
        expected.test(actual),
        true,
        `${JSON.stringify(actual)} does match the regex /${expectedString}/`
      );
      tests.push({ conclusion: 'passed', assertion });
      return losslessjson;
    }

    tests.push({
      conclusion: 'skipped',
      assertion,
      reason: 'unknown assertion',
    });

    return losslessjson;
  } catch (err) {
    tests.push({
      conclusion: 'failed',
      assertion,
      reason: err.message,
    });
    return losslessjson;
  }
};
