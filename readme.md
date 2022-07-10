<div align="center">
<img src=".logo-gh-light-mode-only.svg#gh-light-mode-only" alt="pipe alola pipe">
<img src=".logo-gh-dark-mode-only.svg#gh-dark-mode-only" alt="pipe alola pipe">
</div>

# alola 

[![npm version: alola](https://img.shields.io/npm/v/alola?color=010101&logo=npm)](https://www.npmjs.com/package/alola) [![zero dependencies](https://img.shields.io/badge/dependencies-zero-010101?logo=npm)](https://www.npmjs.com/package/alola) [![code style: prettier](https://img.shields.io/badge/code_style-prettier-010101.svg?logo=prettier)](https://github.com/prettier/prettier) [![.github/workflows/main.yaml](https://github.com/balazs4/alola/workflows/.github/workflows/main.yaml/badge.svg)](https://github.com/balazs4/alola/actions?query=workflow%3A.github%2Fworkflows%2Fmain.yaml+branch%3Amaster) 


- glue beetween `curl -i` and cli JSON parser tool of your choice like `jq` or `fx`
  
  `curl -i <url> | alola | fx .`

- it was built with unix-philosophy in the mind
- runs assertions on JSON
- no bail-out: it runs every assertions
- CI-friendly: process exit code is always the number of failed testcases

## usage

```bash
# npm install -g alola
# or
# npx alola (recommended)

curl -i <url> | npx alola [assertions]
```

## examples

```bash
# basic

curl -i https://ewqfsixnkkhp3syjy65heuhkou0dogwr.lambda-url.eu-central-1.on.aws/ | npx alola

# output

{
  "redirects": [],
  "protocol": "HTTP/1.1",
  "status": 200,
  "statusText": "OK",
  "headers": {
    "date": "Sun, 10 Jul 2022 08:30:19 GMT",
    "content-type": "application/json",
    "content-length": "68",
    "connection": "keep-alive",
    "x-amzn-requestid": "6f38be71-8c2a-4106-8bd5-6a2a0726d831",
    "x-amzn-trace-id": "root=1-62ca8e1b-3fa47e01777132441c03e3de;sampled=0"
  },
  "body": {
    "date": 1657441819664,
    "foobar": 42,
    "author": "balazs4",
    "name": "alola"
  }
}
```

```sh
# follows redirections
curl -i https://ewqfsixnkkhp3syjy65heuhkou0dogwr.lambda-url.eu-central-1.on.aws/ --follow \
  | npx alola

# assertion
curl -i https://ewqfsixnkkhp3syjy65heuhkou0dogwr.lambda-url.eu-central-1.on.aws/ \
  | npx alola 'status should be 200' 'headers.content-type should match json' 'body.author should be balazs4'

# silent assertion
curl -i https://ewqfsixnkkhp3syjy65heuhkou0dogwr.lambda-url.eu-central-1.on.aws/ \
  | npx alola 'status should be 200' 2>/dev/null

# assertion only
curl -i https://ewqfsixnkkhp3syjy65heuhkou0dogwr.lambda-url.eu-central-1.on.aws/ \
  | npx alola 'status should be 200' 1>/dev/null

# json assertion output
curl -i https://ewqfsixnkkhp3syjy65heuhkou0dogwr.lambda-url.eu-central-1.on.aws/ \
  | ALOLA_REPORT=json npx alola 'status should be 200' 1>/dev/null

# middleware
curl -i https://ewqfsixnkkhp3syjy65heuhkou0dogwr.lambda-url.eu-central-1.on.aws/ \
  | npx alola 'status should be 200' 'headers.content-type should match json' \
  | npx fx 'res => res.body.name + " by " + res.body.author'
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
