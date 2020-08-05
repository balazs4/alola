const assert = require('assert').strict;
const results = [];

module.exports = (global) => {
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
      if (failed === 0) {
        return json;
      }
      return process.exit(failed);
    });

    global.status = (expected) => (_) => {
      const name = `status code should be '${expected}'`;
      try {
        assert.equal(parseInt(json.status), parseInt(expected));
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

    return json;
  };

  // global.header = (key, expected) =>
  //   check(`header['${key}'] should be '${expected}'`, (json) =>
  //     assert.equal(json.headers[key], expected)
  //   );
};
