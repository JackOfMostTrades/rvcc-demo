#!/bin/bash

set -e

GITREV=$(git rev-parse --short HEAD)
npm run build

pushd bingo
npm run build
popd

git branch -D gh-pages
git checkout --orphan gh-pages
git rm -r --cached .
rm -f .gitignore bingo/.gitignore
git add dist/ index.html blob-stream.js images/ healthy/ frame/
git add bingo/dist/ bingo/index.html bingo/images/
git commit -m "Github Pages Build (${GITREV})"
git push --force -u origin gh-pages
git reset --hard main
git checkout main
