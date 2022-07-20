#! /bin/sh

set -e 

# simulate curl output
function fakecurl(){
  echo -e 'HTTP/2 200
Content-Type: application/json; charset=utf-8
X-Powered-By: Express

{ "id": 42, "foo": "bar", "nested": { "id": 42, "foo": "bar" }, "tags": ["awesome", "cool"], "whatif": "should be", "yes": true, "elements": [{ "public": false }, { "public": true }]}'
}

fakecurl -Lis http://localhost:4242 \
 | alola \
  'headers.content-type should match json' \
  'headers.x-powered-by should be Express' \
  'status should be 200' \
  'status should not be 404' \
  'status should match ^2\d\d$' \
  'status should not match ^4\d\d$' \
  'body.id should be 42' \
  'body.id should match ^\d{2}$' \
  'body.foo should be bar' \
  'body.tags.0 should be awesome' \
  'body.tags.length should be 2' \
  'body.tags.4 should be undefined' \
  'body.nested.foo should be bar' \
  'body.nested should be { "id": 42, "foo": "bar" }' \
  'body.whatif should be should be' \
  'body.error should be undefined' \
  'body.yes should be true' \
  'body.elements.0.public should be false' \
  'body.elements.1.public should be true' \
  'body.elements.2.public should be undefined' \
  'alola is awesome' \
  'alola is fantastic'
