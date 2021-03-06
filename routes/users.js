var express = require('express');
var router = express.Router();

var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var url = 'mongodb://localhost:27017'
var dbname = 'czblog';
var articleB = 'article';
var userB = 'user';


function formatTime(date) {
  var y = date.getFullYear();
  var m = date.getMonth();
  var d = date.getDate();
  var h = date.getHours();
  var mi = date.getMinutes();

  return y + '-' + m + '-' + d + ' ' + h + ':' + mi;

}

/* GET users listing. */
// 用户页面
router.get('/', function (req, res, next) {
  //数据库中把文章列表查出来，渲染到users模板
  MongoClient.connect(url, (error, dbC) => {
    var db = dbC.db(dbname);
    db.collection(articleB).find({
      userid: req.session.userid
    }).sort({
      time: -1
    }).toArray().then((data) => {
      console.log(data);
      var userid = new ObjectID(req.session.userid)
      db.collection('user').findOne({_id:userid},function(err,user){
        res.render('users', {
          title: '用户首页',
          username: req.session.username,
          data: data,
          formatTime: formatTime,
          user:user
        })
      })
    }).catch(function (error) {
      console.log(error);
    })
  })
});

// 注册页面
router.get('/register', function (req, res, next) {
  res.render('register', {
    title: "注册",
    username: req.session.username
  });
});


var crypto = require('crypto');
// 注册接口
router.post('/api-register', (req, res) => {
  try {

    //获取到 注册页面提交的数据  req。body   { username: '12', password: '12' }
    console.log(req.body);
    var username = req.body.un;

    //使用md5对密码进行加密
    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.pd).digest('hex');
    console.log(password);

    //保存注册时间
    var time = new Date();
    var user = {
      username,
      password,
      time
    }

    //存到数据库里面
    MongoClient.connect(url, function (error, dbC) {
      var db = dbC.db(dbname);
      //先做查询  有没有这个用户
      db.collection('user').find({
        username
      }).toArray(function (error, findData) {
        console.log(findData);
        if (findData.length) {
          //用户名存在
          res.json({
            code: 0,
            msg: "用户名已经存在"
          })
        } else {
          db.collection('user').insertOne(user, (err, data) => {
            console.log(data);
            // 返回json数据
            res.json({
              code: 1,
              msg: "注册成功"
            })

          })
        }
      })
    })
  } catch (error) {
    console.log(error);
    res.json({
      code: 500,
      msg: error
    })
  }



})


// 登录页面
router.get('/login', function (req, res) {
  res.render('login', {
    title: "登录",
    username: req.session.username
  })
})

// 登录接口
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

//退出
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) throw err;
    console.log('session  清除成功');
    //重定向
    res.redirect('/');
  })
})


// 发表文章
router.post('/publish', (req, res) => {
  console.log(req.body);
  var article = {
    title: req.body.title,
    content: req.body.content,
    time: new Date(),
    username: req.session.username,
    userid: req.session.userid
  }
  console.log(article);
  MongoClient.connect(url, function (err, dbC) {
    var db = dbC.db(dbname);
    db.collection('article').insertOne(article, (error, data) => {
      if (error) throw error;
      res.redirect('/users')
    })
  })

})
router.get('/article/:id', function (req, res) {
  MongoClient.connect(url, function (err, dbC) {
    var db = dbC.db(dbname);
    db.collection('article').findOneAndUpdate({ _id: ObjectID(req.params.id) }, {
      $inc: {
        pv: 1
      }
    }, {
        returnOriginal: false
      }, function (error, data) {
        db.collection('comment').find({ artid: req.params.id }).toArray(function (error, comments) {
          console.log(comments);
          res.render('article', {
            title: '文章详情',
            username: req.session.username,
            article: data.value,
            formatTime,
            comment: comments
          })
        })
      })
  })
})
router.post('/article/:id', function (req, res) {
  var id = req.params.id;
  var comment = {
    content: req.body.content,
    time: new Date(),
    authorName: req.session.username,
    userid: req.session.userid,
    artid: id
  }
  MongoClient.connect(url, function (err, dbC) {
    var db = dbC.db(dbname);
    db.collection('comment').insertOne(comment, function (error, data) {
      if (error) throw error;
      res.redirect('/users/article/' + id)
    })
  })
});

var path = require('path')
var fs = require('fs')
//上传图片的路由
router.post('/file_upload',(req,res) => {
  console.log(req.files[0],'22222');
  //头像的目标地址
  var ts = Date.now();
  var imgUrl = '/images/'+ts+req.files[0].originalname
  var des_file =path.join(__dirname,'../public'+imgUrl);
  fs.readFile(req.files[0].path,function(err,data){
    fs.writeFile(des_file,data,function(err){
      console.log('图片上传成功',imgUrl);
      //把图片地址插入到数据库users表
      MongoClient.connect(url,(err,dbC) => {
        var db = dbC.db(dbname);
        var userid = new ObjectID(req.session.userid);
        db.collection('user').updateOne({_id:userid},{
          $set:{
            headImgUrl:imgUrl
          }
        })
        .then((result) => {
          res.redirect('back')
        }).catch((err) => {
          
        });
      })

      
    })
  })

})



module.exports = router;