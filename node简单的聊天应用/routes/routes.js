
var model=require('../models/model');
var crypto=require('crypto');
var moment=require('moment');

//错误信息定义
function renderr(req,res,target,tit,err){
	res.render(target, {
		title:tit,
		err:err,
		user:req.session.Username,
	});

}
exports.index = function(req, res){
		res.render('index', {
			title: '首页',
			user:req.session.Username
	});
};
//执行登录页面get请求
exports.login = function(req, res){
	renderr(req,res,'login','用户登录',0);
};

//执行登录页面post请求
exports.dologin = function(req, res){
	var md5 = crypto.createHash('md5');
    var User ={
		name: req.body.username,
		password:md5.update(req.body.password).digest('base64'),
     };
    model.User.find({ name: User.name }, function (err, doc) {
        if (!doc[0]) {
            console.log("该用户不存在");
            return renderr(req, res, 'login', '用户登录', 2);
        }
        else {
            if (doc[0].password != User.password) {
                console.log("密码错误");
                return renderr(req, res, 'login', '用户登录', 1);
            }
        }
		req.session.Username=doc[0].name;
		renderr(req,res,'index','首页');
		
	});
};

//执行注册页面get请求
exports.reg = function(req, res){
	renderr(req,res,'reg', '用户注册',0);
};


//执行注册post请求
exports.doreg = function(req, res) {
	if (req.body['password-repeat'] != req.body['password']) {
		console.log("两次输入密码不一致");
		return renderr(req,res,'reg', '用户注册', 2);
	}

	var md5 = crypto.createHash('md5');
	var newUser = {
		name: req.body.username,
		password: md5.update(req.body.password).digest('base64'),
		update:moment().format('YYYY MM DD,HH:mm:ss')
	}
	model.User.findOne({name: newUser.name}, function (err, doc) {
		if (doc) {
			console.log("已经存在注册名");
			return renderr(req,res,'reg', '用户注册', 1);
		}
		else {
			model.User.create(newUser, function (err) {
				return res.redirect('/users');
			});
		}
	});
}
exports.users = function(req, res){
	var users=model.User.find({},function(err, doc) { 
		res.render('users', {
			title: '所有用户',
			users:doc,
			user:req.session.Username,
	});
	});
};

exports.logout = function(req, res) {
	req.session.Username = null;
    res.redirect('/');
};


exports.tlxindex= function(req, res){
	console.log("tlxindex")
		res.render('tlxindex', {
			layout:false,
		});
};