# alola

[![.github/workflows/main.yaml](https://github.com/balazs4/alola/workflows/.github/workflows/main.yaml/badge.svg)](https://github.com/balazs4/alola/actions?query=workflow%3A.github%2Fworkflows%2Fmain.yaml+branch%3Amaster)
[![alola](https://img.shields.io/npm/v/alola?logo=node.js)](https://www.npmjs.com/package/alola)

> api test tool

## facts

- glue beetween `curl` and any JSON parser tool like `fx` or `jq`
  `curl -i <api> | alola <assertions> | jq .`
- it was built with unix-philosophy in the mind
- no bail-out; it runs every assertions
- CI-friendly: process exit code is always the number of failed testcases

## usage

```bash
# npm install -g alola
curl -i <url> | npx alola [assertions]
```

## examples

```bash
# basic
curl -i https://alola-vercel.vercel.app/api/foo | npx alola

# follows redirections
curl -i https://alola-vercel.vercel.app/api/foo --follow | npx alola

# assertion
curl -i https://alola-vercel.vercel.app/api/foo | npx alola 'status should be 200' 'headers.content-type should match json' 'body.name should be friend'

# silent assertion
curl -i https://alola-vercel.vercel.app/api/foo | npx alola 'status should be 200' 2>/dev/null

# assertion-only
curl -i https://alola-vercel.vercel.app/api/foo | npx alola 'status should be 200' 1>/dev/null

# json assertion output
curl -i https://alola-vercel.vercel.app/api/foo | ALOLA_REPORT=json npx alola 'status should be 200' 1>/dev/null
```

### configuration

You can configure `alola` with the following environment variables:

| Environment variable | Description                                  | Default value | Possible values |
| -------------------- | -------------------------------------------- | ------------- | --------------- |
| `ALOLA_REPORT`       | result reporter                              | text          | text,json       |
| `ALOLA_CUSTOM`       | any resolvable path to the custom assertions | ./.alola.js   |                 |

## complementary projects

- [fx](https://github.com/antonmedv/fx)

## author

balazs4 - https://twitter.com/balazs4
