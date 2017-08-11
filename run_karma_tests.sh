#!/usr/bin/env bash

# run karma for specified browser and show Jasmine results

node_modules/.bin/karma start --single-run --browsers $1
RETURN_CODE=$?

echo ""
echo ""
echo "Jasmine Test Results:"
echo ""

cat karma.log

echo ""
echo "karma return code: $RETURN_CODE"
exit $RETURN_CODE
