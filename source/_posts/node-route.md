---
title: 基于nodejs的web server
date: 2017-01-23 09:35:45
categories: 技术
tags: nodejs
---

有的同学可能很不理解，明明有那么多好用的nodejs的框架，你为什么要自己写一个，况且你写的肯定没有那些框架的用起来稳定，也没有那么舒服。

原因很简单，那次鹅厂的实习生面试，二面时面试官说用express做的后端没有什么技术含量。我觉得很有道理，想了很久什么样的框架用起来有技术含量。最后决定自己写一个。在写本篇博客过程中也重新梳理了一番思路，并对一些功能进行修改，在之后我会对框架进行修改。

这篇博客中代码不会有很多，还有很多的地方只是一些思想而已，目前并没有抽象为代码。不说闲话，上干货

<!--more-->

### router整体思路

现在在网上有很多的简单运行一个http server的demo
```javascript
var http = require("http");

http.createServer(function(req,res){
    res.write("hello world");
    res.end();
}).listen(3000);
```
大概就是这样，这个很简单，但是如果想要自己来写一个server的话这些还远远不够。

首先要知道，nodejs是事件驱动模型，也就是每当有一个请求到了监听的端口时，都会运行一次httpserver回调函数的代码，所以我们可以根据这个进行路由的分发。

那么路由的分发也会分成几个部分，比如想要托管一部分的静态资源，并且进行缓存的控制，如访问某一个文件夹时自动返回index.html文件等简单功能，另外的就是通过自定义接口 比如
```javascript
app.get("url",function(req,res){
    res.writeHead(200);
    res.end();
});
```
这个就需要自己来编写对应的一些代码。还有一些功能就不一一列举了。

### 路由分发

![路由分发](/img/20170123_1.svg)

路由分发最基本的操作就是url的解析，这个有原生的url模块支撑，具体用法为   
```javascript
url.parse(req,url);
```
分为两部分：

 - 静态资源

 可能有的同学会很不理解，静态资源的托管不是应该给服务器做的东西么，我从前知道的所有后端只需要配置跟文件目录就可以了。这个就是不同语言的不同之处了。node的httpserver是直接监听的端口，而静态资源究其根本也是一个get请求。所以这个也需要进行路由的分发，只不过是将静态资源的请求分发到同一个接口进行处理。

 具体的操作是将解析后的url进行正则匹配判断是否为静态资源，如果是静态资源的话就使用req，res作为参数传到另外一个函数中进行操作。

 在另外一个函数中进行资源的查找，分别判断是否存在（fs.exists），以及客户端资源是否与本地资源相同（fs.stat）也就是判断是否应该返回304.

 - 自定义接口

 这部分算是重头戏了，因为这才是我们做路由所需要的最多的地方。这部分的流程图如下

 ![自定义接口](/img/20170123_2.svg)

 以前遇到过有个同学对这个流程有一些质疑，因为看起来这个流程有一些复杂，每次都要进行很多的判断，而且看起来和静态资源托管部分有重复。

 这部分有一个优先级问题，我认为自定义接口优先级大于静态资源，所以这部分我的做法是这样的，也可以每次先进行静态资源的判断，即为

 ![另一种方法](/img/20170123_3.svg)

 如果两种方法都想要用的话就可以通过进行一些参数的设置进行更改不同的流程，这个应该比较简单了。

 ---
 接下来是自定义接口的定义，存储以及匹配问题，我个人在最开始的时候想到的方法是通过两个数组进行存储，当然这个方法很不稳定，经常会有出错的时候，大致就是接口的key,value在不同数组分别存储，然后通过array.indexOf进行判断key是否存在以及value的提取。

 但是因为上述方法在实际测试中很不稳定，所以在当时重新梳理了一番思路，使用了另外一种方法，也就是key:value形式，使用object进行存储。这个方法还有一种好处就是可以很简单的实现app.use方法。

 具体的数据形式就是
```javascript
routerpool{
  "url":{
    method:{
      "get":function,
      "post":function
    }
  }
  "url2":{
    method:{
      "get":function,
      "post":function
    }
    children:{
      "1":{
        method:{
          "get":function,
          "post":function
        }
      }
    }
  }
}
```

 上面的就是通过

 ```javascript
 app.get("url", function(req,res){});
 app.post("url", function(req,res){});
 app.get("url2", function(req,res){});
 app.post("url2", function(req,res){});
 app.use("url2", function(req,res){
    app.get("1", function(req,res){});
    app.post("1", function(req,res){});
 })
 ```
 所构造的数据格式。实际访问的就是"url","url2/1"。这两个地址，通过不同的方法访问会有不同的代码。

 判断是否存在接口就是用routerpool[url][method][req.method]判断是否存在，以及通过调用的方法不同进行fucntion的选择。

 ---

 以上就是当前我对自己写httpserver的一些思想，心得，理解。感谢阅读

 cheers！