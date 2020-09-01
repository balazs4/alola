#! /bin/bash

# preconditions
#
# curl
# netcat
# npm link or npm i -g alola
# npm i -g fx@latest
# patch ~/.fxrc 

set -e 
PORT=9000

function netcat(){
  if [[ ! -z $CI ]]
    then nc -N -l $1 > /dev/null
    else nc -c -l -p $1 > /dev/null
  fi
}

(echo -e 'HTTP/2 200
Content-Type: application/json; charset=utf-8
X-Powered-By: Express

{ "id": 42, "foo": "bar", "nested": { "id": 42, "foo": "bar" }, "tags": ["awesome", "cool"]}
' | netcat ${PORT} &)

[[ ! -z $CI ]] && sleep 4s

curl -Lis http://localhost:${PORT} \
 | alola \
 | fx 'alola()' \
   'expect("status", 200)' \
   'expect("status", /^2\d{2}$/)' \
   'unexpect("status", 404)' \
   'unexpect("status", /^4\d{2}$/)' \
   'expect("headers.x-powered-by", "Express")' \
   'expect("body.id", 42)' \
   'expect("body.id", /^\d{2}$/)' \
   'expect("body.foo", "bar")' \
   'expect("body.tags.0", "awesome")' \
   'unexpect("body.tags.4", "something")' \
   'expect("body.nested.foo", "bar")' \
   'expect("body.nested", { "id": 42, "foo": "bar" })' \
   'custom("I do it better", (json, assert) => assert.ok(true))'
