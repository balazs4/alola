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
' | fx \
  'alola()' \
  'match("status", 200)' \
  'match("status", status("2xx"))' \
  'match("headers.x-powered-by", "Express")' \
  'match("body.id", 42)' \
  'match("body.foo", "bar")' \
  'match("body.nested.foo", "bar")' \
  'match("body.nested", { "id": 42, "foo": "bar" })' \
  'match("body.id", /^\d{2}$/)' 
