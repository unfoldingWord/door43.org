#!/usr/bin/env bash
# -*- coding: utf8 -*-
#
#  Copyright (c) 2017 unfoldingWord
#  http://creativecommons.org/licenses/MIT/
#  See LICENSE file for details.
#
#  Contributors:
#  Jesse Griffin <jesse@unfoldingword.org>

SOURCE="assets/"
EXCLUDES="s3_excludes"
BKT="s3://cdn.door43.org/assets/"

echo "Note: Assets will not be deleted from S3"
read -p "Sync $SOURCE to $BKT ? <Ctrl-C to break>"

echo "Syncing to $BKT"
s3cmd -c s3cfg-prod sync -M -F --no-mime-magic \
    --exclude-from "$EXCLUDES" \
    --add-header="Cache-Control:max-age=600" \
    "$SOURCE" "$BKT"
