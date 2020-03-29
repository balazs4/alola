const read = require('./read');
const split = require('./split');
const parse = require('./parse');
const finalize = require('./finalize');

read()
  .then(lines => split(lines))
  .then(blocks => blocks.map(block => parse(block)))
  .then(parsedblocks => finalize(parsedblocks))
  .then(result => console.log(JSON.stringify(result, null, 2)));
