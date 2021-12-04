#! /usr/bin/env node

const read = require('./read');
const split = require('./split');
const parse = require('./parse');
const finalize = require('./finalize');
const check = require('./check');

const [, , ...assertions] = process.argv;

read().then((lines) => {
  const blocks = split(lines).map((block) => parse(block));
  const json = finalize(blocks);
  if (process.env.ALOLA_REPORT_ONLY === undefined) {
    console.log(JSON.stringify(json, null, 2));
  }
  check(json, assertions);
});
