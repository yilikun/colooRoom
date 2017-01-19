/**
 * Created by mengjun on 2017/1/9.
 */
var fs = require('fs')
    , gm = require('gm');

//引入上传文件模块
var multer = require('multer');

//定义一个路径过滤函数
function formatMime(req,file,cb) {
    var name = req.session.user.username;
    switch (file.mimetype) {
        case 'image/jpeg':
            name += '.jpg';
            break;
        case 'image/png':
            name += '.png';
            break;
        case 'image/gif':
            name += '.gif';
            break;
        default:
            cb('不支持此类文件');
            break;
    }
    return name;
}

var storage = multer.diskStorage({
    destination:function(req,file,cb) {
        cb(null,'public/upload/users/logos/big/')
    },
    filename:function (req,file,cb) {
        var name = formatMime(req,file,cb);
        cb(null,name);
    }
});
var upload = multer({storage:storage});
module.exports = upload;