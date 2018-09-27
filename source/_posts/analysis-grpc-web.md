---
title: grpc-web来了!
date: 2018-10-29 13:46:14
categories: 技术
tags: ["grpc", "JavaScript", "web", "http2"]
---
几天之前,grpc项目组开源了grpc-web项目.我也在工作之余clone下来自己鼓捣了一下~.

现将一些心得总结如下:
<!--more-->
# 一些基础
在后端开发人员开发过程中如果使用过grpc的话,可能用起来会更加得心应手. 因为在grpc-web中的技术栈基本上和后端的grpc技术栈相同.

协议使用的是http2,传输过程中使用的是protobuf,服务器使用的为nginx(在官方example中使用的是),当然如果喜欢用apache个人觉得也是可以的.
增加的负担也就是重新写一点dockerfile.

在node端使用的脚手架就是npm和webpack,不过在国内我更推荐yarn,毕竟npm经常会build出错...

项目整体是用了docker运行.

以上就是grpc-web的技术栈.
## http2 & protobuf
http2相信大家都不陌生,使用起来的好处有:并发,复用,head体积小等等很多优点.

protobuf是emmm个人感觉像是一种新的高级语言,因为其实protobuf实际使用起来是用protoc命令通过proto文件,生成各种不同语言的文件,再从其他的文件中引入这个包,这个包里面是定义了不同的数据结构.
## npm & webpack
相信大家都不陌生,但是我就比较陌生了,不班门弄斧...
## docker
个人理解是project runtime.运行环境,类似虚拟机.可以自定义很多东西.
# 一些坑
在官方给到的example里面一共有两个:echo/helloworld.

echo就是回声...你发啥就给返回啥.

个人想run起来helloworld的过程中遇到的一些问题总结如下
## 防火墙
这个应该占了很大的一部分.在目前的开发环境就是这样...

### docker-repo中国镜像
地址是: https://registry.docker-cn.com

使用方式为:
```shell
sudo touch /etc/docker/daemon.json &&\
     echo "{\n    "registry-mirrors":["https://registry.docker-cn.com"]\n    }" > /etc/docker/daemon.json &&\
     service docker restart
```
### 使用yarn
在docker build过程中会遇到使用npm作为包管理工具的各种问题,我曾经试过的解决方式有:

1.dns.

2.换源.error:EAI_AGAIN || timeout

3.使用cnpm.error:npm install -g cnpm 出错.

最后不想再折腾了,干脆使用yarn了.

不过建议使用npm安装yarn.因为使用apt安装也会各种出错...
# run helloworld
以上就是需要了解的一些东西,下面就是run起来helloworld的过程:
## 修改dockerfile
需要修改的有 common node-server commonjs-client envoy

具体就是修改路径之类的比较简单的一些东西,需要注意的就是echo使用了webpack打包js文件,但是helloworld没有.所以只需要自己随便写一个js文件引进去打印一个helloworld就可以了.

之后的流程就是 docker-compose build -> docker-compose up -d node-server commonjs-client envoy

# 总结
回话过程就是server->envoy->client,看流程很简单,但是其实很复杂.

grpc-web更改了整个web系统最基本的数据格式:restful

个人觉得想要在grpc-web中使用其他的框架进行开发如vue angular react.一个非常重要的条件就是,必须是spa,或者是ssr项目.

这样可以最小成本的使用grpc-web框架.而且也可以前后端真正的分离开发.

有一些缺点就是目前我还不知道怎么样才能实现hot refresh,不过我觉得应该会考虑到这个,所以会查一下.

考虑到是使用nginx作为服务器,所以目前想到的方法就是使用一个进程监听文件,有更新的话就重新启动server...

cheers!

----------更新----------

使用docker的volume可以进行静态文件的的热更新,具体操作就是在docker-compose.yml文件中commonjs-client加入:
```
  volumes:
    - ./net/grpc/gateway/example/helloworld:/var/www/html
    - ./net/grpc/gateway/example/helloworld:/var/www/dist
```
