---
title: 读koa源码
date: 2018-10-16 17:48:55
categories: 技术
tags: nodejs
---
在yy了一番koa设计思想过后，终于开始读koa的源码，浅析如下
<!--more-->
# 文件结构
源码相关的一共只有五个文件:
```
---index.js
  |---application.js
  |---request.js
  |---response.js
  |---context.js
```
源码在github中可以看到,有四个文件夹,分别为:
## benchmarks
这个文件夹中的js文件看起来像是一个简单的例子,为同步和异步调用中间件提供了例子.
## doc
里面是一些md文档,主要应该就是介绍koa的,跳过
## lib
里面有四个文件
### application.js
从外部依赖开始说吧:

1. on-finished: res,req的监听,包括错误处理等.
2. *compose: koa的运行中间件的函数
```
function compose (middleware) {
  if (!Array.isArray(middleware)) throw new TypeError('Middleware stack must be an array!')
  for (const fn of middleware) {
    if (typeof fn !== 'function') throw new TypeError('Middleware must be composed of functions!')
  }

  /**
   * @param {Object} context
   * @return {Promise}
   * @api public
   */

  return function (context, next) {
    // last called middleware #
    let index = -1
    return dispatch(0)
    function dispatch (i) {
      if (i <= index) return Promise.reject(new Error('next() called multiple times'))
        index = i
      let fn = middleware[i]
      if (i === middleware.length) fn = next
      if (!fn) return Promise.resolve()
      try {
        return Promise.resolve(fn(context, dispatch.bind(null, i + 1)));
      } catch (err) {
        return Promise.reject(err)
      }
    }
  }
}
```
这段代码看起来emmm比较简单.
3. statuses: http状态码的库,大概就是输入各种错误,返回int型的http status code.
4. only: 传入:obj,array or ...str 返回: obj
5. convert: 主要是把generator function转为async/await function.构思很独特,学到很多.

上面是一些我觉得有关于代码的依赖,其他的依赖大多是log和错误处理.

下面开始进入看源码环节:

首先是koa对整个application的构建
```
module.exports = class Application extends Emitter {
}
```
application类继承node的原生event模块,所以可以做异步的处理,不过目前还没有想到为什么要这样做,继续向下看.
```
constructor() {
  super();

  this.proxy = false;
  this.middleware = [];
  this.subdomainOffset = 2;
  this.env = process.env.NODE_ENV || 'development';
  this.context = Object.create(context);
  this.request = Object.create(request);
  this.response = Object.create(response);
  if (util.inspect.custom) {
    this[util.inspect.custom] = this.inspect;
  }
}
```
这部分是定义一些变量.
```
listen(...args) {
  debug('listen');
  const server = http.createServer(this.callback());
  return server.listen(...args);
}
```
这部分是log出正在监听端口以及将server对象返回.
```
toJSON() {
  return only(this, [
        'subdomainOffset',
        'proxy',
        'env'
  ]);
}
inspect() {
  return this.toJSON();
}
```
这样做的原因可能是emmm,要暴露出去的一些参数,防止外部修改内部的参数吧.目前能想到的作用大概就是这样,毕竟obj是引用类型.后续遇到真正使用到的地方如果有其他作用会标注出来.
```
use(fn) {
  if (typeof fn !== 'function') throw new TypeError('middleware must be a function!');
  if (isGeneratorFunction(fn)) {
    deprecate('Support for generators will be removed in v3. ' +
              'See the documentation for examples of how to convert old middleware ' +
              'https://github.com/koajs/koa/blob/master/docs/migration.md');
    fn = convert(fn);
  }
  debug('use %s', fn._name || fn.name || '-');
  this.middleware.push(fn);
  return this;
}
```
判断是不是函数以及将generator function转为async/await函数.

链式调用
```
callback() {
  const fn = compose(this.middleware);

  if (!this.listenerCount('error')) this.on('error', this.onerror);

  const handleRequest = (req, res) => {
    const ctx = this.createContext(req, res);
    return this.handleRequest(ctx, fn);
  };

  return handleRequest;
}
handleRequest(ctx, fnMiddleware) {
  const res = ctx.res;
  res.statusCode = 404;
  const onerror = err => ctx.onerror(err);
  const handleResponse = () => respond(ctx);
  onFinished(res, onerror);
  return fnMiddleware(ctx).then(handleResponse).catch(onerror);
}
createContext(req, res) {
  const context = Object.create(this.context);
  const request = context.request = Object.create(this.request);
  const response = context.response = Object.create(this.response);
  context.app = request.app = response.app = this;
  context.req = request.req = response.req = req;
  context.res = request.res = response.res = res;
  request.ctx = response.ctx = context;
  request.response = response;
  response.request = request;
  context.originalUrl = request.originalUrl = req.url;
  context.state = {};
  return context;
}
onerror(err) {
  if (!(err instanceof Error)) throw new TypeError(util.format('non-error thrown: %j', err));

  if (404 == err.status || err.expose) return;
  if (this.silent) return;

  const msg = err.stack || err.toString();
  console.error();
  console.error(msg.replace(/^/gm, '  '));
  console.error();
}
```
这一大段函数最后整理一下其实就是http.createServer里面最终调用的是compose(middleware)(ctx).then(respond(ctx)).
```
function respond(ctx) {
  // allow bypassing koa
  if (false === ctx.respond) return;

  const res = ctx.res;
  if (!ctx.writable) return;

  let body = ctx.body;
  const code = ctx.status;

  // ignore body
  if (statuses.empty[code]) {
    // strip headers
    ctx.body = null;
    return res.end();
  }

  if ('HEAD' == ctx.method) {
    if (!res.headersSent && isJSON(body)) {
      ctx.length = Buffer.byteLength(JSON.stringify(body));
    }
    return res.end();
  }

  // status body
  if (null == body) {
    body = ctx.message || String(code);
    if (!res.headersSent) {
      ctx.type = 'text';
      ctx.length = Buffer.byteLength(body);
    }
    return res.end(body);
  }

  // responses
  if (Buffer.isBuffer(body)) return res.end(body);
  if ('string' == typeof body) return res.end(body);
  if (body instanceof Stream) return body.pipe(res);

  // body: json
  body = JSON.stringify(body);
  if (!res.headersSent) {
    ctx.length = Buffer.byteLength(body);
  }
  res.end(body);
}
```
返回数据,至此一次http请求就结束了.
### context.js&request.js&response.js

看起来不是很复杂.

context里面运用到了delegates这个库,在github中看到源码,其实就是对两个传入的对象做深拷贝.

request和response中主要是对request和response对象做各种各样的操作.

看起来不是很复杂,不过需要对整个项目都有很深入的了解,知道在什么地方需要用到什么样子的数据,所有还是有一些复杂的.

# 读后感
并没有看到整个app做异步操作的代码,可能是由于本人水平有限,或者还有后续的更新迭代会用到.

整个系统设计的异常简洁,省去了很多很多的东西,如静态资源的管理,url的解析等.

整体的流程就是
```
request->create context&req&res->run(middleware)->return
```
所以无论想要加入什么功能,都需要加入相对应功能的middleware.

这也是koa轻量的原因.

这次源码阅读没有消耗很长时间,但是学到了一些奇淫技巧.相对于一些非常复杂的框架,这个框架很适合新手阅读.

end!
cheers~
