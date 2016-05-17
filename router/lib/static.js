/**
 * Created by orionwei on 2016/5/16.
 */
var fs = require("fs");

var static = /\./;
var staticSheetstyles = /.css/;
var staticJavascripts = /.js/;
exports.isStatic = function(path){
    return static.test(path);
};
exports.find = function (req,res,path) {
    if (staticSheetstyles.test(path)){
        file(path,res,'stylesheet');
    }
    else if (staticJavascripts.test(path)){
        file(path,res,'javascript');
    }
    else{
        file(path,res,'image')
    }
};
function file(pathname,res,str){
    var path = "public/" + str + "s" + pathname;
    fs.exists(path,function(data){
        if(data){
            fs.readFile(path,function(err,data){
                if(err) {
                    res.writeHead(404);
                    res.end();
                }
                else{
                    res.writeHead(200,{'content-Type':switchC(str)});
                    res.end(data);
                }
            })
        }else{
            res.writeHead(404);
            res.end();
        }
    })
}
function switchC(str){
    switch(str){
        case "stylesheet":
            return "text/css";
        case "javascript":
            return "text/javascript";
        default:
            return "image";
    }
}