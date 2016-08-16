#!/usr/bin/env bash
set -e # halt script on error

# Run Markdown Proofer against source files
bundle exec mdl ./pages -r MD001,MD003,MD004,MD005,MD006,MD007,MD009,MD010,MD011,MD012,MD014,MD018,MD019,MD020,MD021,MD022,MD023,MD024,MD025,MD027,MD028,MD029,MD030,MD031,MD032,MD035,MD037,MD038,MD039

# Build site
bundle exec jekyll build

# Run HTML Proofer against built site
# Added --disable_external because it was preventing us from adding new pages
bundle exec htmlproofer ./_site --assume-extension --check-html --disable-external --file-ignore ./_site/templates/reveal.html
