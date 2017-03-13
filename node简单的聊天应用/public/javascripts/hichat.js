
window.onload = function() {
    var hichat = new HiChat();
    hichat.init();
};
var HiChat = function() {
    this.socket = null;
};
HiChat.prototype = {
    init: function() {
        var that = this;
        this.socket = io.connect();
        //socket连接登录操作
        this.socket.on('connect', function () {
            this.emit('login');
            $('#Linfo').text('请登录....');
            $('#loginWrapper').css('display', "block");
            $('#username').focus();
        });
        this.socket.on('nickExisted', function () {
            $('#Linfo').text('!nickname is taken, choose another pls');
        });
        this.socket.on('loginSuccess', function () {
            $('#loginWrapper').css("display", 'none');
            $('#messageInput').focus();
        });
        this.socket.on('loginFail', function () {
            $('#loginWrapper').css("display", 'block');
            $('#username').focus();
        });
        this.socket.on('error', function (err) {
            if ($('#loginWrapper').css("display") == 'none') {
                $('.status').text('连接失败！');
            } else {
                $('#Linfo').text("连接失败！");
            }
        });

        //socket消息操作
        this.socket.on('system', function (nickName, userCount, user, type) {
            var msg = nickName + (type == 'login' ? ' joined' : ' left');
            that._findroom("public").find('.status').text('当前在线人数：' + userCount);
            that._displayNewMsg('system ', msg, 'red', "public");
            if (type == "login") {
                var i, html = "", $zoon = $("#myroom-zone").children().eq(0).find(".room-per");
                for (i in user) {
                    html += "<a>" + user[i] + "</a><br/>";
                }
                $zoon.html(html);
            }
            if (type == "logout") {
                var $user = $("#myroom-zone").children().eq(0).find(".room-per").children().eq(user);
                $user.next().remove();
                $user.remove();
            }
        });
        this.socket.on('newMsg', function (user, msg, color, roomname, type) {
            if (type == 0 || type == 1) {    //公共聊天或房间聊天处理
                that._displayNewMsg(user, msg, color, roomname);
            }
            else if (type == 2) {       //私聊信息处理
                if (!that._findpri(user)) {
                    that._createdpri(user);
                    that._createdroom(user, 2);
                    that._findroom(user).find(".status").text("对方当前在线");
                    that._displayNewMsg(user, msg, color, user);
                }
                else {
                    that._displayNewMsg(user, msg, color, user);
                }
            }
        });

        //发送消息操作
        $('#sendBtn').click(function () {
            var messageInput = $('#messageInput'),
                msg = messageInput.val(),
                color = $('#colorStyle').val(),
                $roomname = $(".historyMsg:visible").attr("room"),
                $type = $(".historyMsg:visible").attr("type");
            messageInput.val("");
            messageInput.focus();
            if (msg.trim().length != 0) {
                that.socket.emit('postMsg', msg, color, $roomname, $type);
                that._displayNewMsg('me', msg, color, $roomname);
                return;
            }
            ;
        });
        $('#clearBtn').click(function () {
            $(".historyMsg:visible").children(".Child-Msg").html('');
        });

        //房间和私聊事件监听
        this.socket.on('Croomsuccess', function (roomname) {
            $('#CroomWrapper').css("display", "none");
            var roomzoneHtml = "<li roomname=\"" + roomname + "\"> <a class=\"item-room\">" + roomname + "</a> </li>";
            $("#co-room i").text(Number($("#co-room i").text()) + 1);
            $("#room-zone").append(roomzoneHtml);
        });
        this.socket.on('Croomfail', function (err) {
            $('#Croom-info').text("创建失败   " + err);
        });
        this.socket.on('Jroomsuccess', function (roomname, user,ulen) {
            that._findroom(roomname).find(".status").text("房间当前在线人数："+ulen);
            that._displayNewMsg("system", user + "  jioned", "red", roomname);
        });
        this.socket.on('Lroomsuccess', function (roomname, user,ulen) {
            that._findroom(roomname).find(".status").text("房间当前在线人数："+ulen);
            that._displayNewMsg("system", user + "  leaved", "red", roomname);
        });
        this.socket.on('Jroomsucc', function (user,roomname,ulen) {
            that._displayNewMsg("system", user + "  jioned", "red", roomname);
            that._findroom(roomname).find(".status").text("房间当前在线人数："+ulen);
        });
        this.socket.on('Lroomsucc', function (roomname) {
            that._findroom(roomname).prev().css("display", "block");
            that._findroom(roomname).remove();
            alert("成功退出房间：" + roomname);
        });
        this.socket.on('priover', function (roomname) {
            if (that._findroom(roomname)) {
                that._findroom(roomname).find(".status").text("对方已经离开");
            }
        });
        this.socket.on('priconn', function (roomname) {
            if (that._findroom(roomname)) {
                that._findroom(roomname).find(".status").text("对方当前在线");
            }
        });

        //更新房间
        this.socket.on("updateroom", function (rooms) {
            var i, html = "";
            var len = rooms.length;
            for (i in rooms) {
                html += "<li roomname=\"" + rooms[i] + "\"> <a class=\"item-room\">" + rooms[i] + "</a> </li>";
            }
            $("#room-zone").html(html);
            $("#co-room i").text(len);
        });

        //创建房间
        $('#cr-room').click(function () {
            $('#CroomWrapper').css("display", "block");
        });
        $('#DroomBtn').click(function () {
            $('#CroomWrapper').css("display", "none");
        });
        $('#CroomBtn').click(function () {
            var roomname = $("#Croomname").val();
            that.socket.emit('Croom', roomname);
            $('#Croom-info').text("请稍等...正在创建中...");
        });

        //加入房间
        $("#room-zone").find("a").live("dblclick", function () {
            var $t = $(this);
            var roomname = $t.parent().attr("roomname");
            if (!that._findroom(roomname)) {
                $("#myroom-zone").append("<li roomname=\"" + roomname + "\"> <a class=\"item-room\">" + roomname + "</a> <i class=\"del\">     退出</i></li>");
                that._createdroom(roomname, 1);
                that.socket.emit('jionroom', roomname);
            }
            that._findroom(roomname).css("display", "block");
            that._findroom(roomname).siblings().css("display", "none");
        });

        //切换房间聊天
        $("#myroom-zone").find(".item-room").live("dblclick", function () {
            var $t = $(this);
            var roomname = $t.parent().attr("roomname");
            that._findroom(roomname).css("display", "block");
            that._findroom(roomname).siblings().css("display", "none");
        });

        //退出房间
        $("#myroom-zone i.del").live("click", function () {
            var $a = $(this).parent();
            var roomname = $a.attr("roomname");
            $a.remove();
            that.socket.emit('leaveroom', roomname);
        });

        //创建私聊
        $(".room-per a").live("dblclick", function () {
            var username = $("#user").text();
            var name = $(this).text();
            if (username != name) {                       //自己不能跟自己聊天
                if (!that._findpri(name)) {              //如果不存在用户私聊就创建，存在就切换
                    that._createdroom(name, 2);
                    that._createdpri(name);
                    var $room = that._findroom(name);
                    $room.find(".status").text("对方当前在线");
                    $room.css("display", "block");
                    $room.siblings().css("display", "none");
                }
                else {
                    that._findroom(name).css("display", "block");
                    that._findroom(name).siblings().css("display", "none");
                }
            }
            else {
                alert("自己不能跟自己聊天！")
            }
        });

        //切换私聊
        $("#priroom-zone a").live("dblclick", function () {
            var $t = $(this);
            var roomname = $t.attr("priname");
            that._findroom(roomname).css("display", "block");
            that._findroom(roomname).siblings().css("display", "none");
            that.socket.emit('connectpri',roomname);
        });


        //退出私聊
        $("#priroom-zone i").live("click", function () {
            var t = $(this);
            var $p = t.prev();
            var toname=$p.attr("priname");
            var $n = t.next();
            var room = $p.attr("priname");
            that._findroom(room).prev().css("display","block");
            that._findroom(room).remove();
            $p.remove();
            $n.remove();
            t.remove();
            that.socket.emit('leavepri',toname);
        });

    },
    //私有方法
    //显示信息
    _displayNewMsg: function(user, msg, color,roomname) {
        var container =this._findroom(roomname).children(".Child-Msg"),
            color = color||"#000",
            date = new Date().toTimeString().substr(0, 8),
            msgToDisplay=("<p style=\"color:"+color+";clear:both\">"+user + "(" + date + "): <br><span class=\"timespan\">"+ msg+"</span></p>");
        container.append(msgToDisplay);
        container.scrollTop = container.scrollHeight;
    },
    //查找返回房间名
    _findroom:function(roomname) {
        var i;
        var $wrap = $(".msg-wrap");
        var $ch = $wrap.children();
        var len = $ch.length;
        for (i = 0; i < len; i++) {
            if ($ch.eq(i).attr("room") == roomname) {
                return $ch.eq(i);
            }
        }
    },
    //创建房间
    _createdroom:function(roomname,type){
        var a="房间名：";
        if(type==2){a="私聊："};
        var $html= "<div class=\"historyMsg\"room=\""+roomname+"\"type=\""+type+"\"><div class=\"banner\"> <h4 >"+a+""+roomname+"</h4><span class=\"status\"></span> </div><div class=\"Child-Msg\"></div> </div>";
        $(".msg-wrap").append($html);
    },
    //判断私聊是否存在
    _findpri:function(roomname) {
        var i;
        var $wrap = $("#priroom-zone");
        var $ch = $wrap.children("a");
        var len = $ch.length;
        for (i = 0; i < len; i++) {
            if ($ch.eq(i).attr("priname") == roomname) {
                return true;
            }
        }
    },
    //创建私聊
    _createdpri:function(priname){
        var $html= "<a class=\"item-room\"priname=\""+priname+"\">"+priname+"</a><i class=\"del\">     关闭</i></br>";
        $("#priroom-zone").append($html);
    }

};
