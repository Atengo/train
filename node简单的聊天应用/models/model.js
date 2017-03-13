var mongoose = require('mongoose');  
var db = mongoose.createConnection('localhost','test');
db.on('error',console.error.bind(console,'连接错误:'));
db.once('open',function(){
console.log('数据库连接成功...')
});

var UserSchema = new mongoose.Schema({
      name:String,
      password:String,
      update:String
    });

var UesrModel = db.model('User',UserSchema);

exports.User=UesrModel;
