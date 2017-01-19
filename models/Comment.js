/**
 * Created by mengjun on 2017/1/5.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var shortid = require('shortid');

var CommentModel = new Schema({
    _id:{
        type:String,
        unique:true,
        'default':shortid
    },
    articleId:String,
    commenter:String,
    commenterId:String,
    commenterLogo:String,
    commentTime:{type:Date,default:Date.now},
    comment:String,
    answerNum:{type:Number,default:0},
    answers:[]
});
var Comment = mongoose.model('Comment',CommentModel);
module.exports = Comment;