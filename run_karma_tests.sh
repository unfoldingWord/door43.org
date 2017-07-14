#!/usr/bin/env bash

# run karma for specified browser and show Jasmine results

node_modules/.bin/karma start --single-run --browsers $1

echo ""
echo ""
echo "Jasmine Test Results:"
echo ""

cat karma.log

