#!/bin/bash

curl -L -o /usr/bin/jq.exe https://github.com/stedolan/jq/releases/latest/download/jq-win64.exe

curl \
-X POST \
-H "Content-Type: application/json" \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiaWF0IjoxNjI3ODc3MjU5fQ.PjyrCI6l2k-ezwhbprppZlWjhFKWFz_3_ogXNwMDIZk" \
--data '{ "query": "{ getAllTranslations {  key    en    fr    zh    es    pt    ar    ko } } " }' \
http://localhost:3001/graphql | tac | jq -r '.data.getAllTranslations'  >> translations.json

