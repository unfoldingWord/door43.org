#!/usr/bin/env bash
# -*- coding: utf8 -*-
#
#  Copyright (c) 2016 unfoldingWord
#  http://creativecommons.org/licenses/MIT/
#  See LICENSE file for details.
#
#  Contributors:
#  Jesse Griffin <jesse@unfoldingword.org>
#  Richard Mahn <richard_mahn@wycliffeassociates.org>
#
#  This is for developers to easily push changes to 
#  S3 wycliffeassociates account, to the test-door43.org bucket
#
#  First  set up your S3 creditials by installing s3cmd and
#  run s3cmd --configure and enter your API key and secret key
#
#  Next, build the site with jekyll by running ./cibuild.sh, then
#  run this script.  

SOURCE="_site/"
BKT="s3://test-door43.org/"
EXCLUDES="s3_excludes"

s3cmd sync -M -F \
    --no-mime-magic \
    --exclude-from "$EXCLUDES" \
    --add-header="Cache-Control:max-age=600" \
    "$SOURCE" "$BKT"

