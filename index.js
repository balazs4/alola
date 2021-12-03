#! /usr/bin/env node

const read = require('./read');
const split = require('./split');
const parse = require('./parse');
const finalize = require('./finalize');
const check = require('./check');

const write = (json) => {
  if (process.env.ALOLA_REPORT_ONLY){
    return json;
  }
  console.log(JSON.stringify(json, null, 2));
  return json; 
};

const [, , ...assertions] = process.argv;
read()
  .then((lines) => split(lines))
  .then((blocks) => blocks.map((block) => parse(block)))
  .then((parsedblocks) => finalize(parsedblocks))
  .then((json) => write(json))
  .then((json) => check(json, assertions));
