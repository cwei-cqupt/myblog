/**
 * Created by orionwei on 2016/5/11.
 */
var app = require('./lib/router');
var getArticle = require('./lib/getArticle');


app.get("/",function(req,res){
    app.render(req,res,'index.html');
});
app.get("/myblog",function(req,res){
    app.render(req,res,'myblog.html');
});
app.get("/article",function(req,res){

    app.render(req,res,'article.html',{});
});
app.get("/404",function(req,res){
    app.render(req,res,"404.html",{express:1});
});
app.post("/a",function(req,res){
    res.send({a:2},'json');
});
