#!/usr/bin/env bash
set -e # halt script on error

# build site
bundle exec jekyll build

# Run Markdown Proofer against built site
bundle exec mdl ./pages

# Run HTML Proofer against built site
bundle exec htmlproofer ./_site --disable-external --assume-extension --check-html --file-ignore ./_site/templates/reveal.html

