'use strict';

const readline = require('readline');
const path = require('path');
const assert = require('assert').strict;

function jsonOrShitInShitOut(text) {
  try {
    return JSON.parse(text);
  } catch (_) {
    return text;
  }
}

function statusObject(rawstatus) {
  const [protocol, statuscode, ...statustexts] = rawstatus.split(' ');
  return {
    protocol,
    status: parseInt(statuscode),
    statusText: statustexts.join(' '),
  };
}

function header(rawheader) {
  const [key = '', ...values] = rawheader.split(':');
  if (key === '') return {};
  const value = values.join(':');
  return { [key.toLowerCase()]: value.trim() };
}

function exit(tests) {
  return function () {
    process.exitCode = tests.filter((t) => t.conclusion === 'failed').length;
    return;
  };
}

function report(tests) {
  if (tests.length === 0) return;
  const passed = tests.filter((t) => t.conclusion === 'passed').length;
  const skipped = tests.filter((t) => t.conclusion === 'skipped').length;
  const failed = tests.filter((t) => t.conclusion === 'failed').length;

  if (process.env.ALOLA_REPORT === 'json') {
    process.stderr.write(JSON.stringify(tests) + '\n');
    return;
  }

  const redgreenyellow = (txt) => {
    return process.stdout.hasColors && process.stdout.hasColors() === true
      ? txt
          .replace(/^PASSED/, '\x1b[32mPASSED\x1b[0m')
          .replace(/^FAILED/, '\x1b[31mFAILED\x1b[0m')
          .replace(/^SKIPPED/, '\x1b[33mSKIPPED\x1b[0m')
      : txt;
  };

  const gray = (txt) => {
    return process.stdout.hasColors && process.stdout.hasColors() === true
      ? `\x1b[2m${txt}\x1b[0m`
      : txt;
  };

  const bold = (txt) => {
    return process.stdout.hasColors && process.stdout.hasColors() === true
      ? `\x1b[1m${txt}\x1b[0m`
      : txt;
  };

  tests.forEach((t) => {
    const line = [
      redgreenyellow(t.conclusion.toUpperCase()),
      t.conclusion === 'failed' ? gray(' vvv ') : gray(' >>> '),
      t.conclusion === 'failed' ? bold(t.assertion) : t.assertion,
      t.reason ? `\n${bold(t.reason)}` : null,
    ]
      .filter((x) => x)
      .join('\t');

    process.stderr.write(`${line}\n`);
  });

  process.stderr.write(
    `total:${tests.length} passed:${passed} failed:${failed} skipped:${skipped}\n`
  );
}

function find(key, json) {
  if (!key) return undefined;
  if (!json) return undefined;
  return key.split('.').reduce((o, k) => {
    if (o) return o[k];
    return undefined;
  }, json);
}

function jsonparse(str) {
  if (str === 'undefined') return undefined;
  if (typeof str !== 'string') return str;
  try {
    return JSON.parse(str);
  } catch (err) {
    return str;
  }
}

function match(assertion, assertions) {
  return Object.keys(assertions).reduce((winner, pattern) => {
    if (winner) return winner;
    const match = new RegExp(pattern).exec(assertion);
    if (match === null) return null;
    return {
      pattern,
      match,
    };
  }, null);
}

const builtin = {
  '(\\S+) should not be (.+)$': (json, assertion, regex) => {
    const [, key, expectedString] = regex.match;
    const actual = jsonparse(find(key, json));
    const expected = jsonparse(expectedString);
    assert.notDeepEqual(actual, expected);
  },
  '(\\S+) should not match (.+)$': (json, assertion, regex) => {
    const [, key, expectedString] = regex.match;
    const actual = jsonparse(find(key, json));
    const expected = new RegExp(expectedString);
    assert.notDeepEqual(
      expected.test(actual),
      true,
      `${JSON.stringify(actual)} does match the regex /${expectedString}/`
    );
  },
  '(\\S+) should match (.+)$': (json, assertion, regex) => {
    const [, key, expectedString] = regex.match;
    const actual = jsonparse(find(key, json));
    const expected = new RegExp(expectedString);
    assert.deepEqual(
      expected.test(actual),
      true,
      `${JSON.stringify(actual)} does not match the regex /${expectedString}/`
    );
  },
  '(\\S+) should be (.+)$': (json, assertion, regex) => {
    const [, key, expectedString] = regex.match;
    const actual = jsonparse(find(key, json));
    const expected = jsonparse(expectedString);
    assert.deepEqual(actual, expected);
  },
};

function custom() {
  try {
    const custompath = process.env.ALOLA_CUSTOM || path.resolve('.alola.js');
    return require(custompath);
  } catch (err) {
    return {};
  }
}

function verify(json) {
  return function (assertion) {
    const checks = { ...builtin, ...custom() };
    const winner = match(assertion, checks);
    if (winner === null) {
      return {
        conclusion: 'skipped',
        assertion,
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
}

exports.check = function (json, assertions = []) {
  if (assertions.length === 0) return json;
  const tests = assertions.map(verify(json));
  report(tests);
  process.on('beforeExit', exit(tests));
  return json;
};

exports.read = function () {
  return new Promise((resolve) => {
    const lines = [];
    readline
      .createInterface(process.stdin)
      .on('line', (line) => lines.push(line))
      .on('close', () => resolve(lines));
  });
};

exports.split = function (lines) {
  const blocks = lines
    .reduce((acc, line) => {
      if (/^HTTP\/\d/.test(line)) {
        return [...acc, [line]];
      }
      if (acc.length === 0) {
        return [[line]];
      }
      acc[acc.length - 1].push(line);
      return acc;
    }, [])
    .map((block) => {
      const lastindex = block.length - 1;
      return block.filter((chunk, index) => {
        return index === lastindex && chunk === '' ? false : true;
      });
    });

  return blocks;
};

exports.finalize = function (array) {
  const { length, [length - 1]: last, ...rest } = array;
  return {
    redirects: Object.values(rest),
    ...last,
  };
};

exports.parse = function (block) {
  const result = block.reduce((res, chunk) => {
    if (/^HTTP\/\d/.test(chunk)) {
      return { ...res, ...statusObject(chunk) };
    }
    if (chunk === '') {
      return { ...res, rawbody: [] };
    }
    if (res.rawbody) {
      return { ...res, rawbody: [...res.rawbody, chunk] };
    }

    return { ...res, headers: { ...res.headers, ...header(chunk) } };
  }, {});

  result['body'] =
    result.rawbody && result.rawbody.join
      ? jsonOrShitInShitOut(result.rawbody.join(''))
      : null;

  delete result.rawbody;

  return result;
};
