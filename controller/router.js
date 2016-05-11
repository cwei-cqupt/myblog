/**
 * Created by orionwei on 2016/5/11.
 */
var fs = require('fs');
var getArr = [],
    postArr = [],
    getFn = [],
    postFn = [];
var app = {
    post:function(str,callback){
        postArr.push(str);
        postFn.push(callback);
    },
    get:function(str,callback){
        getArr.push(str);
        getFn.push(callback);
    },
    router:function(str,req,res){
        if(getArr.indexOf(str) > -1){
            getFn[getArr.indexOf(str)](req,res);
        }else{
            getFn[getArr.indexOf('/404')](req,res);
        }
    },
    render:function(req,res,str){
        res.writeHead(200,{'content-Type':'text/html'});
        fs.readFile('view/'+str,function(err,data){
            if(err){
                console.log(err);
            }
            else
                res.end(data);
        });
    }
}
module.exports = app;