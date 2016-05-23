/**
 * Created by orionwei on 2016/5/11.
 */
var fs = require('fs');
var routerpool = {
    getArr:[],
    postArr:[],
    getFn:[],
    postFn:[]
};
var app = {
    post: function (str, callback) {
        push('postArr', 'postFn', str, callback);
    },
    get: function (str, callback) {
        push('getArr', 'getFn', str, callback);
    },
    router: function (method, str, req, res) {
        console.log(routerpool);
        var index = routerpool[method+"Arr"].indexOf(str);
        var fn = routerpool[method + "Fn"][index];
        if (index > -1) {
            fn(req, res);
        }
        else {
            routerpool.getFn[routerpool.getArr.indexOf("/404")](req, res);
        }
    },
    render: function (req, res, str) {
        fs.readFile('view/' + str, function (err, data) {
            if (err) {
                console.log(err);
                res.writeHead(404);
            }
            else{
                res.writeHead(200, {'content-Type': 'text/html'});
                res.end(data);
            }

        });
    }
};
function push(arr1,arr2,str,fn){
    routerpool[arr1].push(str);
    routerpool[arr2].push(fn);
}
module.exports = app;
