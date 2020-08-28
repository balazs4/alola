const assert = require('assert').strict;

module.exports = (global) => {
  const results = [];

  const find = (key, json) => {
    return key.split('.').reduce((o, k) => {
      if (o && o[k]) return o[k];
      return undefined;
    }, json);
  };

  const delosslessify = (tmp) => {
    return JSON.parse(
      JSON.stringify(tmp, (_, value) => {
        return value && value.valueOf ? value.valueOf() : value;
      })
    );
  };

  global.alola = (options) => (json) => {
    process.on('beforeExit', (code) => {
      const failed = results.filter((x) => x.err !== undefined).length;
      const passed = results.filter((x) => x.err === undefined).length;
      const total = results.length;
      results.forEach((res) => res.log());
      console.log(' ');
      console.log(
        `${
          failed === 0 && passed > 0 ? '😎' : '😥'
        } ${passed} of ${total} passed (${failed} failed)`
      );
      process.exitCode = failed;
    });

    const test = (name, assertion) => (_) => {
      try {
        assertion(json);
        const log = () => console.log(`✅ ${name}`);
        results.push({ name, log });
      } catch (err) {
        const log = () => {
          console.group(`❌ ${name}`);
          console.log(err.message);
          console.groupEnd();
        };
        results.push({ name, log, err });
      } finally {
        return '';
      }
    };

    global.match = (key, expected) => {
      if (typeof expected.test === typeof Function) {
        return test(`${key} should match the regular expression ${expected.toString()}`, (json) => {
          const actual = delosslessify(find(key, json));
          return assert.deepEqual(
            expected.test(actual),
            true,
            `${actual} does not match the regular expression ${expected.toString()}`
          );
        });
      }
      return test(`${key} should be ${JSON.stringify(expected)}`, (json) => {
        const actual = delosslessify(find(key, json));
        return assert.deepEqual(actual, expected);
      });
    };

    return json;
  };
};
