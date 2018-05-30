/**
 * Created by orionwei on 2016/5/11.
 */
var app = require('./index');
//var article = require('./lib/mongodb');
var fs = require("fs");
var exec = require('child_process').exec;

app.get("/",function(req,res){
    app.render(req,res,'index.html');
})
.get("/myblog",function(req,res){
    app.render(req,res,'myblog.html');
})
.get("/article",function(req,res){
    app.render(req,res,'newArticle.html',{});
})
.get('/test', function(req, res) {
    app.render(req, res, 'test.html');
})
.post("/addArticle",function(req,res){
    //req.once('data',function(data){
    //    //console.log(data);
    //    var write = fs.createWriteStream("public/image/a.pdf");
    //    write.write(data);
    //    write.end();
    //    res.send({
    //        url:"a"
    //    },'json')
    //});
    //var write = fs.createWriteStream("public/image/a.pdf");
    //console.log(req.query);
    //var buffer = new Buffer(req.query);
    //write.write(buffer);
    //write.end();
    res.send({url:"public/image/a.pdf"},'json');
})
.get("/404",function(req,res){
    app.render(req,res,"404.html",{express:1});
})
.post("/a",function(req,res){
    res.send({a:2},'json');
})
.get('/haveatry', function(req,res) {
    res.send({v:3},'json');
})
.post('/reloadserver', function(req,res){
    console.log(req.query);
    fs.writeFile('test.sh','#!bin/sh\necho \''+req.query.config+'\'', function() {
        var std = exec('sh test.sh');
        var dataresend = '';
        std.stdout.on('data', function(data) {
            dataresend += data
        });
        std.on('exit', function(code) {
            res.send({data:dataresend},'json');
        });
    });
})
.post("/?", function(req, res){
    console.log(req.query);
});
app.start(3000);
