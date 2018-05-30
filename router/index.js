/**
 * Created by orionwei on 2017/1/26.
 */
'use strict';

const fs = require('fs');
const zlib = require("zlib");
const header = require("./lib/header");
const http = require('http');
const url = require('url');
const path = require("path");
const querystring = require('querystring');
// const multiparty = require("multiparty");
const util = require("util");

let routerpool = {};
let lastModified;
// let compress = /css|js|html/ig;
const headers = {
    fileMatch: /^(gif|png|jpg|js|css|html)$/ig,
    maxAge: 60 * 60
};
const routerInit = function(url, pool){
    if(!pool[url]){
        pool[url] = {};
        pool[url]["method"] = {};
    }
};
const routerExist = function(str,method){
    if(routerpool[str]){
        if(routerpool[str]["method"][method.toLowerCase()]){
            return routerpool[str]["method"][method.toLowerCase()];
        }
        else{
            return false;
        }
    }
    else{
        return false;
    }
};
const staticFile = function(req,res,pathname,ext){
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
};
const fileExist = function(pathname, existfn, unexistfn){
    fs.exists(pathname, function(exist){
        if(exist){
            existfn();
        }
        else{
            unexistfn();
        }
    })
};
let pool = routerpool;

module.exports  = {
    post: function (str, callback) {
        routerInit(str, pool);
        pool[str]["method"]["post"] = callback;
        return this;
    },
    get: function (str, callback) {
        routerInit(str, pool);
        pool[str]["method"]["get"] = callback;
        return this;
    },
    use: function (str, callback) {
        routerpool[str] = {};
        routerpool[str]["children"] = {};
        pool = routerpool[str]["children"];
        callback();
        pool = routerpool;
        return this;
    },
    router: function (method, str, req, res) {
        let callback;
        let that = this;
        if ((callback = routerExist(str,method))) {
            callback(req,res);
        }
        else {
            fileExist("public/view"+str+"/index.html", function(){
                staticFile(req,res,"public/view"+str+"/index.html","html");
            },function(){
                if(routerpool["/404"]){
                    routerpool["/404"]["method"]["get"](req, res);
                }
                else{
                    res.writeHead(404, "Not found");
                    res.end();
                }
            })
        }
    },
    render: function (req, res, str) {
        const pathname = "view/"+str;
        this.staticFile(req,res,pathname,"html");
    },
    staticFile:function(req,res,str,ext){
        //to Support large files
        const pathname = "public/"+str;
        fileExist(pathname, function(){
            staticFile(req,res,pathname,ext);
        },function(){
            res.writeHead(404,"Not Found");
            res.end();
        });
    },
    update:function(req,res){

    },
    start:function(port){
        let that = this;
        http.createServer(function(req, res){
            let pathname = url.parse(req.url);
            let pathN = pathname.pathname;
            let ext = path.extname(pathN);
            let headers = {
                fileMatch: /^(gif|png|jpg|js|css|html)$/ig,
                maxAge: 60 * 60
            };
            ext = ext ? ext.slice(1) : 'unknown:';
            if (ext.match(headers.fileMatch)) {
                this.staticFile(req,res,pathN,ext);
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
                    let postData = "",params;
                    req.addListener("data", function (postDataChunk) {
                        postData += postDataChunk;
                    });
                    req.addListener("end", function () {
                        params = querystring.parse(postData);
                        req.query = params;
                        that.router(req.method.toLowerCase(),pathN,req,res);
                    });
                }
                that.router(req.method.toLowerCase(),pathN,req,res);
            }
        }).listen(port);
        console.log("listening "+port);
    }
};