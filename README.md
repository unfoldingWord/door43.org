master | [![Build Status](https://travis-ci.org/unfoldingWord-dev/door43.org.svg?branch=master)](https://travis-ci.org/unfoldingWord-dev/door43.org)

develop | [![Build Status](https://travis-ci.org/unfoldingWord-dev/door43.org.svg?branch=develop)](https://travis-ci.org/unfoldingWord-dev/door43.org)

# door43.org

This is the source for door43.org website.  Note that it does not include the files that show up at door43.org/u/ as those are created by the [tX conversion app](https://github.com/unfoldingWord-dev/door43.org/wiki/tX-Development-Architecture).

## Project Overview

The http://door43.org site provides a front end view to all of the content in the Door43 ecosystem.  The source content on http://git.door43.org is converted into HTML and uploaded to the correct location on http://door43.org.

Whenever a source repository is updated, it notifies (via webhook) the conversion app to convert the content and publish it online.  A repository like https://git.door43.org/jag3773/ULB-pt-br will become a published web page at http://door43.org/u/jag3773/ULB-pt-br/.

The pages outside of the `/u/` location on the site are generated by Jekyll and provide localized navigation, Door43 project information, and curated content recommendations for each language.

## Project Management

We use the [Zenhub](https://www.zenhub.com/) plugin to manage this project with Boards and Burndown charts.  We do one week Sprints following Scrum methodology.  If you don't have the (free) Zenhub plugin you can still see the [issue list](https://github.com/unfoldingWord-dev/door43.org/issues) and the [milestones](https://github.com/unfoldingWord-dev/door43.org/milestones) that we have created.

If you would like to submit an issue,  please do so [here](https://github.com/unfoldingWord-dev/door43.org/issues/new).  Be sure to follow the template that is provided on a new issue.  You can also see the [New Door43 Roadmap](https://github.com/unfoldingWord-dev/door43.org/wiki/New-Door43-Roadmap) to get an idea of our overall priorities and potential timeline to implementation.

## Developer Quickstart Information

### Door43.org Jekyll Site

#### Installation

To setup a development environment for developing on this site, you need to run the following commands (after cloning this repo):

    cd door43.org
    bundle install

If you do not have the `bundle` executable, then you'll need to run `sudo gem install bundle` first.

#### Updating dependencies

    bundle update

#### Publishing Setup

There are two branches that are built and deployed to S3 by Travis CI:

* `develop`
* `master`

The develop branch may be seen online at http://test-door43.org.s3-website-us-west-2.amazonaws.com.

The master branch is available at https://live.door43.org (soon to be at https://door43.org).

#### Pre Production Testing

You may run `make test`, or `make build`, or `make serve` to test and review your changes locally.  Once the `cibuild.sh` script passes successfully locally, you may commit and push to the `develop` branch.  You can do this by running `make commit`.

#### Push to Production

If Travis CI has built and deployed the `develop` branch successfully, you may merge it into the `master` branch.  You can do this by running `make publish`.  Your changes should be visible within 5 minutes on https://live.door43.org.

#### Syncing Assets

Assets (binary things like images) are housed on cdn.door43.org/assets for this site. This assets folder is a Resilio Sync folder shared among the developers (ask if you need access).

##### Setup

Initial setup requires getting the shared folder on your system.  Then you need to symlink the folder into the root of this project as "assets".  On my system I did this:

    cd vcs/door43.org
    ln -s /Users/jesse/BitTorrent\ Sync/door43.org.assets/ assets

If you need `s3cmd`, then install it from http://s3tools.org/download.  It's as easy as `yum install s3cmd` or `sudo apt-get install s3cmd` for Linux.

You will also need to ensure that you have a configuration file for `s3cmd` available as `s3cfg-prod` at the root of the repo.  Both the assets and s3cfg-prod locations are excluded from git in .gitignore.

##### Syncing

In order to synchronize the assets to the cdn S3 bucket you may now run `make assets`.  This process will **not remove** assets from the /assets folder, only add or update existing files.

### Running Unit Tests [Local Preliminary]

#### First Time:

- Unzip jasmine into location ./jasmine

#### Running Tests:

- edit ./cibuild.sh temporarily (don't commit changes) adding a # before the lines `bundle exec mdl...` and  `bundle exec htmlproofer...`. Save the modified file.
- launch Jekyll server: `make serve`
- open browser to: `http://127.0.0.1:4000/test/SpecRunner.html`.  Can do refresh to rerun tests after changes to files (just make sure to do a force save of files since some tools don't write changes to files immediately)
- to debug tests you can use Chrome browser. Then open "Developer Tools", set breakpoints and then do refresh.

#### Adding Tests:
- tests are js files in ./test/spec
- will also need to add new test files to ./test/SpecRunner.html


#### Open source acknowledgements

* http://jekyllrb.com
* https://github.com/aucor/jekyll-plugins
* https://github.com/jekyll/jekyll-sitemap
* https://github.com/mivok/markdownlint
* https://github.com/gjtorikian/html-proofer
