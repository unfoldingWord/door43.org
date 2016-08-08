#!/usr/bin/env bash
# -*- coding: utf8 -*-
#
#  Copyright (c) 2016 unfoldingWord
#  http://creativecommons.org/licenses/MIT/
#  See LICENSE file for details.
#
#  Contributors:
#  Jesse Griffin <jesse@unfoldingword.org>

SOURCE="_site/"
BKT="s3://door43.org/"
EXCLUDES="s3_excludes"

s3cmd -c s3cfg-prod sync --rr -M -F \
    --no-mime-magic --delete-removed \
    --exclude-from "$EXCLUDES" \
    --add-header="Cache-Control:max-age=600" \
    "$SOURCE" "$BKT"
