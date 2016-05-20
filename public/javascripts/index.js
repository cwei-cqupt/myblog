/**
 * Created by orionwei on 2016/5/16.
 */
var a = 1;
var orion = {
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
    append:function(str,obj){
        var object = document.createElement(str);
        for(var prototype in obj){
            this[prototype] = obj[prototype];
        }
        this.appendChild(object);
        return this;
    }
};
var btn1 = document.getElementsByTagName("button")[0];
var btn2 = document.getElementsByTagName("button")[1];
var btn3 = document.getElementsByTagName("button")[2];
var data = {a:1};
btn1.addEventListener('click',function(){
    orion.ajax("a?a=1&b=2",'GET',null,function(data){
        console.log(JSON.parse(data));
    });
});
btn2.addEventListener('click',function(){
    orion.ajax("a",'POST',"a=2",function(data){
        console.log(JSON.parse(data));
    });
});
btn3.addEventListener('click',function(){
    orion.ajax("b",'GET',null,function(data){
        console.log(JSON.parse(data));
    });
});