#!/bin/sh
set -e
grep -v '^#' ./dirs-to-test | xargs ./node_modules/mocha/bin/mocha -C -R list --harmony | sed 's/:[^:]*$//' > .new.tr
comment=`diff .old.tr .new.tr | sed 1d || echo`
./node_modules/mocha/bin/mocha -R markdown --harmony > spec.md
mv .new.tr .old.tr
git add .
git commit -a -m "$comment"
git push

