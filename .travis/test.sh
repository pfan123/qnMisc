#!/bin/bash

cd dist 
rm -rf *
git init
git config user.name "pfan123"
git config user.email "768065158@qq.com"
git add .
git commit -m "Deployed from Travis CI"
git push --force --quiet "https://${DEPLOY_TOKEN}@github.com:pfan123/qnMisc.git" master:test

echo "发布完成"




