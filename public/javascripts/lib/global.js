/**
 * Created by orionwei on 2016/5/16.
 */

var orion = {
    id:/#/,
    classN:/\./,
    ajax:function(url,method,data,fn){
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
Object.prototype = {
    addListener:function(str,fn,boolean){
        if(this.length === 1){
            if(this.addEventListener){
                this.addEventListener(str,fn,boolean);
            }else{
                this.attachEvent(str,fn);
            }
        }else if(this.length > 1){
            this.forEach(function(that){
                if(this.addEventListener){
                    that.addEventListener(str,fn,boolean);
                }else{
                    that.attachEvent(str,fn);
                }
            })
        }
        return this;
    },
    append:function(str,obj){var object = document.createElement(str);
        for(var prototype in obj){
            this[prototype] = obj[prototype];
        }
        this.appendChild(object);
        return this;
    }
};
      