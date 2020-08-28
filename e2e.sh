#! /bin/bash

# preconditions
#
# npm i -g fx@latest
# patch ~/.fxrc 

echo -e '
{
  "redirects": [],
  "protocol": "HTTP/2",
  "status": 200,
  "statusText": "",
  "headers": {
    "content-type": "application/json; charset=utf-8",
    "x-powered-by": "Express"
  },
  "body": {
    "id": 42,
    "foo": "bar",
    "nested": {
      "id": 42,
      "foo": "bar"
    }
  }
}
' | fx 'alola()' \
  'expect("status", 200)' \
  'expect("status", /^2\d{2}$/)' \
  'unexpect("status", 404)' \
  'unexpect("status", /^4\d{2}$/)' \
  'expect("headers.x-powered-by", "Express")' \
  'expect("body.id", 42)' \
  'expect("body.id", /^\d{2}$/)' \
  'expect("body.foo", "bar")' \
  'expect("body.nested.foo", "bar")' \
  'expect("body.nested", { "id": 42, "foo": "bar" })' \
  'custom("I do it better", (json, assert) => assert.ok(true))'
