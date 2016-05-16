/**
 * Created by orionwei on 2016/5/8.
 */
var http = require('http');
var app = require('./router');
var url = require('url');
var querystring = require('querystring');
require('./orion');
http.createServer(function(req, res){
    var path = url.parse(req.url);
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
            app.router(req.method.toLowerCase(),path.pathname,req,res);
        });
        return;
    }
    app.router(req.method.toLowerCase(),path.pathname,req,res);
}).listen(80);
console.log("listening 3000");
