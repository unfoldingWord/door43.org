#!/bin/bash

set -e
set -x

gem install --conservative jekyll bundle

bundle install

nginx

bundle exec jekyll build --watch
