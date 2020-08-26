# alola

[![.github/workflows/main.yaml](https://github.com/balazs4/alola/workflows/.github/workflows/main.yaml/badge.svg)](https://github.com/balazs4/alola/actions?query=workflow%3A.github%2Fworkflows%2Fmain.yaml+branch%3Amaster)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/balazs4/alola.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/balazs4/alola/context:javascript)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![alola](https://img.shields.io/npm/v/alola?logo=node.js)](https://www.npmjs.com/package/alola)

> converts `curl -isL` output (headers + body) into JSON

## Install

```bash
npx alola

# or

npm install -g alola
```

## Usage

```bash
curl -isL <url> | npx alola
```

### Example

```bash
curl -isL https://pokeapi.co/api/v2/region/alola | npx alola
```

```json
{
  "redirects": [],
  "protocol": "HTTP/2",
  "status": 200,
  "statusText": "",
  "headers": {
    "date": "Sun, 26 Apr 2020 09:22:39 GMT",
    "content-type": "application/json; charset=utf-8",
    "set-cookie": "__cfduid=d92a6754ac3a43ed5d00a09fbb30e3a471587892959; expires=Tue, 26-May-20 09:22:39 GMT; path=/; domain=.pokeapi.co; HttpOnly; SameSite=Lax; Secure",
    "access-control-allow-origin": "*",
    "cache-control": "public, max-age=86400, s-maxage=86400",
    "etag": "W/\"1bcf-Sj6W19Keab5RNbDn5zgkFUncb1U\"",
    "function-execution-id": "yz7ikqjr71mg",
    "x-cloud-trace-context": "d2f9b82cdb34b477d86b14613f7ef9e9;o=1",
    "x-powered-by": "Express",
    "x-served-by": "cache-fra19130-FRA",
    "x-cache": "MISS",
    "x-cache-hits": "0",
    "x-timer": "S1587892881.804004,VS0,VE421",
    "vary": "Accept-Encoding,cookie,need-authorization, x-fh-requested-host, accept-encoding",
    "cf-cache-status": "HIT",
    "age": "78",
    "expect-ct": "max-age=604800, report-uri=\"https://report-uri.cloudflare.com/cdn-cgi/beacon/expect-ct\"",
    "server": "cloudflare",
    "cf-ray": "589f3d967a9a6359-FRA",
    "cf-request-id": "025764d20e000063593fa81200000001"
  },
  "body": {
    "id": 7,
    "locations": [
      {
        "name": "alola-route-1--hauoli-outskirts",
        "url": "https://pokeapi.co/api/v2/location/710/"
      },
      {
        "name": "alola-route-1",
        "url": "https://pokeapi.co/api/v2/location/711/"
      },
      {
        "name": "alola-route-3",
        "url": "https://pokeapi.co/api/v2/location/712/"
      },
      {
        "name": "alola-route-2",
        "url": "https://pokeapi.co/api/v2/location/713/"
      }
    ],
    "main_generation": {
      "name": "generation-vii",
      "url": "https://pokeapi.co/api/v2/generation/7/"
    },
    "name": "alola",
    "names": [
      {
        "language": {
          "name": "en",
          "url": "https://pokeapi.co/api/v2/language/9/"
        },
        "name": "Alola"
      }
    ],
    "pokedexes": [],
    "version_groups": [
      {
        "name": "sun-moon",
        "url": "https://pokeapi.co/api/v2/version-group/17/"
      },
      {
        "name": "ultra-sun-ultra-moon",
        "url": "https://pokeapi.co/api/v2/version-group/18/"
      }
    ]
  }
}
```

## Advanced usage

> :warning: work-in-progress :warning:

```javascript
// fx.rc
// vim: ft=javascript

require('/home/balazs4/src/alola/fx')(global);
```

```bash
curl -isL https://your-deployment.stage
  | alola
  | fx 'status(200)' 'header("x-deployment-hash", "abced1234")' 'body("customerId", /\S+/)' 'res => assert.deepEqual(res.body, { customerId: 1234, foo: 42, bar: "yay" }, "This is my custom assert")'

#### output

# ✅ status 200
# ✅ header "x-deployment-hash: abced1234"
# ❌ body "customerId" does not match to '\S+', actualValue: '1234'
# ✅ This my custom assertion
#
# 3 of 4 checks passed (1 failed)

```

### :thinking: Open points

- [TAP](https://github.com/sindresorhus/awesome-tap) output for reporters?
- bail out as default or make it configurable

```javascript
setup({ bail: true });
```

- support for `FX_RC=/my/testsuite/path/testcases.js fx ...`
  - PR for [fx](https://github.com/antonmedv/fx) or fork

## Related projects

- [fx](https://github.com/antonmedv/fx)

## Author

balazs4 - <https://twitter.com/balazs4>
