/**
 * Created by june on 2016/12/30.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var shortid = require('shortid');
//引入时间格式化对象
var moment = require('moment');

var UserSchema = new Schema ({
    _id:{
        type:String,
        unique:true,
        'default':shortid.generate
    },
    name:String,
    username:String,
    password:String,
    email:String,
    qq:Number,
    phoneNum:Number,
    comments:{type:String,default:"这个人很懒，什么也没说..."},
    position:String,
    company:String,
    website:String,
    date:{type:Date,default:Date.now},
    logo:{type:String,default:"/upload/users/logos/timg.png"},
    skinId:{type:String,default:'r1gxhplUx'},
    userSkin:{
        bodyBg:{type:String,default:'url(/upload/users/userBg/body_bg.jpg) no-repeat 0 0/100%,#F4EAD1;'},
        userBg:{type:String,default:'/upload/users/userBg/body_bg.jpg'},
        mainBgc:{type:String,default:'rgba(240,220,200,.4);'}
    },
    group:{type:String,default:"0"},
    gender:{type:String,default:'男'},
    province:String,
    city:String,
    year:Number,
    openid:String,
    retrieve_time:{type:Number},
    collectArticlesNum:{type:Number,default:0},
    collectArticlesIds:[],
    copyArticlesNum:{type:Number,default:0},
    copyArticlesIds:[],
    articlesNum:{type:Number,default:0},
    articlesIds:[]
});
var User = mongoose.model('User',UserSchema);
module.exports = User;