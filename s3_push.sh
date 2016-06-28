#!/bin/bash
# -*- coding: utf8 -*-
#
#  Copyright (c) 2016 unfoldingWord
#  http://creativecommons.org/licenses/MIT/
#  See LICENSE file for details.
#
#  Contributors:
#  Jesse Griffin <jesse@unfoldingword.org>

SOURCE="/var/www/vhosts/newdoor43.org/master/_site/"
BKT="s3://door43.org/"
EXCLUDES="/var/www/vhosts/newdoor43.org/master/s3_excludes"

s3cmd -c /home/webhook/.s3cfg-d43 sync --rr -M \
    --no-mime-magic --delete-removed \
    --exclude-from "$EXCLUDES" \
    --add-header="Cache-Control:max-age=600" \
    "$SOURCE" "$BKT"
