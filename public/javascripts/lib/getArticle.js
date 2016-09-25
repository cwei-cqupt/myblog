/**
 * Created by orionwei on 2016/5/28.
 */
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/orionwei');
var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;
var BlogPost = new Schema({
    author    : ObjectId,
    title     : String,
    body      : String,
    date      : Date
});
var Comment = new Schema({
    name: { type: String, default: 'DecentWei' },
    title: { type: String},
    body: {type: String},
    date: { type: Date, default: Date.now },
    buff: Buffer
});