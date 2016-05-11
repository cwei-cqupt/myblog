/**
 * Created by orionwei on 2016/5/11.
 */
var app = require('./router');
app.get("/",function(req,res){
    app.render(req,res,'index.html');
});
app.get("/a",function(req,res){
    res.send({a:1},'json');
});
app.get("/404",function(req,res){
    app.render(req,res,"404.html");
});