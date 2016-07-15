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
                    //form.on('error', function(err) {
                    //    console.log('Error parsing form: ' + err.stack);
                    //});
                    //
                    //form.on('part', function(part) {
                    //    // You *must* act on the part by reading it
                    //    // NOTE: if you want to ignore it, just call "part.resume()"
                    //
                    //    if (!part.filename) {
                    //        // filename is not defined when this is a field and not a file
                    //        console.log('got field named ' + part.name);
                    //        // ignore field's content
                    //        part.resume();
                    //    }
                    //
                    //    if (part.filename) {
                    //        // filename is defined when this is a file
                    //        count++;
                    //        console.log('got file named ' + part.name);
                    //        // ignore file's content here
                    //        part.resume();
                    //    }
                    //
                    //    part.on('error', function(err) {
                    //        // decide what to do
                    //    });
                    //});
                    //form.on('close', function() {
                    //    console.log('Upload completed!');
                    //    //res.setHeader('text/plain');
                    //    //res.end('Received ' + count + ' files');
                    //});
                    //console.log(form.parse);
                    console.log(req);
                    form.parse(req, function(err, fields, files) {
                        //console.log(files);
                        //console.log(files.path);
                        //同步重命名文件名
                        //fs.renameSync(files.path,files.originalFilename);
                        res.writeHead(200, {'content-type': 'text/plain'});
                        res.write('received upload:\n\n');
                        res.end(util.inspect({fields: fields, files: files}));
                        //res.end();
                    });
                }
                return;
            }
        }
        app.router(req.method.toLowerCase(),pathN,req,res);
    }
}).listen(port);
console.log("listening "+port);
