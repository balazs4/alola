#! /usr/bin/env node

const { read, split, parse, finalize, check } = require('./index');

const [, , ...assertions] = process.argv;

read().then((lines) => {
  const blocks = split(lines).map((block) => parse(block));
  const json = finalize(blocks);
  process.stdout.write(JSON.stringify(json, null, 2) + '\n');
  check(json, assertions);
});
