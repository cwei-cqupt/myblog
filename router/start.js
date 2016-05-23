/**
 * Created by orionwei on 2016/5/8.
 */
var http = require('http');
var url = require('url');
var path = require("path");
var querystring = require('querystring');
var app = require('./lib/router');
var router = require('./orion');


var port = 80||process.argv[2],pathN;

http.createServer(function(req, res){
    var pathname = url.parse(req.url);
    pathN = pathname.pathname;
    var ext = path.extname(pathN);
    var headers = {
        fileMatch: /^(gif|png|jpg|js|css)$/ig,
        maxAge: 60 * 60
    };
    ext = ext ? ext.slice(1) : 'unknown';
    if (ext.match(headers.fileMatch)) {
        app.staticFile(req,res,pathN,ext);
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
            req.query = querystring.parse(pathN.query);
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
                app.router(req.method.toLowerCase(),pathN,req,res);
            });
            return;
        }
        app.router(req.method.toLowerCase(),pathN,req,res);
    }
}).listen(port);
console.log("listening "+port);
