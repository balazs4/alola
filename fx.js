const assert = require('assert').strict;

module.exports = (global) => {
  const results = [];

  global.alola = (json) => {
    process.on('beforeExit', (code) => {
      const failed = results.filter((x) => x.err !== undefined).length;
      const passed = results.filter((x) => x.err === undefined).length;
      const total = results.length;
      results.forEach((res) => {
        res.log();
      });
      console.log(' ');
      console.log(`${passed} passed of ${total} results (${failed} failed)`);
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
      test(`status code should be '${expected}'`, (json) =>
        assert.equal(parseInt(json.status), parseInt(expected)));

    global.header = (key, expected) =>
      test(`header['${key}'] should be '${expected}'`, (json) =>
        assert.equal(json.headers[key], expected));

    global.body = (key, expected) =>
      test(`body['${key}'] should be '${expected}'`, (json) => {
        const actual = json.body[key].valueOf
          ? json.body[key].valueOf()
          : json.body[key];
        assert.equal(actual, expected);
      });

    return json;
  };
};
