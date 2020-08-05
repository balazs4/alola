const assert = require('assert').strict;
const suite = [];

module.exports = (global) => {
  global.alola = (json) => {
    process.on('exit', (code) => {
      const results = suite.map(({ name, test }) => {
        try {
          test(json);
          const log = () => console.log(`✅ ${name}`);
          return { name, log };
        } catch (err) {
          const log = () => {
            console.group(`❌ ${name}`);
            console.log(err.message);
            console.groupEnd();
          };
          return { name, log, err };
        }
      });
      const passed = results.filter((x) => x.err === undefined).length;
      const failed = results.filter((x) => x.err !== undefined).length;
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

    const check = (name, test) => {
      suite.push({ name, test });
      return (_) => '';
    };

    global.status = (expected) =>
      check(`status code should be '${expected}'`, (json) =>
        assert.equal(parseInt(json.status), parseInt(expected))
      );

    global.header = (key, expected) =>
      check(`header['${key}'] should be '${expected}'`, (json) =>
        assert.equal(json.headers[key], expected)
      );
  };
};
