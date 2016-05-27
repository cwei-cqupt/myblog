/**
 * Created by orionwei on 2016/5/26.
 */
var OrionEditor = function(id){
    Object.prototype.append = function(str,obj){
        var object = document.createElement(str);
        object = each(obj,object);
        this.appendChild(object);
        return this;
    };
    Object.prototype.css = function(attr){
        if(this.currentStyle){
            return this.currentStyle[attr];
        }else{
            return getComputedStyle(this,false)[attr];
        }
    };
    function each(obj,object){
        for(var prototype in obj){
            if(typeof obj[prototype] === "string")
                object[prototype] = obj[prototype];
            else if(typeof obj[prototype] === "object"){
                console.log(1);
                each(obj[prototype],object[prototype]);
            }
        }
        return object;
    }
    this.obj = document.getElementById(id);
};
OrionEditor.prototype = {
    initEditor:function(){
        this.framework();
    },
    framework:function(){
        this.obj.style.border = "1px solid #C4C6C4";
        this.obj.append("div",{
            className:"controller",
            style:{
                minHeight:"40px",
                width:"100%",
                borderBottom:"1px solid #C4C6C4"
            }
        });
        this.obj.append("div",{
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
        })
    }
};