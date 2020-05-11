const test = require('baretest')('alola');

require('./finalize.test')(test);
require('./parse.test')(test);
require('./split.test')(test);

test.run();
