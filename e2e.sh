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
  'status(200)' \
  'header("x-powered-by", "Express")' \
  'body("id", 42)' \
  'body("foo", "bar")' \
  'body("nested.foo", "bar")' \
  'body("nested", { "id": 42, "foo": "bar" })'  
