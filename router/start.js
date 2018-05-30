/**
 * Created by orionwei on 2016/5/8.
 */
var http = require('http');
var url = require('url');
var path = require("path");
var querystring = require('querystring');
var app = require('./lib/router');
var router = require('./orion');
var multiparty = require("multiparty");
var util = require("util");


var port = process.argv[2] || 80,pathN;

http.createServer(function(req, res){
    var pathname = url.parse(req.url);
    pathN = pathname.pathname;
    var ext = path.extname(pathN);
    var headers = {
        fileMatch: /^(gif|png|jpg|js|css|html)$/ig,
        maxAge: 60 * 60
    };
    ext = ext ? ext.slice(1) : 'unknown:';
    if (ext.match(headers.fileMatch)) {
        app.staticFile(req,res,pathN,ext);
    } else if() {

    } else {
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
            if(pathname === "/addArticle"){

            }else{
                req.setEncoding('utf-8');
                var postData = "",params;
                if(req.headers['content-type'] !== 'multipart/form-data'){
                    req.addListener("data", function (postDataChunk) {
                        postData += postDataChunk;
                    });
                    req.addListener("end", function () {
                        params = querystring.parse(postData);
                        req.query = params;
                        app.router(req.method.toLowerCase(),pathN,req,res);
                    });
                }else if(req.headers['content-type'] === 'multipart/form-data'){
                    var form = new multiparty.Form({
                        encoding:"utf-8",
                        uploadDir:"public/images",
                        maxFilesSize:2 * 1024 * 1024
                    });
                    form.parse(req, function(err, fields, files) {
                        res.writeHead(200, {'content-type': 'text/plain'});
                        res.write('received upload:\n\n');
                        res.end(util.inspect({fields: fields, files: files}));
                    });
                }
                return;
            }
        }
        app.router(req.method.toLowerCase(),pathN,req,res);
    }
}).listen(port);
console.log("listening "+port);
