/**
 * Created by orionwei on 2016/5/11.
 */
var app = require('./lib/router');
//var article = require('./lib/mongodb');
var fs = require("fs");


app.get("/",function(req,res){
    app.render(req,res,'index.html');
});
app.get("/myblog",function(req,res){
    app.render(req,res,'myblog.html');
});
app.get("/article",function(req,res){

    app.render(req,res,'newArticle.html',{});
});
app.post("/addArticle",function(req,res){
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
});
app.get("/404",function(req,res){
    app.render(req,res,"404.html",{express:1});
});
app.post("/a",function(req,res){
    res.send({a:2},'json');
});
