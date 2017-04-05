#!/bin/bash
if [ "$1" = "false" ]
	
# not a pull request, deploy to github pages
then ( cd dist
  git init
  git config user.name "pfan123"
  git config user.email "768065158@qq.com"
  git add .
  git commit -m "Deployed from Travis CI"
  git push --force --quiet "git@github.com:pfan123/travis-test.git" master:master

  echo "发布完成"
)
fi