const assert = require('assert').strict;

module.exports = (global) => {
  const results = [];

  global.alola = (options) => (json) => {
    process.on('beforeExit', (code) => {
      const failed = results.filter((x) => x.err !== undefined).length;
      const passed = results.filter((x) => x.err === undefined).length;
      const total = results.length;
      results.forEach((res) => {
        res.log();
      });
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

    global.status = (expected) =>
      test(`status code should be ${expected}`, (json) =>
        assert.equal(parseInt(json.status), parseInt(expected)));

    global.header = (key, expected) =>
      test(`header['${key}'] should be ${JSON.stringify(expected)}`, (json) =>
        assert.deepEqual(json.headers[key], expected));

    global.body = (key, expected) =>
      test(`body.${key} should be ${JSON.stringify(expected)}`, (json) => {
        const lossless = key.split('.').reduce((o, k) => {
          if (o && o[k]) return o[k];
          return undefined;
        }, json.body);

        const actual = JSON.parse(
          JSON.stringify(lossless, (key, value) => {
            return value && value.valueOf ? value.valueOf() : value;
          })
        );

        assert.deepEqual(actual, expected);
      });

    return json;
  };
};
