#!/bin/bash

curl -L -o /usr/bin/jq.exe https://github.com/stedolan/jq/releases/latest/download/jq-win64.exe

if [[ -z "${DEPLOY_LOGIN_EMAIL}" ]]; then
  LOGIN_EMAIL="admin01@test.com"
else
  LOGIN_EMAIL="${DEPLOY_LOGIN_EMAIL}"
fi

if [[ -z "${DEPLOY_LOGIN_PASSWORD}" ]]; then
  LOGIN_PASSWORD="123456"
else
  LOGIN_PASSWORD="${DEPLOY_LOGIN_PASSWORD}"
fi

# echo "$LOGIN_EMAIL" "$LOGIN_PASSWORD"

TOKEN=$(
  curl 'http://localhost:3001/graphql' \
  -H 'Content-Type: application/json' \
  -d '{
    "query": "mutation($loginUser: LoginUserDto!) { loginUser(loginUser: $loginUser) { token } }",
    "variables": {
      "loginUser": {
        "email": "'"$LOGIN_EMAIL"'",
        "password": "'"$LOGIN_PASSWORD"'"
      }
    }
  }' | tac | jq -r '.data.loginUser.token'
)

# echo "$TOKEN"

# check if $TOKEN is 'null'
[ $TOKEN = 'null' ] && exit 1

# check if $TOKEN is unset
if [ -z ${TOKEN+x} ];
  then
    echo "TOKEN is unset";
    exit 1;
  else
    echo "TOKEN is set to '$TOKEN'";
fi

curl \
-X POST \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $TOKEN" \
--data '{ "query": "{ getAllTranslations {  key    en    fr    zh    es    pt    ar    ko } } " }' \
http://localhost:3001/graphql | tac | jq -r '.data.getAllTranslations' | ./node_modules/.bin/json2yaml  > translations.yaml

