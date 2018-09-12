/**
 * Created by orionwei on 2016/5/11.
 */
var app = require('./lib/router');
var lib = require("./lib/lib");
var path = require('path');
var fs = require('fs');
var iconv = require("iconv-lite");

app.get("/manage", function(req,res){
        app.render(req, res, "manage.html");
})
.get("/article_list",function(req,res){
    var post = {
        title:[],
        source:[],
    },
    i = 0,
    db = JSON.parse(fs.readFileSync("./public/content.json").toString()),
    len = db.length;
    for(;i < len;i++){
        post.title[i] = db[i].title;
    }
    res.send(post, 'json');
})
.post('/delete_post', function(req, res) {
    var data = {},
    filepath = path.resolve(__dirname, "..")+"/source/_posts/"+req.query.filename;
    if(!lib.unlink(filepath)){
        data.errcode = 500;
        data.errMessage = "no such file";
    } else {
        data.errcode = 0;
    }
    if(!lib.exec("hexo g")){
        data.errcode = 500;
        data.errMessage = "Error when render html files";
    }
    res.send(data, "json");
})
.post("/editor_post", function(req, res){
    var md = "---\ntitle: "+req.query.title.trim()+"\ndate: "+req.query.date.trim()+"\ncategories: "+req.query.categories.trim()+"\ntags: "+req.query.tags.trim()+"\n---\n"+req.query.value;
    if(!fs.existsSync("./source/_posts/"+req.query.title.trim()+".md")){
        if(!lib.exec("hexo new '"+req.query.title+"'")){
            res.send({errcode:500,errMessage:"Error when generate post"},"json");
        }
    }
    if(!lib.write("./source/_posts/"+req.query.title.trim()+".md", md)){
        res.send({errcode:500, errMessage:"Error when write data in the post"}, "json");
    }
    if(!lib.exec("hexo g")){
        res.send({errcode:500, errMessage:"Error when generage post"},"json");
    }
    res.send({errcode:0}, "json");
})
.get("/article_data", function(req, res){
    console.log(req.query.title);
    var data = fs.readFileSync("./source/_posts/"+req.query.title).toString();
    data = lib.format(data);
    res.send(data,'json');
})
.post("/checkpw", function(req, res){
    var cookie =lib.getCookie(req).hash;
    if(cookie&&lib.getSession()&&lib.check(cookie)){
        res.send({errcode:0}, "json");
    } else if(lib.checkpw(req.query.pw)){
        lib.setCookie(res, lib.setSession());
        res.send({errcode:0}, "json");
    } else {
        res.send({errcode:400, errMessage:"worng password"}, "json");
    }
})
.get("/404", function(req,res){
    res.send({errcode:404}, "json");
});
