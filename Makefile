stat:
	git branch
	git status -s

build:
	jekyll build

test: stat
	./cibuild.sh

install:
	bundle install

serve:
	jekyll serve

commit:
	git diff >/tmp/git-diff.out 2>&1
	git commit -a
	git pull --no-edit
	git push
	echo "Check http://develop.door43.org/ in a moment"

publish: test
	@read -p "Merge develop into master? <Ctrl-C to break>"
	git checkout develop
	git merge master
	git checkout master
	git merge develop
	git push origin master
	echo "Check https://master.door43.org/ in a moment"
	git checkout develop
