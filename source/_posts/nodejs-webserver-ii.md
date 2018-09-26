---
title: 基于nodejs的web server II
date: 2017-01-26 20:57:46
categories: 技术
tags: nodejs
---
在写上一篇博客的过程中，一边思考一边进行整体框架的构思，感觉思路很清晰，于是这几天过年的事情忙完了之后在今天下午进行了webserver的改进。

比如对routepool数据结构的改进，对流程的进一步完善。

<!--more-->

### 路由流程的完善

目前这个hexo的博客还是部署在github上，但是github的空间只有300m，如果以后一直写的话总会有一天空间不够，所以肯定是需要将博客部署到自己的服务器上面。这样的话就需要了解一下hexo的访问方式。

hexo的博客编写起来结构有一些复杂，需要解析markdown进行html的生成。但是这部分我暂时还没有研究到，只是看了一下文件结构，感觉博客的主体思想就是使用模板，将markdown中的内容解析到模板当中，至于具体是如何生成暂时还没有了解。但是整体的思想了解了之后就知道如何将hexo生成的文件放在自己的服务器上能够被用户访问到。

简单来说，想要实现上述效果只是需要在路由时进行静态资源的判断。也就是访问到路径所指向的文件夹时进行一次index.html是否存在的判断。

由于在流程中多次需要用到文件存在的判断以及静态资源的读取，返回。所以将这两个环节抽象为两个函数。
```javascript
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
```

### 路由流程的控制

编写完静态资源以及判断文件是否存在方法之后就要进行流程的控制了，代码如下：
```javascript
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
        that.router(req.method.toLowerCase(),pathN,req,res);
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
}
```
这部分代码用于路由流程的控制，以及将get，post请求所发送的数据分别解析出来，get请求大部分情况下是在url中添加数据，而post请求则需要进行监听，因为是分段发送，至于为什么post请求是分段发送，我在百度中没有找到靠谱的答案，面试中也有被问到过，答得也不是特别满意，如果有知道的同学可以在下面留言，感谢。

### routepool数据结构的设定

routepool是路由的根本，所以，将routepool设为私有属性，app的get,post,use方法的作用相当于routepool的setter，而app.route则相当于routepool的getter。
```javascript
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
let routerpool = {};
let pool = routerpool;
app = {
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
}
```
目前use方法只能添加一层，且暂时没有添加通配符功能，通配符功能感觉有一些复杂，但是添加的话也应该是在router中进行添加路由匹配的另一种规则。

以上就是我对于web server的一些尝试，欢迎感兴趣的同学一起来讨论。感谢阅读

cheers！