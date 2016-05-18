/**
 * Created by orionwei on 2016/5/17.
 */
//#!/usr/bin/env node

var fs = require("fs");
var arguments = process.argv;
if(typeof process.argv[3] === 'undefined'){

}
else{
    read(process.argv[2],process.argv[3]);
}
function read(str,json){
    fs.readFile(str,function(err, data){
        if(err)
            throw err;
        else{
            render(data,json);
        }
    });
}
function render(data,json){

}