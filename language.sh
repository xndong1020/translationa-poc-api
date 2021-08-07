#!/bin/bash

curl -L -o /usr/bin/jq.exe https://github.com/stedolan/jq/releases/latest/download/jq-win64.exe

TOKEN=$(
  curl 'http://localhost:3001/graphql' \
  -H 'Content-Type: application/json' \
  -d '{
    "query": "mutation($loginUser: LoginUserDto!) { loginUser(loginUser: $loginUser) { token } }",
    "variables": {
      "loginUser": {
        "email": "admin01@test.com",
        "password": "123456"
      }
    }
  }' | tac | jq -r '.data.loginUser.token'
)

echo "$TOKEN"
 
curl \
-X POST \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $TOKEN" \
--data '{ "query": "{ getAllTranslations {  key    en    fr    zh    es    pt    ar    ko } } " }' \
http://localhost:3001/graphql | tac | jq -r '.data.getAllTranslations' | ./node_modules/.bin/json2yaml  >> translations.yaml

