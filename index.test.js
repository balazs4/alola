const [, , ref = '(dev)'] = process.argv;
const test = require('baretest')(`alola #${ref}`);

require('./finalize.test')(test);
require('./parse.test')(test);
require('./split.test')(test);

test.run().then((allpassed) => {
  if (allpassed === false) {
    process.exit(-1);
  }
});
