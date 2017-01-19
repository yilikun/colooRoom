var express = require('express');
var router = express.Router();
//引入数据库操作文件
var connect = require('../models/connect.js');
var Article = require('../models/Article.js');
var User = require('../models/User.js');
var Comment = require('../models/Comment.js');
var Skin = require('../models/Skin.js');
//数据库操作的方法集合
var Db = require('../models/db.js');

var url = require('url');
var moment = require('moment');

var upload = require('../models/upload.js');
var fs = require('fs');
var gm = require('gm');


//检查用户是否登录
function isLogined (req,res,next) {
    if(!req.session.user) {
        return res.end('用户还未登录');
    }
    next();
}
function isLogin (req,res,next) {
    if(req.session.user) {
        return res.send('用户已经登录');
    }
    next();
}

/* GET home page. */
router.get('/', function(req, res, next) {
      res.render('web/index', {
        title: 'coloo',
          user:req.session.user
      });
});
//说说发布
router.post('/talking',isLogined,function (req,res,next) {
    Db.addOneTalking(Article,User,req,res);
});
//根据参数获取一个用户的说说或日志
router.get('/oneUser',function (req,res,next) {
    Db.findArticlesByConditions(Article,{author:req.query.username,type:req.query.type},function (err,articles) {
        if(err) {
            return res.end(err);
        }
        res.json({success:'success',articles:articles});
    })
});
//日志发布页面
router.get('/postDiary',function (req,res,next) {
    res.render('web/diaryPost',{
        title:'日志发布',
        user:req.session.user
    })
});
router.post('/postDiary',function (req,res,next) {
    Db.addOneDiary(Article,User,req,res);
});
//获取所有的说说和日志
router.get('/allArticles',function (req,res,next) {
    if(!req.query.by) {
        Db.findArticlesByConditions(Article,{state:true},function (err,articles) {
            if(err) {
                return res.end(err);
            }
            return res.json({success:'success',articles:articles});
        })
    }else if (req.query.by) {
        Db.findArticlesByConditions(Article,{$or:[{type:req.query.by},{tags:req.query.by},{author:req.query.by},{type:req.query.type}],state:true},function (err,articles) {
            if(err) {
                return res.end(err);
            }
            res.json({success:'success',articles:articles});
        })
    }
});
//获取所有的标签
router.get('/allTags',function (req,res,next) {
    Db.getAllTags(Article,function (err,allTags) {
        if(err) {
            return res.end(err);
        }
        res.json({success:'success',allTags:allTags})
    })
});
//获取最近的文章
router.get('/recentArticles',function (req,res,next) {
    Db.getRecentArticles(Article,function (err,recentArticles) {
        if(err) {
            return res.end(err);
        }
        res.json({success:'success',recentArticles:recentArticles});
    })
});
//记录文章阅读量
router.get('/viewArticle',function (req,res,next) {
    Db.viewArticle(Article,req.query._id,function (err,article) {
        if(err) {
            return res.end(err);
        }
        res.json({success:'success',article:article});
    })
});

//文章收藏
router.get('/collectArticle',isLogined,function (req,res,next) {
    // console.log(req.query._id);
    Db.collectArticle(Article,User,req.query._id,req.session.user._id,function (err,user,article) {
        if(err) {
            return res.end(err);
        }
        req.session.user = user;
        res.json({success:'success',data:article});
    })
});
//文章转发
router.get('/copyArticle',isLogined,function (req,res,next) {
    Db.copyArticle(Article,User,req.query._id,req.session.user._id,function (err,user,article) {
        if(err) {
            return res.end(err);
        }
        req.query.user = user;
        res.json({success:'success',data:article})
    })
});
//文章点赞
router.get('/likeArticle',isLogined,function (req,res,next) {
    Db.likeArticle(Article,req.query._id,req.session.user._id,function (err,article) {
        if(err) {
            return res.end(err);
        }
        res.json({success:'success',data:article});
    })
});
//取消文章点赞
router.get('/unlikeArticle',isLogined,function (req,res,next) {
    Db.unlikeArticle(Article,req.query._id,req.session.user._id,function (err,article) {
        if(err) {
            return res.end(err);
        }
        res.json({success:'success',data:article});
    })
});
//发表文章评论
router.post('/commentArticle',isLogined,function (req,res,next) {
    Db.commentArticle(Article,User,Comment,req.body.article_id,req.session.user,req.body.comment,function (err,article,comments) {
        if(err) {
            return res.end(err);
        }else {
            res.json({success:'success',article:article,comments:comments})
        }
    });
});
//获取一篇文章所有的评论
router.get('/allComments',function (req,res,next) {
    Db.findCommentsByConditions(Comment,{articleId:req.query.article_id},function (err,comments) {
        if(err) {
            return res.end(err);
        }
        res.json({success:'success',comments:comments});
    })
});
//删除一篇文章
router.get('/deleteArticle',isLogined,function (req,res,next) {
    Db.deleteArticle(Article,User,Comment,req.query.article_id,req.session.user._id,function (err,state) {
        if(err) {
            return res.end(err);
        }
        res.json({success:'success',article:null})
    })
});
//编辑一篇文章
router.get('/editDiary',isLogined,function (req,res,next) {
     res.render('web/editDiary',{
         title:'日志编辑',
         user:req.session.user
     })
});
//获取一篇文章的信息
router.get('/getOneArticle',function (req,res,next) {
    Db.findArticleById(Article,req.query.article_id,function (err,article) {
        if(err) {
            return res.end(err);
        }
        res.json({success:'success',article:article});
    })
});
//保存文章的修改
router.post('/saveEdit',function (req,res,next) {
    Db.saveEditArticle(Article,req.body,function (err,article) {
        if(err) {
            return res.end(err);
        }
        res.json({success:'success',article:article});
    })
});
//文章详情
router.get('/articleInfo',function (req,res,next) {
    res.render('web/articleInfo',{
        title:'COLOO:文章详情',
        user:req.session.suer
    })
});

//搜索文章
router.get('/searchArticle',function (req,res,next) {
    Db.searchArticle(Article,req.body.search,function (err,articles) {
        if(err) {
            return res.end(err);
        }
        res.json({success:'success',articles:articles});
    });
    res.end('success');
});




//用户上传头像
router.get('/uploadLogo',isLogined,function (req,res,next) {
    res.render('web/uploadLogo');
});
//用户头像上传
router.post('/uploadLogo',upload.single('logo'),function (req,res,next) {
    var src = 'public/upload/users/logos/small/' + req.file.filename;
    gm(req.file.destination + req.file.filename)
        .resize(200,200,'!')
        .write(src,function (err) {
            if(err) {
                console.log(err);
            }
            Db.uploadLogo(User,Article,Comment,req,function (err,user) {
                if(err) {
                    return res.end(err);
                }
                req.session.user = user;
                res.redirect('/users?username=' + req.session.user.username);
            });
        });

    /*gm(req.file.destination + req.file.filename)
        /!*.resize(100,100,'!')
        .noProfile()*!/
        .flip()
        .magnify()
        // .rotate('green', 45)
        // .blur(7, 3)
        .crop(300, 300, 0, 400)
        // .edge(3)
        .write('public/upload/users/logos/small/' + req.file.filename,function (err,file) {
            if(err) console.log(err);
            console.log(file);
        });
    res.redirect('/users?username=' + req.session.user.username);*/
    // res.json({success:'success',url:req.file.destination + req.file.filename});

});

//新增一款皮肤
router.get('/addSkin',function (req,res,next) {
    res.render('web/addSkin');
});
//新增一款皮肤
router.post('/addSkin',function (req,res,next) {
    Db.addSkin(Skin,req,function (err,skin) {
        if(err) {
            return res.end(err);
        }
        res.json(skin);
    });
});
//获取皮肤
router.get('/getSkin',function (req,res,next) {
    if(req.query.skin_id) {
        Db.findSkinById(Skin,req.query.skin_id,function (err,skin) {
            if(err) {
                return res.end(err);
            }
            res.json({success:'success',skin:skin});
        })
    }else {
        Db.findSkins(Skin,function (err,skins) {
            if(err) {
                return res.end(err);
            }
            res.json({success:'success',skins:skins});
        })
    }
});
//修改用户的皮肤信息
router.post('/editUserSkin',function (req,res,next) {
    Db.editUserSkin(User,req,function (err,user) {
        if(err) {
            return res.end(err);
        }
        req.session.user = user;
        res.json({success:'success',user:user});
    })
});




module.exports = router;
