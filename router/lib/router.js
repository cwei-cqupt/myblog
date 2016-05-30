/**
 * Created by orionwei on 2016/5/11.
 */
var fs = require('fs');
var zlib = require("zlib");
var header = require("./header");
var routerpool = {

};
var lastModified;
var compress = /css|js|html/ig;
var headers = {
    fileMatch: /^(gif|png|jpg|js|css)$/ig,
    maxAge: 60 * 60
};
var app = {
    post: function (str, callback) {
       routerpool[str] = callback;
    },
    get: function (str, callback) {
        routerpool[str] = callback;
    },
    router: function (method, str, req, res) {
        if (routerpool[str]) {
            routerpool[str](req,res);
        }
        else {
            routerpool["/404"](req, res);
        }
    },
    render: function (req, res, str) {
        var pathname = "public/view/"+str;
        fs.stat(pathname, function (err, stat) {
            if(err){
                console.log(err);
            }else{
                var raw = fs.createReadStream(pathname);
                lastModified = stat.mtime.toUTCString();
                res.setHeader("Last-Modified", lastModified);
                res.setHeader("Cache-Control", "max-age="+headers.maxAge);
                if (req.headers['if-modified-since'] && lastModified == req.headers['if-modified-since']) {
                    res.writeHead(304, "Not Modified");
                    res.end();
                }
                else{
                    raw.pipe(res);
                }
            }
        });
    },
    staticFile:function(req,res,str,ext){
        //to Support large files
        var pathname = "public/"+str;
        fs.exists(pathname,function(exists){
            if(!exists){
                res.writeHead(404,"Not Found");
                res.end();
            }else{
                var raw = fs.createReadStream(pathname);
                var acceptEncoding = req.headers['accept-encoding'] || "";
                var matched = ext.match(headers.fileMatch);
                var expires = new Date();
                console.log(matched[0]);
                expires.setTime(expires.getTime() + headers.maxAge * 1000);
                res.setHeader("Expires", expires.toUTCString());
                res.setHeader("Cache-Control", "max-age=" + headers.maxAge);
                //判断304
                fs.stat(pathname, function (err, stat) {
                    if (err) {
                        console.log(err);
                    } else {
                        lastModified = stat.mtime.toUTCString();
                        res.setHeader("Last-Modified", lastModified);
                        if (req.headers['if-modified-since'] && lastModified == req.headers['if-modified-since']) {
                            res.writeHead(304, "Not Modified");
                            res.end();
                        }
                        //如果不是304
                        else {
                            if (matched && acceptEncoding.match(/\bgzip\b/)) {
                                res.writeHead(200, "Ok", {
                                    'Content-Encoding': 'gzip',
                                    'content-Type':header[matched[0]]
                                });
                                raw.pipe(zlib.createGzip()).pipe(res);

                            } else if (matched && acceptEncoding.match(/\bdeflate\b/)) {
                                res.writeHead(200, "Ok", {
                                    'Content-Encoding': 'deflate',
                                    'content-Type':header[matched[0]]
                                });
                                raw.pipe(zlib.createDeflate()).pipe(res);
                            } else {
                                res.writeHead(200, "Ok",{
                                    'content-Type':header[matched[0]]
                                });
                                raw.pipe(res);
                            }
                        }
                    }
                });
            }
        });
    }
};
module.exports = app;
