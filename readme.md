[![.github/workflows/main.yaml](https://github.com/balazs4/alola/workflows/.github/workflows/main.yaml/badge.svg)](https://github.com/balazs4/alola/actions?query=workflow%3A.github%2Fworkflows%2Fmain.yaml+branch%3Amaster) [![alola](https://img.shields.io/npm/v/alola?logo=node.js)](https://www.npmjs.com/package/alola)

<p style="text-align:center"><img src=".logo.svg" alt="pipe alola pipe"><p>

# alola

> `curl -i <api> | alola | fx .`

- glue beetween `curl -i` and any JSON parser tool like `fx` or `jq`
- it was built with unix-philosophy in the mind
- no bail-out; it runs every assertions
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

# follows redirections
curl -i https://ewqfsixnkkhp3syjy65heuhkou0dogwr.lambda-url.eu-central-1.on.aws/ --follow | npx alola

# assertion
curl -i https://ewqfsixnkkhp3syjy65heuhkou0dogwr.lambda-url.eu-central-1.on.aws/ | npx alola 'status should be 200' 'headers.content-type should match json' 'body.author should be balazs4'

# silent assertion
curl -i https://ewqfsixnkkhp3syjy65heuhkou0dogwr.lambda-url.eu-central-1.on.aws/ | npx alola 'status should be 200' 2>/dev/null

# assertion only
curl -i https://ewqfsixnkkhp3syjy65heuhkou0dogwr.lambda-url.eu-central-1.on.aws/ | npx alola 'status should be 200' 1>/dev/null

# json assertion output
curl -i https://ewqfsixnkkhp3syjy65heuhkou0dogwr.lambda-url.eu-central-1.on.aws/ | ALOLA_REPORT=json npx alola 'status should be 200' 1>/dev/null

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
