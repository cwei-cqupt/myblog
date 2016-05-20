/**
 * Created by orionwei on 2016/5/17.
 */
//#!/usr/bin/env node

var fs = require("fs");
var args = process.argv;
if(typeof process.argv[3] === 'undefined'){

}
else{
    render(process.argv[2],process.argv[3]);
}
function render(str,json){
    console.log(str,json)
}
