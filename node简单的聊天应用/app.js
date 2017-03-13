
var express = require('express');
var http = require('http');
var routes = require('./routes/routes');
var partials = require('express-partials');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var MongoStore=require('connect-mongo')(express);

var sessionStore = new MongoStore({
        db:'session-mongo'
    });

var app = express();


app.set('port', process.env.PORT || 5000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(express.bodyParser()); 
app.use(partials());
app.use(cookieParser());
app.use(session({
     secret: '12345',
     name: 'testapp', 
     cookie: {maxAge:10*60*1000,secure:false},
     store:sessionStore,
     resave:true,
     saveUninitialized: true,
}));

app.use(app.router);
app.use(express.static(__dirname + '/public'));

app.get('/', routes.index);
app.get('/login', routes.login);
app.get('/reg', routes.reg);
app.get('/users', routes.users);
app.get('/logout', routes.logout);
app.post('/reg', routes.doreg);
app.post('/login', routes.dologin);
app.get('/tlxindex', routes.tlxindex);

var server=http.createServer(app),
io = require('socket.io').listen(server),
users = [],
usocket={},
rooms={"roomname":[],"users":{}};
server.listen(app.get('port'), function(){
	console.log("Express server listening on port " + app.get('port'));
});

//socket.io聊天开始
//获取session
io.use(function(socket, next) {
    var handshake = socket.handshake;
    if (handshake.headers.cookie) {
        cookieParser('12345')(handshake, {}, function () {});  
        handshake.sessionID=handshake.signedCookies.testapp;       
        handshake.sessionStore = sessionStore;
        handshake.sessionStore.get(handshake.sessionID, function(err, data) {
            if (err) return;
            if (!data) return;
            socket.nickname=data.Username;
        });
    }
    next();
});

io.sockets.on('connection', function(socket) {
    socket.on('login', function() {
         if(socket.nickname) {
             if(users.indexOf(socket.nickname)==-1){
                 console.log(socket.nickname + "login");
                 socket.userIndex = users.length;
                 users.push(socket.nickname);
                 usocket[socket.nickname]=socket;//继承此socket对象
                 socket.emit('loginSuccess');
                 io.sockets.emit('system', socket.nickname, users.length, users, 'login');
                 socket.emit("updateroom",rooms.roomname);
                 console.log(rooms.roomname);
             }
         }
        else{
             socket.emit('loginFail');
             return;
         }
     });
     //user leaves
     socket.on('disconnect', function() {
         if(socket.nickname) {
             console.log(socket.userIndex + "logout");
             users.splice(socket.userIndex, 1);
             socket.broadcast.emit('system', socket.nickname, users.length, socket.userIndex, 'logout');
         }
         });
     //new message get
     socket.on('postMsg', function(msg, color,roomname,type) {
         if(roomname=="public"){
             //公共信息处理
             socket.broadcast.emit('newMsg',socket.nickname, msg, color,roomname,type);
             console.log(type);
         }
         else {
             //房间信息处理
             if (type == 1) {
                 console.log(type);
                 socket.broadcast.to(roomname).emit('newMsg', socket.nickname, msg, color, roomname,type)
             }
             //私聊信息处理
             if(type==2){
                 console.log(type);
                 usocket[roomname].emit('newMsg', socket.nickname, msg, color, roomname,type);

             }
         }

     });

    //创建房间
    socket.on("Croom",function(roomname){
            if(rooms.roomname.indexOf(roomname)>-1){
                socket.emit('Croomfail',"房间名已经存在！");
            }
            else{
                rooms.roomname.push(roomname);
                socket.join(roomname);
                socket.emit('Croomsuccess',roomname);
                socket.broadcast.emit("updateroom",rooms.roomname);
                console.log(rooms.roomname);
            }
        });
    //加入房间
    socket.on("jionroom",function(roomname) {
        socket.join(roomname);
        if(!rooms.users[roomname]){
            rooms.users[roomname]=[];
        }
        rooms.users[roomname].push("1");
        console.log(rooms.users[roomname]);
        socket.emit('Jroomsucc',socket.nickname,roomname,rooms.users[roomname].length);
        socket.broadcast.to(roomname).emit('Jroomsuccess',roomname,socket.nickname,rooms.users[roomname].length);
    });
   //退出房间
    socket.on("leaveroom",function(roomname){
        socket.leave(roomname);
        rooms.users[roomname].splice(0, 1);
        socket.emit('Lroomsucc',roomname);
        socket.broadcast.to(roomname).emit('Lroomsuccess',roomname,socket.nickname,rooms.users[roomname].length);

    });

    //切换私聊时给对方返回在线状态
    socket.on("connectpri",function(toname) {
        usocket[toname].emit('priconn',socket.nickname);
    });
    //关闭私聊时给对方返回离开状态
    socket.on("leavepri",function(toname) {
        usocket[toname].emit('priover',socket.nickname);
    });

});