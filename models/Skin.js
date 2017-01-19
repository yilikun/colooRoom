/**
 * Created by june on 2017/1/9.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var shortid = require('shortid');
var moment = require('moment');

var SkinSchema = new Schema ({
    _id:{
        type:String,
        unique:true,
        default:shortid.generate
    },
    bodyBg:String,
    userBg:String,
    mainBgc:String
});

var Skin = mongoose.model('Skin',SkinSchema);
module.exports = Skin;