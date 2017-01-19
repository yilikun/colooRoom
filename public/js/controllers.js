/**
 * Created by june on 2016/12/30.
 */
var webApp = angular.module('webApp',['angularMoment','userRegApp','userApp','diaryPostApp','editInfoApp','editDiaryApp','articleInfoApp']);
webApp.run(function (amMoment) {
    amMoment.changeLocale('zh-cn');
});
webApp.filter('to_trusted',['$sce',function ($sce) {
    return function(text) {
        return $sce.trustAsHtml(text);
    }
}]);
//最大的控制器
webApp.controller('rootCtrl',function ($scope,$http) {
        //获取当前登录用户
        $http({
            method:"GET",
            url:'/users/getLoginedUser'
        }).success(function (data) {
            if(data.success === 'success') {
                $scope.user = data.user;
                $scope.skin = data.user.userSkin;
            }else {
                console.log( data + '请登录或注册');
                $scope.user = '';
                $scope.skin = {
                    bodyBg:'url(/upload/users/userBg/body_bg4.jpg) no-repeat 0 0/ 100%,url(/upload/users/userBg/body_repeat4.png) repeat;',
                    mainBgc:'rgba(186,216,229,.5);'
                };
            }
        });
        //监听文章内容的变化
        $scope.$on('childUpdateArticles',function (e,data) {
            $scope.$broadcast('updateArticles',data);
        });
        //显示更换皮肤
        $scope.showSkin = function (event) {
            $(event.target).parent().next().show();
            $http({
                method:"GET",
                url:"/getSkin"
            }).success(function (data) {
                if(data.success === 'success') {
                    $scope.skins = data.skins;
                }else {
                    console.log(data + '皮肤获取失败');
                }
            });
        };
        //将选择的皮肤展示
        $scope.selectSkin = function (skin) {
            $scope.skin = skin;
        };
        //关闭更换皮肤
        $scope.closeSkin = function (event) {
            $(event.target).parent().parent().hide();
            $scope.skin = $scope.user.userSkin;
        };
        //确定选择的皮肤
        $scope.sureSkin = function (event) {
            $http({
                method:"POST",
                url:"/editUserSkin",
                data:$.param($scope.skin),
                headers:{'Content-Type':'application/x-www-form-urlencoded'}
            }).success(function (data) {
                if(data.success === 'success') {
                    alert('背景更换成功');
                    $scope.user = data.user;
                    console.log($scope.user);
                    console.log($scope.skin);
                    $(event.target).parent().parent().hide();
                }
            })
        }

    })
    //bodyCtrl控制器
    .controller('bodyCtrl',function ($scope,$http) {

})
    //导航栏用户模块
    .controller('navUserCtrl',function ($scope,$http) {
    $scope.logout = function () {
        if(confirm('确定退出吗?')) {
            $http({
                method:'GET',
                url:'/users/logout'
            }).success(function (data) {
                if(data === 'success') {
                    alert('退出成功');
                    location.href = '/';
                }else {
                    console.log('退出失败');
                }
            })
        }
    };
    $scope.processLoginForm = function (isVaild) {
        if(isVaild) {
            $http ({
                method:'POST',
                url:'/users/doLogin',
                data:$.param($scope.loginFormData),
                headers:{'Content-Type':'application/x-www-form-urlencoded'}
            }).success(function (data) {
                if(data === 'success') {
                    alert('登录成功');
                    location.href = '/';
                }else {
                    $scope.loginErrors = data;
                }
            }).error(function (err) {
                console.log(err);
            })
        }
    };
    $scope.getAllArticles = function (type) {
        $http({
            method:"GET",
            url:'/allArticles?by=' + type
        }).success(function (data) {
            if(data.success === 'success') {
                $scope.$emit('childUpdateArticles',data.articles);
            }
        })
    };
    $scope.getArticles = function (username,type) {
        $http({
            method:"GET",
            url:"/oneUser?username=" + username + "&type=" + type
        }).success(function (data) {
            if(data.success === 'success') {
                $scope.$emit('childUpdateArticles',data.articles);
            }
        })
    };
    $scope.processSearch = function (isvalid) {
        console.log($.param($scope.searchFormData));
        if(isvalid) {
            $http({
                method:"POST",
                url:"/searchArticle",
                data:$.param($scope.searchFormData),
                headers:{'Content-Type':'application/x-www-form-urlencoded'}
            }).success(function (data) {
                if(data.success === 'success') {
                    $scope.emit('childUpdateArticles',data.articles);
                }
            })
        }
    }
})
    //主页右侧用户信息模块
    .controller('rightSideUserLogin',function ($scope,$http) {
    $scope.rightSideLoginForm = function (isVaild) {
        if(isVaild) {
            $http ({
                method:'POST',
                url:'/users/doLogin',
                data:$.param($scope.loginFormData),
                headers:{'Content-Type':'application/x-www-form-urlencoded'}
            }).success(function (data) {
                if(data === 'success') {
                    alert('登录成功');
                    location.href = '/';
                }else {
                    $scope.errors = data;
                }
            }).error(function (err) {
                console.log(err);
            })
        }
    }
})
    //主页说说发布模块
    .controller('talkingPostCtrl',function ($scope,$http) {
    $scope.talkingPostData = {};
    $scope.talkingPostData.state = 'true';
    $scope.states = [{type:true,value:'公开'},{type:false,value:'仅自己可见'}];
    $scope.processTalkingPost = function ($isvaild) {
        if($isvaild) {
            console.log($scope.talkingPostData);
            $http({
                method:'POST',
                url:'/talking',
                data:$.param($scope.talkingPostData),
                headers:{'Content-Type':'application/x-www-form-urlencoded'}
            }).success(function (data) {
                if(data === 'success') {
                    alert('发布成功');
                    location.href = '/';
                }else {
                    alert('用户还未登陆');
                    $('#loginModal').modal();
                }
            })
        }
    }
})
    //首页左边模块
    .controller('leftSideCtrl',function ($scope,$http) {
        //初始化选项框的样式
        $scope.isIndex = true;
        $scope.getArticles = function (type) {
            $http({
                method:"GET",
                url:'/allArticles?by=' + type
            }).success(function (data) {
                if(data.success === 'success') {
                    $scope.$emit('childUpdateArticles',data.articles);
                }
            })
        };
        // 用户注册
        $scope.register = function () {
            location.href = '/users/register';
        };
        // 用户退出
        $scope.logout = function () {
            if(confirm('确定退出吗')) {
                $http({
                    method:'GET',
                    url:'/users/logout'
                }).success(function (data) {
                    if(data === 'success') {
                        alert('退出成功');
                        location.href = '/';
                    }else {
                        console.log('退出失败');
                    }
                })
            }
        }
    })
    //主页文章模块
    .controller('mainArticlesCtrl',function ($scope,$http,moment) {
        //获取所有文章数
        $http({
            mehtod:"GET",
            url:'/allArticles'
        }).success(function (data) {
            if(data.success === 'success') {
                $scope.articles = data.articles;
            }
        });

        var isShow = '';
        //显示文章内容
        $scope.contentShow = function (event,article) {
            if(isShow !== article._id) {
                $http({
                    method:"GET",
                    url:"viewArticle?_id=" + article._id
                }).success(function(data) {
                    if(data.success === 'success') {
                        article.clickNum = data.article.clickNum;
                    }else {
                        console.log(data + '文章内容阅读量增加失败')
                    }
                });
                $(event.target).parent().next().show();
                isShow = article._id;
            }
        };
        //隐藏文章内容
        $scope.closeContent = function (event) {
            isShow = '';
            $(event.target).parents('#oneContent').hide();
        };
        //获取更新的数据
        $scope.$on('updateArticles',function (e,articles) {
            $scope.articles = articles;
        });
        //通过标签或类型获取所有文章
        $scope.getArticles = function (type) {
            $http({
                method:"GET",
                url:'/allArticles?by=' + type
            }).success(function (data) {
                if(data.success === 'success') {
                    $scope.articles = data.articles;
                }
            })
        };
        //收藏文章
        $scope.collectArticle = function (article) {
            if(!$scope.user) {
                return alert('你还没登录呢');
            }
            var isCollected = article.collectUserIds.indexOf($scope.user._id);
            if(isCollected == '-1') {
                if(article.author === $scope.user.username) {
                    return alert('不能收藏自己的文章哦');
                }
                $http({
                    method:"GET",
                    url:"/collectArticle?_id=" + article._id
                }).success(function (data) {
                    if(data.success === 'success') {
                        alert('文章收藏成功');
                        article.collectNum = data.data.collectNum;
                        article.collectUserIds = data.data.collectUserIds;
                        $scope.user.collectArticlesNum += 1;
                    }else {
                        console.log(data + '文章收藏失败');
                    }
                })
            }else {
                alert('你已经收藏过该内容啦');
            }
        };
        //转发文章
        $scope.copyArticle = function (article) {
            if(!$scope.user) {
                return alert('你还没登录呢');
            }
            $http({
                method:"GET",
                url:"/copyArticle?_id=" + article._id
            }).success(function (data) {
                if(data.success === 'success') {
                    alert('文章转发成功');
                    article.copyNum = data.data.copyNum;
                    $scope.user.copyArticlesNum += 1;
                }else {
                    console.log(data + '文章转发失败');
                }
            })
        };
        //展示评论
        var commentShow = '';
        $scope.comments = {};
        $scope.showComments = function ($event,article) {
            if(commentShow !== article._id ) {
                $http({
                    method:"GET",
                    url:"allComments?article_id=" + article._id
                }).success(function (data) {
                    if(data.success === 'success') {
                        $scope.comments[article._id] = data.comments;
                    }else {
                        console.log(data + '评论加载失败');
                    }
                });
                $http({
                    method:"GET",
                    url:"viewArticle?_id=" + article._id
                }).success(function (data) {
                    if(data.success === 'success') {
                        article.clickNum = data.article.clickNum;
                    }else {
                        console.log(data + '文章浏览量增加失败');
                    }
                });
                commentShow = article._id
            }else {
                alert('已经加载过评论啦');
            }
            $($event.target).parents('#article_foot_bar').next().show();
        };
        //隐藏评论
        $scope.hideComments = function (event,article) {
            commentShow = '';
            $(event.target).parent().parent().hide();
        };
        //评论
        $scope.commentFormData = {};
        $scope.commentFormData.copySame = true;
        $scope.commentArticle = function ($isvalid,article) {
            if($isvalid) {
                console.log($scope.commentFormData.copySame);
                $scope.commentFormData.article_id = article._id;
                if($scope.commentFormData.copySame) {
                    $scope.copyArticle(article);
                }
                $http({
                    method:"POST",
                    url:"/commentArticle",
                    data:$.param($scope.commentFormData),
                    headers:{'Content-Type':'application/x-www-form-urlencoded'}
                }).success(function (data) {
                    if(data.success === 'success') {
                        alert('评论成功');
                        $scope.commentFormData.comment = '';
                        article.commentNum = data.article.commentNum;
                        article.clickNum = data.article.clickNum;
                        $scope.comments[article._id] = data.comments;
                    }else {
                        console.log(data + '评论失败')
                    }
                })
            }
        };
        //文章点赞
        $scope.likeArticle = function (article) {
            if(!$scope.user) {
                return alert('你还没登录呢');
            }
            var isliked = article.likeUserIds.indexOf($scope.user._id);
            if(isliked == '-1') {
                $http({
                    method:"GET",
                    url:"/likeArticle?_id=" + article._id
                }).success(function (data) {
                    if(data.success === 'success') {
                        article.likeNum = data.data.likeNum;
                        article.likeUserIds = data.data.likeUserIds;
                    }else {
                        console.log(data + '文章点赞失败');
                    }
                })
            }else {
                $http({
                    method:"GET",
                    url:"/unlikeArticle?_id=" + article._id
                }).success(function (data) {
                    if(data.success === 'success') {
                        article.likeNum = data.data.likeNum;
                        article.likeUserIds = data.data.likeUserIds;
                    }else {
                        console.log(err + '取消点赞失败');
                    }
                })
            }
        };
        //删除文章
        $scope.deleteArticle = function (article) {
            if(confirm('确认要删除这篇文章吗')) {
                $http({
                    method:"GET",
                    url:"/deleteArticle?article_id=" + article._id
                }).success(function (data) {
                    if(data.success === 'success') {
                        console.log(data.article);
                        $scope.articles.splice($scope.articles.indexOf(article),1);
                    }
                })
            }
        };
        //说说修改模块
        $scope.editTalking = function (event,article) {
            $(event.target).parent().next('#' + article._id).show();
            $http({
                method:"GET",
                url:'/getOneArticle?article_id=' + article._id
            }).success(function (data) {
                if(data.success === 'success') {
                    $scope.editTalkingData = data.article;
                }
            })
        };
        //保存说说修改
        $scope.processTalkingEdit = function ($isvalid,article) {
            if($isvalid) {
                $http({
                    method:"POST",
                    url:"/saveEdit",
                    data:$.param($scope.editTalkingData),
                    headers:{'Content-Type':'application/x-www-form-urlencoded'}
                }).success(function (data) {
                    if(data.success === 'success') {
                        alert('说说修改成功');
                        article.content = data.article.content;
                        $('#' + article._id).hide();
                    }
                })
            }
        };
        //取消说说说修改
        $scope.cancelEditTalking = function (article) {
            $('#' + article._id).hide();
        }
    })
    // 通过标签获取文章
    .controller('tagsCtrl',function ($scope,$http) {
        $http({
            method:"GET",
            url:"/alltags"
        }).success(function (data){
            if(data.success === 'success') {
                $scope.allTags = data.allTags;
            }else {
                console.log(data + '标签获取失败');
            }
        });
        $scope.getArticlesByTag = function (tag) {
            $http({
                method:"GET",
                url:"/allArticles?by=" + tag
            }).success(function (data) {
                if(data.success === 'success') {
                    $scope.$emit('childUpdateArticles',data.articles);
                }
            })
        }
    })
    //最近的动态
    .controller('recentArticlesCtrl',function ($scope,$http) {
        $http({
            method:"GET",
            url:"/recentArticles"
        }).success(function (data) {
            if(data.success === 'success') {
                $scope.recentArticles = data.recentArticles;
            }else {
                console.log(data);
            }
        });
        //通过标签获取所有文章
        $scope.getArticles = function (type) {
            $http({
                method:"GET",
                url:'/allArticles?by=' + type
            }).success(function (data) {
                if(data.success === 'success') {
                    $scope.$emit('childUpdateArticles',data.articles)
                }
            })
        };
    });

//用户注册页面userRegApp
var userRegApp = angular.module('userRegApp',[]);
//用户注册页面注册模块
userRegApp.controller('userReg',function ($scope,$http) {

    //发送注册表单
    $scope.processRegForm = function (isVaild) {
        if(isVaild) {
            $http({
                method:'POST',
                url:'/users/doRegister',
                data:$.param($scope.regFormData),
                headers:{'Content-Type':'application/x-www-form-urlencoded'}
            }).success(function (data) {
                if(data === 'success') {
                    alert('注册成功');
                    $('#loginModal').modal({keyboard:false,remote:false});
                }else {
                    $scope.regErrors = data;
                }
            }).error(function (err) {
                console.log(err);
            })
        }
    }
});


//用户个人中心页面userApp
var userApp = angular.module('userApp',[]);
        //用户个人中心控制器
        userApp.controller('userBodyCtrl',function ($scope,$http) {

        })
        //用户更换头像
        .controller('changeLogoCtrl',function ($scope,$http) {
            $scope.changeLogoData = {};
            $scope.selectLogo = function () {
                $('#selectFile').click();
            };
            $('#selectFile').change(function () {
            });
            /*$scope.fileSelected = function () {
                console.log($scope.changeLogoData);
                $http({
                    method:"POST",
                    url:"/uploadLogo",
                    data:$.param($scope.changeLogoData),
                    headers:{'Content-Type':'application/x-www-form-urlencoded'}
                }).success(function (data) {
                    if(data.success === 'success') {
                        $scope.uploadLogo = data.src;
                    }else {
                        console.log(data + '图片上传失败');
                    }
                })
            }*/
        })
        //左边用户控制器
        .controller('userLeftCtrl',function ($scope,$http) {
            //初始化选项框的样式
            $scope.isIndex = true;
            $scope.getArticles = function (author,type) {
                $http({
                    method:"GET",
                    url:'/oneUser?username=' + author + '&type=' + type
                }).success(function (data) {
                    if(data.success === 'success') {
                        $scope.$emit('childUpdateArticles',data.articles);
                    }
                })
            };
            // 用户注册
            $scope.register = function () {
                location.href = '/users/register';
            };
            // 用户退出
            $scope.logout = function () {
                if(confirm('确定退出吗')) {
                    $http({
                        method:'GET',
                        url:'/users/logout'
                    }).success(function (data) {
                        if(data === 'success') {
                            alert('退出成功');
                            location.href = '/';
                        }else {
                            console.log('退出失败');
                        }
                    })
                }
            }
        })
        //用户个人中心文章模块
        .controller('userArticlesCtrl',function ($scope,$http,$location) {
            //获取所有文章数
            var param = location.search;
            $http({
                mehtod:"GET",
                url:'/users/allArticles' + param
            }).success(function (data) {
                $scope.articles = data;
            });

            var isShow = '';
            //显示文章内容
            $scope.contentShow = function (event,article) {
                if(isShow !== article._id) {
                    $http({
                        method:"GET",
                        url:"viewArticle?_id=" + article._id
                    }).success(function(data) {
                        if(data.success === 'success') {
                            article.clickNum = data.article.clickNum;
                        }else {
                            console.log(data + '文章内容阅读量增加失败')
                        }
                    });
                    $(event.target).parent().next().show();
                    isShow = article._id;
                }
            };
            //隐藏文章内容
            $scope.closeContent = function (event) {
                isShow = '';
                $(event.target).parents('#oneContent').hide();
            };
            //获取更新的数据
            $scope.$on('updateArticles',function (e,articles) {
                $scope.articles = articles;
            });
            //通过标签获取所有文章
            $scope.getArticles = function (type) {
                $http({
                    method:"GET",
                    url:'/allArticles?by=' + type
                }).success(function (data) {
                    if(data.success === 'success') {
                        $scope.articles = data.articles;
                    }
                })
            };
            //收藏文章
            $scope.collectArticle = function (article) {
                if(!$scope.user) {
                    return alert('你还没登录呢');
                }
                var isCollected = article.collectUserIds.indexOf($scope.user._id);
                if(isCollected == '-1') {
                    if(article.author === $scope.user.username) {
                        return alert('不能收藏自己的文章哦');
                    }
                    $http({
                        method:"GET",
                        url:"/collectArticle?_id=" + article._id
                    }).success(function (data) {
                        if(data.success === 'success') {
                            alert('文章收藏成功');
                            article.collectNum = data.data.collectNum;
                            article.collectUserIds = data.data.collectUserIds;
                            $scope.user.collectArticlesNum += 1;
                        }else {
                            console.log(data + '文章收藏失败');
                        }
                    })
                }else {
                    alert('你已经收藏过该内容啦');
                }
            };
            //转发文章
            $scope.copyArticle = function (article) {
                if(!$scope.user) {
                    return alert('你还没登录呢');
                }
                $http({
                    method:"GET",
                    url:"/copyArticle?_id=" + article._id
                }).success(function (data) {
                    if(data.success === 'success') {
                        alert('文章转发成功');
                        article.copyNum = data.data.copyNum;
                        $scope.user.copyArticlesNum += 1;
                    }else {
                        console.log(data + '文章转发失败');
                    }
                })
            };
            //展示评论
            var commentShow = '';
            $scope.comments = {};
            $scope.showComments = function ($event,article) {
                if(commentShow !== article._id ) {
                    $http({
                        method:"GET",
                        url:"allComments?article_id=" + article._id
                    }).success(function (data) {
                        if(data.success === 'success') {
                            $scope.comments[article._id] = data.comments;
                        }else {
                            console.log(data + '评论加载失败');
                        }
                    });
                    $http({
                        method:"GET",
                        url:"viewArticle?_id=" + article._id
                    }).success(function (data) {
                        if(data.success === 'success') {
                            article.clickNum = data.article.clickNum;
                        }else {
                            console.log(data + '文章浏览量增加失败');
                        }
                    });
                    commentShow = article._id
                }else {
                    alert('已经加载过评论啦');
                }
                $($event.target).parents('#article_foot_bar').next().show();
            };
            //隐藏评论
            $scope.hideComments = function (event,article) {
                commentShow = '';
                $(event.target).parent().parent().hide();
            };
            //评论
            $scope.commentFormData = {};
            $scope.commentFormData.copySame = true;
            $scope.commentArticle = function ($isvalid,article) {
                if($isvalid) {
                    console.log($scope.commentFormData.copySame);
                    $scope.commentFormData.article_id = article._id;
                    if($scope.commentFormData.copySame) {
                        $scope.copyArticle(article);
                    }
                    $http({
                        method:"POST",
                        url:"/commentArticle",
                        data:$.param($scope.commentFormData),
                        headers:{'Content-Type':'application/x-www-form-urlencoded'}
                    }).success(function (data) {
                        if(data.success === 'success') {
                            alert('评论成功');
                            article.commentNum = data.article.commentNum;
                            article.clickNum = data.article.clickNum;
                            $scope.comments[article._id] = data.comments;
                        }else {
                            console.log(data + '评论失败')
                        }
                    })
                }
            };
            //文章点赞
            $scope.likeArticle = function (article) {
                if(!$scope.user) {
                    return alert('你还没登录呢');
                }
                var isliked = article.likeUserIds.indexOf($scope.user._id);
                if(isliked == '-1') {
                    $http({
                        method:"GET",
                        url:"/likeArticle?_id=" + article._id
                    }).success(function (data) {
                        if(data.success === 'success') {
                            article.likeNum = data.data.likeNum;
                            article.likeUserIds = data.data.likeUserIds;
                        }else {
                            console.log(data + '文章点赞失败');
                        }
                    })
                }else {
                    $http({
                        method:"GET",
                        url:"/unlikeArticle?_id=" + article._id
                    }).success(function (data) {
                        if(data.success === 'success') {
                            article.likeNum = data.data.likeNum;
                            article.likeUserIds = data.data.likeUserIds;
                        }else {
                            console.log(err + '取消点赞失败');
                        }
                    })
                }
            };
            //删除文章
            $scope.deleteArticle = function (article) {
                if(confirm('确认要删除这篇文章吗')) {
                    $http({
                        method:"GET",
                        url:"/deleteArticle?article_id=" + article._id
                    }).success(function (data) {
                        if(data.success === 'success') {
                            console.log(data.article);
                            $scope.articles.splice($scope.articles.indexOf(article),1);
                        }
                    })
                }
            };
            //说说修改模块
            $scope.editTalking = function (event,article) {
                $(event.target).parent().next('#' + article._id).show();
                $http({
                    method:"GET",
                    url:'/getOneArticle?article_id=' + article._id
                }).success(function (data) {
                    if(data.success === 'success') {
                        $scope.editTalkingData = data.article;
                    }
                })
            };
            //保存说说修改
            $scope.processTalkingEdit = function ($isvalid,article) {
                if($isvalid) {
                    $http({
                        method:"POST",
                        url:"/saveEdit",
                        data:$.param($scope.editTalkingData),
                        headers:{'Content-Type':'application/x-www-form-urlencoded'}
                    }).success(function (data) {
                        if(data.success === 'success') {
                            alert('说说修改成功');
                            article.content = data.article.content;
                            $('#' + article._id).hide();
                        }
                    })
                }
            };
            //取消说说说修改
            $scope.cancelEditTalking = function (article) {
                $('#' + article._id).hide();
            }
    })
        // 通过标签获取文章
        .controller('tagsCtrl',function ($scope,$http) {
            $http({
                method:"GET",
                url:"/alltags"
            }).success(function (data){
                if(data.success === 'success') {
                    $scope.allTags = data.allTags;
                }else {
                    console.log(data + '标签获取失败');
                }
            });
            $scope.getArticlesByTag = function (tag) {
                $http({
                    method:"GET",
                    url:"/allArticles?by=" + tag
                }).success(function (data) {
                    if(data.success === 'success') {
                        $scope.$emit('childUpdateArticles',data.articles);
                    }
                })
            }
        })
        //用户个人中心说说发布模块
        .controller('userTalkingPostCtrl',function ($scope,$http) {
        $scope.talkingUserPostData = {};
        $scope.talkingUserPostData.state = 'true';
        $scope.states = [{type:true,value:'公开'},{type:false,value:'仅自己可见'}];
        $scope.processUserTalkingPost = function ($isvaild) {
            if($isvaild) {
                console.log($scope.talkingUserPostData);
                $http({
                    method:'POST',
                    url:'/talking',
                    data:$.param($scope.talkingUserPostData),
                    headers:{'Content-Type':'application/x-www-form-urlencoded'}
                }).success(function (data) {
                    if(data === 'success') {
                        alert('发布成功');
                        location.href = '/users';
                    }else {
                        alert('用户还未登陆');
                        $('#loginModal').modal();
                    }
                })
            }
        }
    });
//日志发表页面diaryPostApp
var diaryPostApp = angular.module('diaryPostApp',[]);
//日志发布页面日志发布模块
diaryPostApp.controller('diaryPostCtrl',function ($scope,$http) {

    $scope.diaryPostData = {};
    $scope.diaryPostData.state = 'true';
    $scope.states = [{type:true,value:'公开'},{type:false,value:'仅自己可见'}];
    $scope.processDiaryPostForm = function ($isvalid) {
        if($isvalid) {
            console.log($scope.diaryPostData);
            $scope.diaryPostData.tags = [];
            if($scope.tag1) {
                $scope.diaryPostData.tags.push($scope.tag1);
            }
            if($scope.tag2) {
                $scope.diaryPostData.tags.push($scope.tag2);
            }
            if($scope.tag3) {
                $scope.diaryPostData.tags.push($scope.tag3);
            }
            $scope.diaryPostData.tags = JSON.stringify($scope.diaryPostData.tags);
            $http({
                method:'POST',
                url:'/postDiary',
                data:$.param($scope.diaryPostData),
                headers:{'Content-Type':'application/x-www-form-urlencoded'}
            }).success(function (data) {
                if(data === 'success') {
                    alert('发布成功');
                    location.href = '/';
                }else {
                    console.log(data);
                }
            }).error(function (err) {
                console.log(err);
            })
        }
    }
});


//用户信息页面editInfoApp
var editInfoApp = angular.module('editInfoApp',[]);
//用户信息页面用户信息修改模块
editInfoApp.controller('editInfoCtrl',function ($scope,$http) {

    $scope.canEdit = false;
    $(function () {
        $http({
            method:'GET',
            url:'/users/oneUser'
        }).success(function (data) {
            console.log(data);
            $scope.editFormData = data;
            console.dir($scope.editFormData)
        })
    });
    $scope.edit = function () {
        $scope.canEdit = true;
    };
    $scope.processEditForm = function ($isvalid) {
        if($isvalid) {
            $http({
                method:'POST',
                url:'/users/editInfo',
                data:$.param($scope.editFormData),
                headers:{'Content-Type':'application/x-www-form-urlencoded'}
            }).success(function (data) {
                if(data === 'success') {
                    alert('信息修改成功');
                    location.href = '/users';
                }else {
                    alert('信息修改失败');
                }
            }).error(function (err) {
                console.log(err);
            })
        }
    }
});


//文章修改页面editDiaryApp
var editDiaryApp = angular.module('editDiaryApp',[]);
editDiaryApp.controller('diaryEditCtrl',function ($scope,$http) {

    $http({
        method:"GET",
        url:"/getOneArticle" + location.search
    }).success(function (data) {
        if(data.success === 'success') {
            $scope.states = [{type:true,value:'公开'},{type:false,value:'仅自己可见'}];
            $scope.diaryEditData = data.article;
            console.log($scope.diaryEditData);
        }
    });
    $scope.processDiaryPostForm = function ($isvalid) {
        if($isvalid) {
            $http({
                method:'POST',
                url:'/saveEdit',
                data:$.param($scope.diaryEditData),
                headers:{'Content-Type':'application/x-www-form-urlencoded'}
            }).success(function (data) {
                if(data.success === 'success') {
                    alert('修改成功');
                    $scope.diaryEditData = data.article;
                }else {
                    console.log(data);
                }
            }).error(function (err) {
            })
        }
    };
    $scope.disEdit = true;
    $scope.edit = function () {
        $scope.disEdit = false;
    }
});


//文章详情模块articleInfoApp
var articleInfoApp = angular.module('articleInfoApp',[]);
//主要内容控制器
articleInfoApp.controller('articleInfoCtrl',function ($scope,$http) {

    $http({
        method:"GET",
        url:"/getOneArticle" + location.search
    }).success(function (data) {
        if(data.success === 'success') {
            $scope.article = data.article;
        }else {
            console.log(data + '文章获取失败');
        }
    });
    $http({
        method:"GET",
        url:"/allComments" + location.search
    }).success(function (data) {
        if(data.success === 'success') {
            $scope.comments = data.comments;
        }
    });
    //评论
    $scope.commentFormData = {};
    $scope.commentFormData.copySame = true;
    $scope.commentArticle = function ($isvalid,article) {
        if($isvalid) {
            console.log($scope.commentFormData.copySame);
            $scope.commentFormData.article_id = article._id;
            if($scope.commentFormData.copySame) {
                $scope.copyArticle(article);
            }
            $http({
                method:"POST",
                url:"/commentArticle",
                data:$.param($scope.commentFormData),
                headers:{'Content-Type':'application/x-www-form-urlencoded'}
            }).success(function (data) {
                if(data.success === 'success') {
                    alert('评论成功');
                    article.commentNum = data.article.commentNum;
                    article.clickNum = data.article.clickNum;
                    $scope.comments = data.comments;
                }else {
                    console.log(data + '评论失败')
                }
            })
        }
    };
    //文章转发
    $scope.copyArticle = function (article) {
        if(!$scope.user) {
            return alert('你还没登录呢');
        }
        $http({
            method:"GET",
            url:"/copyArticle?_id=" + article._id
        }).success(function (data) {
            if(data.success === 'success') {
                alert('文章转发成功');
                article.copyNum = data.data.copyNum;
                $scope.user.copyArticlesNum += 1;
            }else {
                console.log(data + '文章转发失败');
            }
        })
    };
});