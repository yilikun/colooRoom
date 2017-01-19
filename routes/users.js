var express = require('express');
var router = express.Router();

//加载依赖
var url = require('url');
//验证
var validator = require('validator');
//数据库操作类
var connect = require('../models/connect.js')
var User = require('../models/User.js');
var Article = require('../models/Article.js');
var Db = require('../models/db.js');
//加密类
var crypto = require('crypto');
//时间格式化
var moment = require('moment');
//站点的配置
var settings = require('../models/db/settings.js');
var shortid = require('shortid');
//系统相关操作
//var system = require('../util/system.js')
//数据校检
var filter = require('../util/filter.js')

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

/* GET users listing. */
var returnUserRouter = function (io) {
  //用户信息页面
  router.get('/',function(req, res, next) {
      if(!(req.query.username)) {
          req.query.username = req.session.user.username;
      }
          if(req.query.username) {
              User.findOne({username:req.query.username},function (err,user) {
                  if(err) {
                      return res.end(err);
                  }
                  return res.render('web/user',{
                      title:req.query.username + '的个人中心',
                      user:req.session.user,
                      author:user
                  })
              })
          }else {
              res.render('web/user',{
                  title:req.session.user.username + '的个人中心',
                  user:req.session.user,
                  author:req.session.user
              })
          }
          // console.log(articles);
  });
  //用户注册页面
  router.get('/register',function (req,res,next) {
    res.render('web/userRegister',{
      title:'用户注册',
        user:req.session.user
    })
  });
    //用户注册
  router.post('/doRegister',function (req,res,next) {
    console.log(req.body);
    var errors;
    var username = req.body.username,
        password = req.body.password,
        passwordRep = req.body.passwordRep,
        email = req.body.email;
    if(!validator.matches(username,/^[a-zA-Z][a-zA-Z0-9_]{4,11}$/)) {
      errors = '用户名5-12个英文字母数字组合';
    }
    if(!validator.matches(password,/(?!^\\d+$)(?!^[a-zA-Z]+$)(?!^[_#@]+$).{5,}/) || !validator.isLength(password,6,12)){
      errors = "6-12位，只能包含字母、数字和下划线";
    }
    if(password !== passwordRep) {
      errors = '密码不匹配，请重新输入';
    }
    if(!validator.isEmail(email)) {
      errors = '请填写正确的邮箱地址';
    }
    if(errors) {
      res.end(errors);
    }else {
      var regMsg = {
        email:email,
        username:username
      };
      //邮箱和用户名都必须唯一
      var query = User.find().or([{'email':email},{'username':username}]);
      query.exec(function (err,user) {
        if(user.length > 0) {
          errors = '邮箱或用户名已存在';
          res.end(errors);
        }else {
          var newPsd = Db.encrypt(password,settings.encrypto_key);
          req.body.password = newPsd;
          //发送消息给管理员
          //
            Db.addOne(User,req,res)
        }
      })
    }
  });
  //用户登录
  router.post('/doLogin',function (req,res,next) {
    var errors;
    var email = req.body.email,
        password = req.body.password;
    var newPsd = Db.encrypt(password,settings.encrypto_key);
    if(!validator.isEmail(email)) {
      errors = '邮箱格式不正确';
    }
    if(!validator.matches(password,/(?!^\\d+$)(?!^[a-zA_Z]+$)(?!^[_#@]+$).{5,}/) || !validator.isLength(password,6,12)) {
      errors = '密码长度6-12个字符'
    }
    if(errors) {
      res.end(errors);
    }else {
      //成功之后
      User.findOne({email:email,password:newPsd},function (err,user) {
        if(user) {
          //将cookie存入缓存
          // filter.gen_session(user,res);
            req.session.user = user;
            // console.log(user._id)
            // console.log(req.session);
          res.end('success');
        }else {
          res.end('用户名或密码错误');
        }
      })
    }
  });
  //用户退出
  router.get('/logout',function (req,res,next) {
      req.session.destroy();
      res.end('success');
  });
    //获取已经登录的用户信息
  router.get('/getLoginedUser',function (req,res,next) {
     if(req.session.user) {
         console.log(req.session.user._id);
        Db.findOneUser(User,req.session.user._id,function (err,user) {
            console.log(user);
            if(err) {
                return res.end(err);
            }
            req.session.user = user;
            res.json({'success':'success','user':user});
        })
     }else {
        res.end('用户未登录');
     }
  });
    //用户信息界面
  router.get('/userInfo',function (req,res,next) {
      // Db.findOneUser(User,{_id:req.session.user._id},function (err,user) {
          res.render('web/editInfo',{
              title:'个人信息',
              user:req.session.user,
              author:req.session.user
          });
      // })
  });
    //用户信息
    router.get('/oneUser',function (req,res,next) {
        User.findById(req.session.user._id,function (err,user) {
            if(err) {
                return res.end(err);
            }
            res.json(user);
        })
    })
    //保存用户信息修改
    router.post('/editInfo',function (req,res,next) {
        console.log(req.body);
        User.findByIdAndUpdate(req.session.user._id,req.body,function (err,user) {
            if(err) {
                return res.end(err);
            }
            console.log(user);
            res.end('success');
        })
    });
    //获取用户所有的文章
    router.get('/allArticles',function (req,res,next) {
        Db.findArticlesByConditions(Article,{author:req.query.username},function (err,articles) {
            if(err) {
                return res.end(err);
            }
            res.json(articles);
        })
    });




  return router
};

module.exports = returnUserRouter;
