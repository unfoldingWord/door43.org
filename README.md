# door43.org

This is the source for door43.org website.  Note that it does not include the files that show up at door43.org/u/ as those are created by the conv.door43.org API.


#### Installation ####

To setup a development environment for developing on this site, you need to run the following commands (after cloning this repo):

    cd door43.org
    bundle install

If you do not have the `bundle` executable, then you'll need to run `sudo gem install bundle` first.

#### Updating dependencies ####

    bundle update

#### Pre Production Testing ####

After testing locally, push your changes to master (you can use `make commit`).  They will then be visible at http://[branch_name].door43.org/ within seconds.  Supported branches are `master`, `develop`, `phil`, `codemis`.


#### Push to Production ####

After pre production testing, merge your branch into the `master` branch.
Your changes should be visible within 5 minutes on
http://door43.org.


#### Open source acknowledgements ####

  * http://jekyllrb.com
  * https://github.com/aucor/jekyll-plugins
  * https://github.com/jekyll/jekyll-sitemap
