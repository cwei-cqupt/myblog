var fs = require('fs');
var exec = require('child_process');
var config = require("./config.json");
var Rsa = require("node-rsa");
var crypto = require("crypto");

var session;
module.exports = {
    unlink:function(path){
        var flag = true;
        try {
            fs.unlinkSync(path)
        }
        catch(err){
            flag = false;
        }
        return flag;
    },
    exec:function(str){
        var flag = true;
        try {
            exec.execSync(str);
        }
        catch(err){
            flag = false;
        }
        return flag;
    },
    write:function(path,data){
        var flag = true;       
        try{
            fs.writeFileSync(path, data);
        }
        catch(err){
            flag = false;
        }
        return flag;
    },
    format:function(data){
        var info = {};
        var dataInfo = data.split("---\n");
        info.value = dataInfo.splice(2).join("---\n");
        var dataInfo = dataInfo[1].split("\n"),
        temp;
        for(var i in dataInfo){
            temp = dataInfo[i].split(":");
            info[temp[0]] = temp[1];
        }
        return info;
    },
    setSession:function(str){
        var md5 = crypto.createHash("md5");
        md5.update(str+new Date());
        session = md5.digest('hex');
        return session;
    },
    getSession:function(){
        return session;
    },
    decrypted:function(str){
        var private_key = new Rsa(config.pk);
        private_key.setOptions({
            encryptionScheme:"pkcs1",
        });
        return str;
    },
    check:function(cookie){
        return cookie.hash&&session&&cookie.hash === session;
    },
    checkpw:function(pw){
        return this.decrypted(pw) === config.password;
    },
    getCookie:function(req){
        var Cookies ={};
        if (req.headers.cookie != null) {
            req.headers.cookie.split(';').forEach(l => {
                var parts = l.split('=');
                Cookies[parts[0].trim()] = (parts[1] || '').trim();
            });
        }
        return Cookies; 
    },
    setCookie:function(res, cookie){
        res.setHeader("Set-Cookie", "hash="+cookie+";HttpOnly");
    }
};
