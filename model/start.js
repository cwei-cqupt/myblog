/**
 * Created by orionwei on 2016/5/8.
 */
var http = require('http');
var app = require('./router');
require('./../controller/orion');
http.createServer(function(req, res){
    var a = req.url;
    res.send = function(obj,str){
        if(str === 'json'){
            res.writeHead(200,{'content-Type':'application/json'});
            res.end(JSON.stringify(obj));
        }
    };
    app.router(req.url,req,res);
}).listen(3000,'127.0.0.1');
console.log("正在监听3000端口");