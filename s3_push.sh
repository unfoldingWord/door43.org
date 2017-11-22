#!/usr/bin/env bash
# -*- coding: utf8 -*-
#
#  Copyright (c) 2016-2017 unfoldingWord
#  http://creativecommons.org/licenses/MIT/
#  See LICENSE file for details.
#
#  Contributors:
#  Jesse Griffin <jesse@unfoldingword.org>

SOURCE="_site"
EXCLUDES="s3_excludes"
PROGNAME="${0##*/}"

help() {
    echo "Syncs _site to specified S3 bucket"
    echo
    echo "Usage:"
    echo "   $PROGNAME -b <s3 bucket>"
    echo "   $PROGNAME --help"
    echo
    echo "Example:"
    echo "   $PROGNAME -b \"s3://dev-door43.org\""
    exit 1
}

if [ $# -lt 1 ]; then
    help
fi
while test -n "$1"; do
    case "$1" in
        --help|-h)
            help
            ;;
        --bucket|-b)
            BKT="$2"
            shift
            ;;
        *)
            echo "Unknown argument: $1"
            help
            ;;
    esac
    shift
done

[ -z "$BKT" ] && help

openssl aes-256-cbc -K $encrypted_e2db0eb08244_key -iv $encrypted_e2db0eb08244_iv -in secrets.tar.enc -out secrets.tar -d
tar xvf secrets.tar

for x in `ls "$SOURCE"`; do
    [ "$x" == "assets" ] && continue
    echo "Syncing $x"
    [ -d "$x" ] && s3cmd -c s3cfg-prod sync -M -F \
        --no-mime-magic \
        --exclude-from "$EXCLUDES" \
        --add-header="Cache-Control:max-age=600" \
        "$SOURCE/$x/" "$BKT/$x/"
    [ -f "$x" ] && s3cmd -c s3cfg-prod put -M -F \
        --no-mime-magic \
        --add-header="Cache-Control:max-age=600" \
        "$SOURCE/$x" "$BKT/"
done

echo "Done!"
