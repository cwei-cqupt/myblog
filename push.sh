#!bin/sh


commit=$1
git add -A
git commit -m $commit
git push origin master
