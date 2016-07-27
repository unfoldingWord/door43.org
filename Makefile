stat:
	git branch
	git status -s

build:
	bundle exec jekyll build

install:
	bundle install

serve:
	bundle exec jekyll serve

commit:
	git diff >/tmp/git-diff.out 2>&1
	git commit -a
	git pull --no-edit
	git push
	echo "Check http://develop.door43.org/ in a moment"

publish:
	git branch
	echo "Hit Ctrl-C if you are not on `develop`"
	sleep 5
	git merge master
	git checkout master
	git merge develop
	git push origin master
	echo "Check https://master.door43.org/ in a moment"
	git checkout develop
