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

openssl aes-256-cbc -K $encrypted_e2db0eb08244_key -iv $encrypted_e2db0eb08244_iv -in secrets.tar.enc -out secrets.tar -d
tar xvf secrets.tar

echo 'Hello'
