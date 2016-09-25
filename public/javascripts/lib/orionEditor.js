/**
 * Created by orionwei on 2016/5/26.
 */
'use strict';
//jquery 命名空间。只暴露出一个OrionEditor。保证一些私有方法不会和其他人的代码冲突
(function( global, factory ) {
    //应该是为了可以应用在requirejs等库中
    if ( typeof module === "object" && typeof module.exports === "object" ) {
        // For CommonJS and CommonJS-like environments where a proper window is present,
        // execute the factory and get jQuery
        // For environments that do not inherently posses a window with a document
        // (such as Node.js), expose a jQuery-making factory as module.exports
        // This accentuates the need for the creation of a real window
        // e.g. var jQuery = require("jquery")(window);
        // See ticket #14549 for more info
        module.exports = global.document ?
            factory( global, true ) :
            function( w ) {
                if ( !w.document ) {
                    throw new Error( "orionEditor requires a window with a document" );
                }
                return factory( w );
            };
    } else {
        //无模块环境时
        factory( global );
    }

// Pass this if window is not defined yet
}(typeof window !== "undefined" ? window : this, function(window, noGlobal){
    var isShow = false,control;
    var OrionEditor = function(id){
        this.obj = document.getElementById(id);
    };
    var menu,bom = navigator.userAgent;
    Element.prototype.append=function (str, obj, fn) {
        var object = document.createElement(str);
        object = each(obj, object);
        this.appendChild(object);
        if(fn)
            fn(object);
        return this;
    };
    Element.prototype.css=function (attr) {
        if (this.currentStyle) {
            return this.currentStyle[attr];
        } else {
            return getComputedStyle(this, false)[attr];
        }
    };
    Element.prototype.appendC=function(str, obj, fn){
        var object = document.createElement(str);
        object = each(obj, object);
        this.appendChild(object);
        if(fn)
            fn(object);
        return object;
    };
    Object.prototype.forEach = function(fn){
        for(var index in this){
            if(typeof this[index] !== 'function'){
               fn(index);
            }
        }
    };
    Element.prototype.addListener = function(str,fn,boolean){
        if(isNaN(parseInt(this.length))) {
            if(this.addEventListener){
                this.addEventListener(str,fn,boolean||false);
            }else{
                this.attachEvent(str,fn);
            }
        }else if(this.length > 0){
            this.forEach(function(that){
                if(this.addEventListener){
                    that.addEventListener(str,fn,boolean||false);
                }else{
                    that.attachEvent(str,fn);
                }
            })
        }
        return this;
    };
    Element.prototype.animate = function(obj,danwei){
        var that = this;
        obj.from.forEach(function(index){
            that.style[index] = obj.from[index];
            animate(that.style[index],obj.to[index],function(n){
                that.style[index] = n+danwei||px;
            })
        });

    };
    Element.prototype.fade = function(){
        var that = this;
        if(this.css("display") === "none"){
            this.style.display = "block";
            animate(0,100,function(n){
                that.style.opacity = n/100;
            })
        }else if(this.css("display") === "block"){
            animate(50,0,function(n){
                that.style.opacity = n/50;
            },function(){
                that.style.display = "none";
            })
        }
    };
    function animate(from,to,fn,cb){
//      var requestAnimationFrame = window.requestAnimationFrame||window.mozRequestAnimationFrame||window.webkitRequestAnimationFrame;
        var n = parseInt(from);
        var t = parseInt(to);
        var timer;
        function v(){
            clearTimeout(timer);
            fn(n);
            if(n > t) {
                n--;
                timer = setTimeout(v,1);
            }
            else if(n < t) {
                n++;
                timer = setTimeout(v,1);
            }
            else{
                if(cb){
                    cb();
                }
            }
        }
        v();
    }
    //deep traversal;
    function each(obj,object){
        for(var prototype in obj){
            if(typeof obj[prototype] === "string")
                object[prototype] = obj[prototype];
            else if(typeof obj[prototype] === "object"){
                each(obj[prototype],object[prototype]);
            }
        }
        return object;
    }
    // the same insert so abstract a fn
    function append(object,str,obj) {
        object.appendC(str, obj).addListener("keyup", function (event) {
            var e = event || window.event;
            if (e.keyCode === 8) {
                if (this.innerHTML === "") {
                    this.innerHTML = "<p  style='margin:0'><br></p>"
                }
            }
        }).appendC("p", {
            style: {
                margin: "0"
            }
        }).appendC("br");
        return object;
    }
    function getxy(first, number, size, width, height){
        if(bom.indexOf("MSIE") >= 0||bom.indexOf("Trident") >= 0){
            return {
                x:first*size*4/3+number*size*4/6-(width/2),
                y:height+15
            }
        }
        else{
            return {
                x:first*size+number*size/2-(width/2),
                y:height+15
            }
        }

    }
    function getByteLen(val) {
        var len = 0,valen = val.length;
        for (var i = 0; i < valen; i++) {
            if (val[i].match(/[^x00-xff]/ig) != null) //全角
                len += 2;
            else
                len += 1;
        }
        console.log(len);
        return len/2;
    }
    OrionEditor.prototype = {
        initEditor:function(obj){
            var object = obj?obj:{control:false};
            object.control = !object.control?object.control:true;
            if(object.control){
                this.obj.style.border="1px solid #c4c6c4";
                this.control(object);
                this.textArea(object);
                this.moreEditor();
            }
            else{
                this.textArea(object);
                this.editor();
            }
            this.obj.oncontextmenu = function(){
                return false;
            };
        },
        control:function(object){
            var initData = {
                className:"controller",
                style:{
                    minHeight:"40px",
                    width:"100%"
                }
            };
            if(object.control){
                initData.style.borderBottom = "1px solid #C4C6C4"
            }
            append(this.obj,"div",initData);
        },
        textArea:function(object){
            var initData = {
                className:"view",
                contentEditable:"true",
                style:{
                    overflowY:"auto",
                    outline:"none",
                    padding:"10px",
                    height:parseInt(this.obj.css("height"))-40+"px",
                    width:"100%",
                    boxSizing:"border-box",
                    fontFamily:"Simsun"
                }
            };
            if(!object.control){
                initData.style.borderTop = "1px solid #C4C6C4";
                initData.style.borderBottom = "1px solid #C4C6C4";
                append(this.obj,"div",{
                    className:"title",
                    contentEditable:"true",
                    style:{
                        lineHeight:"50px",
                        paddingLeft:"10px",
                        fontWeight:"900",
                        outline:"none",
                        height:"50px",
                        borderTop:"1px solid #C4C6C4",
                        fontSize:"20px",
                        overflow:"hidden"
                    }
                }).addListener("mousedown",function(event){
                    if(typeof menu === typeof undefined){
                        menu = document.getElementById("contextMenu");
                    }
                    var e = event||window.event;
                    if(e.target.className === "view"){
                        if(e.button === 2){
                            menu.style.left = e.clientX+"px";
                            menu.style.top = e.clientY+"px";
                            menu.style.display = "none";
                            menu.fade();
                            isShow = true;
                        }
                    }
                    if(e.button === 0){
                        if(isShow){
                            menu.fade();
                            isShow = false;
                        }
                    }
                });
            }
            append(this.obj,"div",initData).append("div",{
                className:"control",
                style:{
                    backgroundColor:"black",
                    height:"40px",
                    width:"100px",
                    position:"absolute",
                    display:"none"
                }
            }, function(el){
                control = el;
            }).addListener("mouseup",function(event){
                var e = event || window.event,a, fontSize,xy;
                if(e.button === 0){
                    if(window.getSelection) {
                        a= window.getSelection();
                    } else {
                        a = document.selection.createRange().text;
                    }
                    fontSize = parseInt(a.focusNode.parentNode.css("fontSize"));
                    if(!a.isCollapsed&&a.anchorNode.data!==undefined){
                        if(a.anchorOffset > a.focusOffset){
                            xy = getxy(getByteLen(a.anchorNode.data.substr(0,a.focusOffset)), getByteLen(a.anchorNode.data.substr(a.focusOffset,a.anchorOffset-a.focusOffset)), fontSize, 100, 40)
                        }else{
                            xy = getxy(getByteLen(a.anchorNode.data.substr(0,a.anchorOffset)), getByteLen(a.anchorNode.data.substr(a.anchorOffset,a.focusOffset-a.anchorOffset)), fontSize, 100, 40)
                        }
                        console.log(a.focusNode.parentNode.css("fontFamily"));
                        control.style.left = a.focusNode.parentNode.offsetLeft+xy.x+"px";
                        control.style.top = a.focusNode.parentNode.offsetTop-xy.y+"px";
                        control.fade();
                    }
                }

            }).appendC("input",{
                id:"contextMenu",
                type:"file",
                style:{
                    overflow:"hidden",
                    outline:"none",
                    backgroundColor:"rgba(0,0,0,0)",
                    paddingTop:"50px",
                    boxSizing:"border-box",
                    backgroundImage:"url('../images/insertImg.jpg')",
                    backgroundSize:"50px 50px",
                    height:"50px",
                    width:"50px",
                    position:"absolute",
                    display:"none"
                }
                //for update images
            }).addListener('mousedown',function(event){
                var e = event||window.event;
                e.stopPropagation();
                //this.style.display = 'none';
            }).addListener('click',function(){
                this.style.display = "none";
            }).addListener("change",function(){
                console.log(this.files[0]);
                var files = new FormData();
                files.append("userfiles",this.files[0]);
                orion.ajax("/addArticle",'post',files,function(data){
                    console.log(data)
                },function(xml){
                    xml.setRequestHeader("content-Type","multipart/form-data");
                    xml.setRequestHeader("charset","utf-8");
                })
            });
        },
        moreEditor:function(){

        },
        editor:function(){

        }
    };
    if(window.getSelection()){

    }
    if ( typeof noGlobal === typeof undefined ) {
        window.OrionEditor = OrionEditor;
    }
    return window.OrionEditor = OrionEditor
}));