/**
 * Created by orionwei on 2016/5/16.
 */

var orion = {
    id:/#/,
    classN:/\./,
    ajax:function(url,method,data,fn,setheader){
        var xmlhttp=null;
        if (window.XMLHttpRequest) {// code for all new browsers
            xmlhttp=new XMLHttpRequest();
        }
        else if (window.ActiveXObject) {// code for IE5 and IE6
            xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
        }
        if (xmlhttp!=null) {
            xmlhttp.onreadystatechange=state_Change;
            xmlhttp.open(method,url,true);
            if(setheader)
                setheader(xmlhttp);
            xmlhttp.send(data);
        }
        else {
            alert("Your browser does not support XMLHTTP.");
        }
        function state_Change() {
            if (xmlhttp.readyState==4) {// 4 = "loaded"
                if (xmlhttp.status==200) {// 200 = OK
                    fn(xmlhttp.responseText);
                }
                else {
                    alert("Problem retrieving XML data");
                }
            }
        }
    },
    getED:function(str){
        var index;
        if(this.id.test(str)){
            index = str.indexOf("#");
            return document.getElementById(str.substr(index+1,str.length));
        }else if(this.classN.test(str)){
            index = str.indexOf(".");
            if(index>0){
                var tagn = document.getElementsByTagName(str.substr(0,index));
                return tagn.getElementsByClassName(str.substr(index+1,str.length));
            }else{
                return document.getElementsByClassName(str.substr(1,str.length));
            }
        }else{

        }
    }
};
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
};
function bgimg(obj,url){
    obj.style.backgroundImage = "url('"+url+"')"
}
