#!/bin/bash -e

npm run build
git branch -D gh-pages
git checkout --orphan gh-pages
git rm -r --cached .
rm -f .gitignore
git add dist/ index.html blob-stream.js images/
git commit -m "Github Pages Build"
git push --force -u origin gh-pages
git reset --hard main
git checkout main
