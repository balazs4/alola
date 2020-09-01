module.exports = (fxglobal) => {
  const assert = require('assert').strict;
  const results = [];

  const find = (key, json) => {
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

  fxglobal.alola = (options) => (json) => {
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
        assertion(json, assert);
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

    fxglobal.expect = (key, expected) => {
      if (typeof expected.test === typeof Function) {
        return test(`${key} should match the regular expression ${expected.toString()}`, (json, assert) => {
          const actual = delosslessify(find(key, json));
          return assert.deepStrictEqual(
            expected.test(actual),
            true,
            `${actual} does not match the regular expression ${expected.toString()}`
          );
        });
      }
      return test(`${key} should be ${JSON.stringify(
        expected
      )}`, (json, assert) => {
        const actual = delosslessify(find(key, json));
        return assert.deepStrictEqual(actual, expected);
      });
    };

    fxglobal.unexpect = (key, expected) => {
      if (typeof expected.test === typeof Function) {
        return test(`${key} should not match the regular expression ${expected.toString()}`, (json, assert) => {
          const actual = delosslessify(find(key, json));
          return assert.notDeepStrictEqual(
            expected.test(actual),
            true,
            `${actual} does match the regular expression ${expected.toString()}`
          );
        });
      }
      return test(`${key} should not be ${JSON.stringify(
        expected
      )}`, (json, assert) => {
        const actual = delosslessify(find(key, json));
        return assert.notDeepStrictEqual(actual, expected);
      });
    };

    fxglobal.custom = (name, assertion) => {
      return test(name, assertion);
    };

    return json;
  };
};
