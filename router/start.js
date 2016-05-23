/**
 * Created by orionwei on 2016/5/8.
 */
var http = require('http');
var app = require('./lib/router');
var url = require('url');
var querystring = require('querystring');
var static = require("./lib/static");
require('./orion');

var port = 80;
var path, pathname;
http.createServer(function(req, res){
    path = url.parse(req.url);
    pathname = path.pathname;
    //console.log(static.test(pathname));
    if(static.isStatic(pathname)){
        static.find(req,res,pathname);
        return;
    }
    else{
        res.send = function(obj,str){
            if(str === 'json'){
                res.writeHead(200,{'content-Type':'application/json'});
                res.end(JSON.stringify(obj));
            }
        };
        if(req.method === 'GET'){
            req.query = querystring.parse(path.query);
        }
        else if(req.method === 'POST'){
            req.setEncoding('utf-8');
            var postData = "",params;
            req.addListener("data", function (postDataChunk) {
                postData += postDataChunk;
            });
            req.addListener("end", function () {
                params = querystring.parse(postData);
                req.query = params;
                app.router(req.method.toLowerCase(),pathname,req,res);
            });
            return;
        }
        app.router(req.method.toLowerCase(),pathname,req,res);
    }
}).listen(port);
console.log("listening "+port);
