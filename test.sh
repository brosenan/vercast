#!/bin/bash

for testdir in `find $PWD -type d -name test`; 
do
    dir=${testdir%%/test}
    echo ========== $dir ==========
    cd $dir
    mocha
done