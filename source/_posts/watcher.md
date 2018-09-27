---
title: 观察者模式js实现
date: 2018-10-22 15:42:44
categories: 技术
tags: ['nodejs','JavaScript']
---
在程序设计中有很多的设计模式,其中有一种设计模式叫做观察者模式,又被称为订阅-发布模式.
<!--more-->
在前端开发过程中,观察者模式应该是一定会碰到的,dom的eventlistener就是使用的观察者模式.

在我的个人理解中,项目中引入观察者模式的好处就是:

1.解耦合

2.易扩展

每个函数只需要专注于自己需要实现的功能,不需要关心在某些条件下需要调用的函数等.只需要触发事件就可以了.

话不多说,上代码
```JavaScript
export default function Watcher(){
    this.center = {};
}

Watcher.prototype.on = function(name, callback){
    if(!this.center[name])
        this.center[name] = [];
    this.center[name].push(callback);
    return this.center.length - 1;
}

//我觉得使用array作为args更好
Watcher.prototype.trigger = function(name, args, obj){
    this.center[name].foreach((fn)=>{
        fn.apply(obj || null, args)
    })
}

//on返回的index就是这里需要传入的index
Watcher.prototype.removeListener = function(name, index){
    this.center[name].splice(index, 1);
}
```
以上就是一个非常非常简单的观察者模式的小插件.

目前前端开发的框架中有很多都是用了观察者模式,比如vue,angular等mvvm框架.

下一步准备研究一下vdom以及diff算法.

cheers!
