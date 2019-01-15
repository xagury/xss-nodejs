var express = require('express');
var router = express.Router();

var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017'
var dbname = 'czblog';
var articleB = 'article';
var userB = 'user';
var commentB = 'comment';
var ObjectID = require('mongodb').ObjectID;
var URL = require('url');
var http = require('http');

function formatTime(date) {
  var y = date.getFullYear();
  var m = date.getMonth();
  var d = date.getDate();
  var h = date.getHours();
  var mi = date.getMinutes();

  return y + '-' + m + '-' + d + ' ' + h + ':' + mi;

}
//登录
router.post('/api-login', (req, res) => {
  var username = req.body.un;
  //使用md5对密码进行加密
  var md5 = crypto.createHash('md5');
  var password = md5.update(req.body.pd).digest('hex');
  // var password = req.body.pd;
  var user = {
    username,
    password
  };
  MongoClient.connect(url, (error, dbC) => {
    var db = dbC.db(dbname);
    db.collection('user').find(user).toArray((error, data) => {
      if (data.length) {
        //在req 上面存的session ，在给服务器响应以前  
        var userObj = data[0];
        req.session.username = username;
        req.session.userid = userObj._id;
        res.json({
          code: 1,
          msg: '登录成功'
        })
      } else {
        res.json({
          code: 0,
          msg: '用户名或者密码错误'
        })

      }
    })
  })

})

/* GET home page. */
router.get('/', function (req, res, next) {
  MongoClient.connect(url, (error, dbC) => {
    var db = dbC.db(dbname);
    db.collection(userB).find({
      userid: req.session.userid
    }).sort({
      time: -1
    }).toArray().then((data) => {
      console.log(data);
      var userid = new ObjectID(req.session.userid)
      db.collection('user').findOne({
        _id: userid
      }, function (err, user) {
        console.log(user);
        res.render('backstage', {
          title: 'blog后台管理',
          username: req.session.username,
          data: data,
          formatTime: formatTime,
          user: user
        })
      })
    }).catch(function (error) {
      console.log(error);
    })
  })
});

router.get('/userBackstage', function (req, res, next) {

  MongoClient.connect(url, (error, dbC) => {
    var db = dbC.db(dbname);
    db.collection(userB).find({}, {}).sort({
      time: -1
    }).toArray().then((data) => {
      db.collection('user').count(function (err) {
        var userid = new ObjectID(req.session.userid)
        res.render('userBackstage', {
          title: '用户',
          username: req.session.username,
          data: data,
          formatTime: formatTime,
          user: data
        })
        // return res.jsonp(data);
      })

    }).catch(function (error) {
      console.log(error);
    })
  })

});
//所有用户
router.get('/list', function (req, res, next) {

  MongoClient.connect(url, (error, dbC) => {
    var db = dbC.db(dbname);
    db.collection(userB).find({}, {

    }).sort({
      time: -1
    }).toArray().then((data) => {
      return res.jsonp({
        code: 0,
        msg: "",
        count: 13,
        data
      });

      db.collection('user').count(function (err) {
        res.render('userBackstage', {
          title: '用户',
          username: req.session.username,
          data: data,
          formatTime: formatTime,
          user: data
        })

      })
    }).catch(function (error) {
      console.log(error);
    })
  })

});



router.get('/articleBackstage', function (req, res, next) {

  MongoClient.connect(url, (error, dbC) => {
    var db = dbC.db(dbname);
    db.collection(userB).find({}, {
      userid: req.session.userid
    }).sort({
      time: -1
    }).toArray().then((data) => {
      db.collection('article').count(function (err) {
        var userid = new ObjectID(req.session.userid)
        res.render('articleBackstage', {
          title: '用户',
          username: req.session.username,
          headImgUrl: data.headImgUrl,
          data: data,
          formatTime: formatTime,
          user: data
        })
        // return res.jsonp(data);
      })

    }).catch(function (error) {
      console.log(error);
    })
  })

});
//所有文章
router.get('/article/list', function (req, res, next) {

  MongoClient.connect(url, (error, dbC) => {
    var db = dbC.db(dbname);
    db.collection(articleB).find({}, {}).sort({
      time: -1
    }).toArray().then((data) => {

      return res.jsonp({
        code: 0,
        msg: "",
        count: 122,
        data
      });
      db.collection('article').count(function (err) {
        res.render('articleBackstage', {
          title: '文章',
          username: req.session.username,
          data: data,
          formatTime: formatTime,
          user: data
        })
      })
    }).catch(function (error) {
      console.log(error);
    })
  })

});


//所有评论
router.get('/commentBackstage', function (req, res, next) {

  MongoClient.connect(url, (error, dbC) => {
    var db = dbC.db(dbname);
    db.collection(commentB).find({}, {

    }).sort({
      time: -1
    }).toArray().then((data) => {
      console.log(data);
      db.collection('comment').count(function (err) {
        var userid = new ObjectID(req.session.userid)
        res.render('commentBackstage', {
          title: '用户',
          username: req.session.username,
          data: data,
          formatTime: formatTime,
          user: data
        })
        // return res.jsonp(data);
      })

    }).catch(function (error) {
      console.log(error);
    })
  })

});
//所有评论
router.get('/comment/list', function (req, res, next) {

  MongoClient.connect(url, (error, dbC) => {
    var db = dbC.db(dbname);
    db.collection(commentB).find({}, {}).sort({
      time: -1
    }).toArray().then((data) => {
      console.log(data);
      return res.jsonp({
        code: 0,
        msg: "",
        count: 122,
        data
      });
      db.collection('comment').count(function (err) {
        res.render('commentBackstage', {
          title: '文章',
          username: req.session.username,
          data: data,
          formatTime: formatTime,
          user: data
        })
      })
    }).catch(function (error) {
      console.log(error);
    })
  })

});

//搜索用户
router.get('/user/select/', function (req, res) {
  MongoClient.connect(url, function (err, dbC) {
    var URL = require('url');
    var http = require('http');
    if (err) throw err;
    var db = dbC.db(dbname);
    var userName = new ObjectID(req.params.username);
    var arg = URL.parse(req.url, true).query;

    db.collection(userB).find({username:arg.username}, {

    }).sort({
      time: -1
    }).toArray().then((data) => {

      return res.jsonp({
        code: 0,
        msg: "",
        count: 1,
        data
      });
    }).catch(function (error) {
      console.log(error);
    })
  })
});
//搜索文章Id
router.get('/article/select/', function (req, res) {
  MongoClient.connect(url, function (err, dbC) {
    var URL = require('url');
    var http = require('http');
    if (err) throw err;
    var db = dbC.db(dbname);
    var id = new ObjectID(req.params._id);
    var arg = URL.parse(req.url, true).query;
    console.log(req.url)
    console.log(arg._id)
    db.collection('article').find({ _id :  ObjectID(arg._id) }, {

    }).sort({
      time: -1
    }).toArray().then((data) => {
      console.log(data);
      return res.jsonp({
        code: 0,
        msg: "",
        count: 1,
        data
      });
    }).catch(function (error) {
      console.log(error);
    })
  })
});
//搜索文章发表人
router.get('/article/selectUsername/', function (req, res) {
  MongoClient.connect(url, function (err, dbC) {
    var URL = require('url');
    var http = require('http');
    if (err) throw err;
    var db = dbC.db(dbname);
    var arg = URL.parse(req.url, true).query;
    db.collection('article').find({username:  arg.username }, {

    }).sort({
      time: -1
    }).toArray().then((data) => {
      console.log(data);
      return res.jsonp({
        code: 0,
        msg: "",
        count: 1,
        data
      });
    }).catch(function (error) {
      console.log(error);
    })
  })
});
//搜索文章标题
router.get('/article/selectTitle/', function (req, res) {
  MongoClient.connect(url, function (err, dbC) {
    var URL = require('url');
    var http = require('http');
    if (err) throw err;
    var db = dbC.db(dbname);
    var arg = URL.parse(req.url, true).query;
    db.collection('article').find({ title :  arg.title }, {

    }).sort({
      time: -1
    }).toArray().then((data) => {
      console.log(data);
      return res.jsonp({
        code: 0,
        msg: "",
        count: 1,
        data
      });
    }).catch(function (error) {
      console.log(error);
    })
  })
});


//删除文章
router.get('/articleBackstage/del/:id', function (req, res) {
  MongoClient.connect(url, function (err, dbC) {
    if (err) throw err;
    var db = dbC.db(dbname);
    var articleId = new ObjectID(req.params.id);
    db.collection('article').deleteOne({
      _id: ObjectID(articleId)
    }, function (err, data) {
      res.redirect('/admin/articleBackstage');
    })
  })
});
//删除用户
router.get('/userBackstage/del/:id', function (req, res) {
  MongoClient.connect(url, function (err, dbC) {
    if (err) throw err;
    var db = dbC.db(dbname);
    var userId = new ObjectID(req.params.id);
    db.collection('user').deleteOne({
      _id: ObjectID(userId)
    }, function (err, data) {
      res.redirect('/admin/userBackstage');
    })
  })
});

//删除评论
router.get('/commentBackstage/del/:id', function (req, res) {
  MongoClient.connect(url, function (err, dbC) {
    if (err) throw err;
    var db = dbC.db(dbname);
    var commentId = new ObjectID(req.params.id);
    db.collection('comment').deleteOne({
      _id: ObjectID(commentId)
    }, function (err, data) {
      res.redirect('/admin/commentBackstage');
    })
  })
});
//修改文章标题

router.get('/articleBackstage/update-api/:id', function (req, res) {
  MongoClient.connect(url, function (err, dbC) {
    if (err) throw err;
    var db = dbC.db(dbname);
    var articleId = new ObjectID(req.params.id);
    var arg = URL.parse(req.url, true).query;
    db.collection('article').updateMany({
      _id: ObjectID(articleId)
    }, {
      $set: {
        title: arg.title,
      }
    }, function (err, article) {
      res.json({
        code: 1,
        msg: '修改成功'
      });
    })
  })
});
//修改文章内容
router.get('/articleBackstage/update-apiC/:id', function (req, res) {
  MongoClient.connect(url, function (err, dbC) {
    if (err) throw err;
    var db = dbC.db(dbname);
    var articleId = new ObjectID(req.params.id);
    var s = URL.parse(req.params.id);
    console.log(s);
    var arg = URL.parse(req.url, true).query;
    db.collection('article').updateMany({
      _id: ObjectID(articleId)
    }, {
      $set: {
        content: arg.content,
      }
    }, function (err, article) {
      res.json({
        code: 1,
        msg: '修改成功'
      });
    })
  })
});
//修改用户密码

var crypto = require('crypto');
router.get('/userBackstage/update-api/:id', function (req, res) {
  MongoClient.connect(url, function (err, dbC) {
    if (err) throw err;
    var db = dbC.db(dbname);
    var userId = new ObjectID(req.params.id);
    var arg = URL.parse(req.url, true).query;
    var md5 = crypto.createHash('md5');
    var value = md5.update(arg.password).digest('hex');

    db.collection('user').updateMany({
      _id: ObjectID(userId)
    }, {
      $set: {
        password: value,
      }
    }, function (err, user) {
      res.json({
        code: 1,
        msg: '修改成功'
      });
    })
  })
});

//轮播图
router.get('/lunbo', function (req, res, next) {

  MongoClient.connect(url, (error, dbC) => {
    var db = dbC.db(dbname);
    db.collection(userB).find({}, {

    }).sort({
      time: -1
    }).toArray().then((data) => {
      db.collection('article').count(function (err) {
        var userid = new ObjectID(req.session.userid)
        res.render('lunbo', {
          title: '轮播图',
          username: req.session.username,
          data: data,
          formatTime: formatTime,
          user: data
        })
        // return res.jsonp(data);
      })

    }).catch(function (error) {
      console.log(error);
    })
  })

});



router.get('/lunbo/list', function (req, res, next) {

  MongoClient.connect(url, (error, dbC) => {
    var db = dbC.db(dbname);
    db.collection('articleL').find({}, {

    }).sort({
      time: -1
    }).toArray().then((data) => {
      db.collection('article1L').count(function (err) {
        return res.jsonp({
          code: 0,
          msg: "",
          count: 5,
          data
        });
        res.render('lunbo', {
          title: '轮播图',
          username: req.session.username,
          data: data,
          formatTime: formatTime,
          user: data
        })
        // return res.jsonp(data);
      })

    }).catch(function (error) {
      console.log(error);
    })
  })

});


//注册量
router.get('/backstage/echarts', function (req, res) {
  res.render('backstage', {
    title: '网站统计',
    username: req.session.username
  })
})
router.get('/api/tj-a1', (req, res) => {
  MongoClient.connect(url, function (err, dbC) {
    var db = dbC.db(dbname);
    db.collection('user').aggregate([{
        $project: {
          YMD: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$time"
            }
          }

        }
      }

      , {
        $group: {
          _id: '$YMD',
          num: {
            $sum: 1
          }
        }
      }, {
        $sort: {
          _id: -1
        }
      }
    ]).toArray(function (err, data) {
      // console.log(data);
      res.json(data)
    })
  })
})
router.get('/echarts2', function (req, res) {
  res.render('backstage', {
    title: '网站统计',
    username: req.session.username
  })
})

router.get('/api/tj-a2', (req, res) => {
  MongoClient.connect(url, function (err, dbC) {
    var db = dbC.db(dbname);
    db.collection('article').aggregate([{
      $project: {
        YMD: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$time"
          }
        }
      }
    }, {
      $group: {
        _id: '$YMD',
        num: {
          $sum: 1
        }
      }
    }, {
      $sort: {
        _id: -1
      }
    }]).toArray(function (err, data) {
      // console.log(data);
      res.json(data)
    })
  })
})




module.exports = router;