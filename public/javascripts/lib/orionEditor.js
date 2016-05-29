/**
 * Created by orionwei on 2016/5/26.
 */
'use strict';
Object.prototype.append=function (str, obj) {
    var object = document.createElement(str);
    object = each(obj, object);
    this.appendChild(object);
    return this;
};
Object.prototype.css=function (attr) {
    if (this.currentStyle) {
        return this.currentStyle[attr];
    } else {
        return getComputedStyle(this, false)[attr];
    }
};
Object.prototype.appendC=function(str, obj){
    var object = document.createElement(str);
    object = each(obj, object);
    this.appendChild(object);
    return object;
};
Object.prototype.forEach = function(fn){
    for(var i = 0;i < this.length;i++){
        fn(this[i]);
    }
};
Object.prototype.addListener = function(str,fn,boolean){
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
function append(object,str,obj){
    object.appendC(str,obj).addListener("keyup",function(event){
        var e = event||window.event;
        if(e.keyCode === 8){
            if(this.innerHTML === ""){
                this.innerHTML = "<p  style='margin:0'><br></p>"
            }
        }
    }).appendC("p",{
        style:{
            margin:"0"
        }
    }).appendC("br");
    return object;
}
var OrionEditor = function(id){
    this.obj = document.getElementById(id);
    this.obj.addListener("mousedown",function(event){
        var menu = document.getElementById("contextMenu");
        var e = event||window.event;
        if(e.button === 2){
            menu.style.left = e.clientX+"px";
            menu.style.top = e.clientY+"px";
            menu.style.display = "block";
        }else if(e.button === 0){
            menu.style.display = "none";
        }
    })
};

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
            });
        }
        append(this.obj,"div",initData).appendC("div",{
            id:"contextMenu",
            style:{
                height:"50px",
                width:"50px",
                border:"1px solid #000",
                position:"absolute",
                display:"none"
            }
        });
    },
    moreEditor:function(){

    },
    editor:function(){

    }
};