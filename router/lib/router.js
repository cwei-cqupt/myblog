/**
 * Created by orionwei on 2016/5/11.
 */
const fs = require('fs');
const zlib = require("zlib");
const header = require("./header");

let routerpool = {};
let lastModified;
// let compress = /css|js|html/ig;
const headers = {
    fileMatch: /^(gif|png|jpg|js|css)$/ig,
    maxAge: 60 * 60
};
const app = {
    post: function (str, callback) {
        routerpool[str] = callback;
        return this;
    },
    get: function (str, callback) {
        routerpool[str] = callback;
        return this;
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
        const pathname = "public/view/"+str;
        fs.stat(pathname, function (err, stat) {
            if(err){
                console.log(err);
            }else{
                let raw = fs.createReadStream(pathname);
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
        const pathname = "public/"+str;
        fs.exists(pathname,function(exists){
            if(!exists){
                res.writeHead(404,"Not Found");
                res.end();
            }else{
                let raw = fs.createReadStream(pathname);
                let acceptEncoding = req.headers['accept-encoding'] || "";
                let matched = ext.match(headers.fileMatch);
                let expires = new Date();
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
    },
    update:function(req,res){

    }
};
module.exports = app;
