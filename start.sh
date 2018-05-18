#!/bin/sh


git pull
expressroute=~/workspace/myblog/router/start.js
expresspid=`ps -axu|awk '/node/{print $2}'`
if [ -n $expresspid ];
then
    nohup node $expressroute &
else
    kill $expresspid
    nohup node $expressroute &
fi
