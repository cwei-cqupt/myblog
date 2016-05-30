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
    var OrionEditor = function(id){
        this.obj = document.getElementById(id);
    };
    var menu;
    Element.prototype.append=function (str, obj) {
        var object = document.createElement(str);
        object = each(obj, object);
        this.appendChild(object);
        return this;
    };
    Element.prototype.css=function (attr) {
        if (this.currentStyle) {
            return this.currentStyle[attr];
        } else {
            return getComputedStyle(this, false)[attr];
        }
    };
    Element.prototype.appendC=function(str, obj){
        var object = document.createElement(str);
        object = each(obj, object);
        this.appendChild(object);
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
    Element.prototype.fadeIn = function(){
        var that = this;
        animate(0,100,function(n){
            that.style.opacity = n/100;
        })
    };
    function animate(from,to,fn){
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
        }
        v();
    }
    //深层遍历
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
                    boxSizing:"border-box"
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
                    if(e.button === 2){
                        menu.style.left = e.clientX+"px";
                        menu.style.top = e.clientY+"px";
                        //menu.animate({
                        //    from:{
                        //        opacity:"0"
                        //    },
                        //    to:{
                        //        opacity:"1"
                        //    }
                        //});
                        menu.fadeIn();
                        menu.style.display = 'block';
                    }else if(e.button === 0){
                        menu.style.display = "none";
                    }
                });
            }
            append(this.obj,"div",initData).appendC("input",{
                id:"contextMenu",
                type:"file",
                style:{
                    overflow:"hidden",
                    outline:"none",
                    backgroundColor:"rgba(0,0,0,0)",
                    paddingTop:"50px",
                    boxSizing:"border-box",
                    backgroundImage:"url('../../public/images/insertImg.jpg')",
                    backgroundSize:"50px 50px",
                    height:"50px",
                    width:"50px",
                    position:"absolute",
                    display:"none"
                }
            }).addListener('mousedown',function(event){
                var e = event||window.event;
                e.stopPropagation();
            });
        },
        moreEditor:function(){

        },
        editor:function(){

        }
    };
    if ( typeof noGlobal === typeof undefined ) {
        window.OrionEditor = OrionEditor;
    }
    return window.OrionEditor = OrionEditor;
}));

