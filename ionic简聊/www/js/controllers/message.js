'use strict';

angular.module('flbottle.controllers')
    //信息查看回复控制器》APP控制器
    .controller('MessageCtrl', function($scope, $cordovaToast, $stateParams, $ionicScrollDelegate, $ionicModal, Message, Socket, Storage) {
        //消息数据//瓶子图文只支持一张图片+1600文字，回复单条记录只支持一张图片或1600字
        $scope.chats.inchat = true;
        var token = $scope.access.token;
        var clientRoomName;
        //初始化默认控制参数
        $scope.chat = {
            name: '',
            avatar: {},
            state: '',
            showstate: false,
            firstload: true,
            allload: false,
            error: false,
            errortext: "",
            chatname: "",
            sendmes: "",
            serializemes: "",
            imgurl: null,
            mescenter: false,
            sendtype: "text",
            loadbeforetime: 0,
            loadbeforeall: false,
            pagesize: 15,
            onscroll: false,
            shownew: false,
            scollbottom: false,
            disconnect: false,
            showold: false,
            oldmesnum: 0,
            newmesnum: 0,
            note: null
        }
        $scope.noteshow = true;
        $scope.noteshowctl = function() {
                $scope.noteshow = !$scope.noteshow;
                $ionicScrollDelegate.$getByHandle('message').scrollTop(false);
            }
            //两两名字组合本地存储聊天名
        $scope.getRoomName = function() { //返回任意顺序输入都可以生成同一个聊天名或一个瓶子ID组成聊天名
            var arr = [],
                re = "";
            for (var i = 0; i < arguments.length; i++) {
                arr[i] = arguments[i];
            }
            arr = arr.sort();
            for (var i = 0; i < arr.length; i++) {
                re += arr[i];
            }
            return re;
        }
        $scope.clientAccount = Storage.get('clientAccount');
        $scope.fromId = $stateParams.fromid;
        $scope.toaccount = $stateParams.toaccount;
        $scope.globaltype = $stateParams.type;
        if ($stateParams.type == 0) {
            //个人聊天
            $scope.chat.showstate = true; //个人聊天才有在线与否显示
            clientRoomName = $scope.getRoomName($scope.clientAccount, $scope.toaccount); //自己用户名+对方用户名构成本地存储名
            $scope.enterchat = function() {
                console.log("进入单人聊天")
                    //进入单人聊天
                Socket.emit("enteronechat", {
                    'toaccount': $scope.toaccount,
                    type: $scope.globaltype
                });
            }
        } else if ($stateParams.type == 1) {
            //单人瓶子聊天
            clientRoomName = 'onebottle' + $scope.fromId;
            $scope.enterchat = function() {
                console.log("进入单人瓶子聊天")
                    //进入单人瓶子聊天
                Socket.emit("enteronebottlechat", {
                    'fromId': $scope.fromId,
                    'toaccount': $scope.toaccount,
                    type: $scope.globaltype
                });
            }
        } else if ($stateParams.type == 2) {
            //多人瓶子聊天
            clientRoomName = "bottle" + $scope.fromId;
            $scope.enterchat = function() {
                console.log("进入多人瓶子聊天")
                    //进入多人瓶子聊天
                Socket.emit("enterbottlechat", {
                    'fromId': $scope.fromId,
                    type: $scope.globaltype
                });
            }
        } else if ($stateParams.type == 3) {
            //相遇聊天
            clientRoomName = $scope.getRoomName($scope.clientAccount, $scope.toaccount, "meet");
            $scope.enterchat = function() {
                console.log("进入相遇聊天")
                    //进入相遇聊天
                Socket.emit("entermeetchat", {
                    'fromId': $scope.fromId,
                    'toaccount': $scope.toaccount,
                    type: $scope.globaltype
                });
            }
        } else if ($stateParams.type == 4) {
            //日记聊天
            clientRoomName = "note" + $scope.fromId;
            $scope.enterchat = function() {
                console.log("进入日记聊天")
                    //进入日记聊天
                Socket.emit("enternotechat", {
                    'fromId': $scope.fromId,
                    type: $scope.globaltype
                });
            }
        }

        //发起进入聊天事件
        $scope.enterchat();

        // 清理未读消息数量
        console.log("清理未读消息数量")
        angular.forEach($scope.notice.messdata, function(data, index, arr) {
            if (data.roomname == clientRoomName) {
                data.count = 0;
            }
        });
        $scope.mesdatacount.refresh();
        // Storage.remove(clientRoomName);
        //读取本地消息，如果有消息先显示到界面
        var mesclient = {};
        var mesClient = Storage.get(clientRoomName);
        $scope.respond = [];
        if (mesClient) {
            //如果阅读过这篇文章，则隐藏
            // if ($scope.globaltype == 1 || $scope.globaltype == 2 || $scope.globaltype == 4) {
            //     $scope.noteshow = false;
            // }
            $scope.chat.name = mesClient.niname;
            $scope.chat.avatar = mesClient.avatar;
            if (mesClient.mes && mesClient.mes.length > 0) {
                $scope.respond = mesClient.mes;
                $scope.chat.loadbeforetime = mesClient.mes[mesClient.mes.length - 1].createtime;
            }
        }
        //写连载回复
        $ionicModal.fromTemplateUrl('views/templates/home/serialize.html', {
            scope: $scope
        }).then(function(modal) {
            $scope.serializemodal = modal;
        });
        $scope.serializemodalopen = function() {
            $scope.chat.sendtype = "serialize";
            $scope.serializemodal.show()
        }
        $scope.serializemodalclose = function() {
                $scope.chat.sendtype = "text";
                $scope.serializemodal.hide()
            }
            //断线重连
        Socket.on('connect', function() {
            $scope.chat.disconnect = false;
            $scope.chat.loadbeforeall = false;
            $scope.$apply($scope.chat);
            //进入聊天
            if ($scope.chats.inchat) {
                $scope.enterchat();
            }
        });
        //断线事件
        Socket.on('disconnect', function(message) {
            $scope.chat.disconnect = true;
            $scope.$apply($scope.chat);
        });

        Socket.on("chatmessage", function(data) {
            $scope.chat.firstload = false;
            if (data.state) {
                $scope.chat.state = "在线"
            } else {
                $scope.chat.state = "离线"
            }
            if (data.type == "err") {
                if (data.note) {
                    data.note.time=moment(data.note.time).format('YYYY-MM-DD HH:mm');
                    $scope.chat.note = mesclient.note = data.note;
                } else {
                    $scope.chat.error = true;
                    $scope.chat.errortext = data.mes;
                }
            } else {
                //返回成功事件
                console.log(data)
                if (data.note) {
                    // data.note.lock=false;
                    data.note.time=moment(data.note.time).format('YYYY-MM-DD HH:mm');
                    $scope.chat.note = mesclient.note = data.note;
                }
                if (data.isnotefocus) {
                    $scope.chat.notefocus = true;
                }
                $scope.chat.name = mesclient.name = data.name.substr(0, 8);
                //多人聊天需要另外获取头像列表
                if ($scope.globaltype == 0 || $scope.globaltype == 1 || $scope.globaltype == 3) {
                    $scope.chat.avatar = mesclient.avatar = data.avatar;
                    console.log("头像")
                    console.log($scope.chat.avatar)
                }
                $scope.chats.chatname = $scope.chat.chatname = data.chatname;
                var bd = [],
                    oldnum = data.oldlen;
                if (data.mes.length > 0) {
                    mesclient.mesnum = data.mes[0].len;
                    if (data.mes[0].len - oldnum > 15) {
                        $scope.chat.oldmesnum = data.mes[0].len - oldnum - 15;
                        $scope.chat.showold = true;
                    }
                    $scope.chat.loadbeforetime = data.mes[data.mes.length - 1].chats.createtime;
                    data.mes.forEach(function(d) {
                        d.chats.sendtime = moment().format('YYYY-MM') == moment(d.chats.createtime).format('YYYY-MM') ? (moment().format('YYYY-MM-DD') == moment(d.chats.createtime).format('YYYY-MM-DD') ? moment(d.chats.createtime).format('HH:mm:ss') : moment(d.chats.createtime).format('MM-DD HH:mm:ss')) : moment(d.chats.createtime).format('YYYY-MM-DD');
                        bd.push(d.chats)
                    })
                }
                $scope.respond = mesclient.mes = bd;
                //重置保存本地消息，只保存15条及当前总聊天数量num
                Storage.set(clientRoomName, mesclient);
                $scope.$apply($scope.chats);
                $scope.$apply($scope.respond);
                if (($scope.globaltype == 2 && $scope.noteshow) || ($scope.globaltype == 4 && $scope.noteshow)) {
                    $ionicScrollDelegate.$getByHandle('message').scrollTop(false);
                } else {
                    $ionicScrollDelegate.$getByHandle('message').scrollBottom(false);
                }
            }
            $scope.$apply($scope.chat);
        });
        //接收信息
        Socket.on("newmessage", function(data) {
            console.log($scope.chat.avatar)
            if ($scope.chats.chatname == data.chatname) {
                $scope.respond.push(data.respond);
                $scope.$apply($scope.respond);
                if (!$scope.chat.onscroll) {
                    $ionicScrollDelegate.$getByHandle('message').scrollBottom(true);
                    $scope.chat.shownew = false;
                } else {
                    $scope.chat.newmesnum++;
                    $scope.chat.shownew = true;
                }
                $scope.$apply($scope.chat);
                console.log("接收信息")
                    //添加保存本地消息，只保存15条及当前总聊天数量num
                var mescli = Storage.get(clientRoomName);
                mescli.mesnum++;
                if (mescli.mes.length >= 15) {
                    mescli.mes.splice(0, 1);
                }
                mescli.mes.push(data.respond);
                Storage.set(clientRoomName, mescli);
            }
        });

        function extend(a, b) {
            var bProps = Object.getOwnPropertyNames(b);
            for (var i = 0; i < bProps.length; i++) {
                var propName = bProps[i];
                a[propName] = b[propName]
            }
            return a;
        }
        //获取头像列表
        Socket.on("avatarlist", function(data) {
            console.log("瓶子人所有头像列表")
            if (data.type == "err") {
                $scope.chat.error = true;
                $scope.chat.errortext = data.mes;
            } else {
                console.log(data)
                var avatar = extend($scope.chat.avatar, data.avatar)
                console.log(avatar)
                $scope.chat.avatar = mesclient.avatar = avatar;
                Storage.set(clientRoomName, mesclient);
                $scope.$apply($scope.chat);
                console.log($scope.chat)
            }
        });
        //关注记事
        $scope.notefocus = function() {
                if (!$scope.chat.notefocus) {
                    Socket.emit("notefocus", {
                        'fromId': $scope.fromId,
                        type: $scope.globaltype
                    });
                }
            }
            //关注记事返回事件
        Socket.on("notefocus", function(data) {
            if (data.type == "err") {
                $scope.chat.notefocus = false;
                $scope.manage.showTip("关注失败", "short", "bottom")
            } else {
                $scope.chat.notefocus = true;
                $scope.$apply($scope.chat);
                $scope.manage.showTip("关注成功", "short", "bottom")
            }
        });
        //发送单人信息//单人消息传递toaccount作为接收消息人
        $scope.sendonemessage = function() {
            if ($scope.chat.sendmes && $scope.chat.chatname) {
                Socket.emit("sendonemessage", {
                    'fromid': $scope.fromId,
                    'toaccount': $scope.toaccount,
                    'chatname': $scope.chat.chatname,
                    'message': $scope.chat.sendmes,
                    'mestype': $scope.chat.sendtype,
                    'imgurl': $scope.chat.imgurl,
                    'type': $scope.globaltype
                });
                var newmes = {
                        sendtime: moment().format('HH:mm:ss'),
                        mes: $scope.chat.sendmes,
                        account: $scope.clientAccount,
                        mestype: $scope.chat.sendtype,
                        createtime: moment().valueOf(),
                    }
                    //添加到提醒 
                $scope.notice.pushoneunread({
                    roomname: clientRoomName,
                    count: 0,
                    mes: {
                        mes: $scope.chat.sendmes,
                        mestype: $scope.chat.sendtype,
                    },
                    time: moment().format('HH:mm:ss'),
                    type: $scope.globaltype,
                    niname: $scope.chat.name,
                    avatar: $scope.chat.avatar[$scope.toaccount],
                    fromid: $scope.fromId,
                    fromname: $scope.toaccount
                });
                $scope.respond.push(newmes);
                $scope.chat.sendmes = "";
                $ionicScrollDelegate.$getByHandle('message').scrollBottom(true);
                $scope.chat.shownew = false;
                //保存本地消息，只保存15条及当前总聊天数量num
                var mescli = Storage.get(clientRoomName);
                mescli.mesnum++;
                if (mescli.mes.length >= 15) {
                    mescli.mes.splice(0, 1);
                }
                mescli.mes.push(newmes);
                Storage.set(clientRoomName, mescli);
            }
        }

        //发送多人信息//多人消息传递fromid作为接收房间
        $scope.sendmessage = function() {
            if ($scope.chat.sendtype == 'serialize') {
                var sendmes = $scope.chat.serializemes;
                var emitmes = {
                    'fromid': $scope.fromId,
                    'chatname': $scope.chat.chatname,
                    'message': sendmes,
                    'mestype': $scope.chat.sendtype,
                    'imgurl': $scope.chat.imgurl,
                    'textcenter': $scope.chat.mescenter,
                    'type': $scope.globaltype
                }

            } else {
                var sendmes = $scope.chat.sendmes;
                var emitmes = {
                    'fromid': $scope.fromId,
                    'chatname': $scope.chat.chatname,
                    'message': sendmes,
                    'imgurl': $scope.chat.imgurl,
                    'mestype': $scope.chat.sendtype,
                    'type': $scope.globaltype
                }
            }
            if (sendmes && $scope.chat.chatname) {
                Socket.emit("sendmessage", emitmes);
                var newmes = {
                        sendtime: moment().format('HH:mm:ss'),
                        mes: sendmes,
                        account: $scope.clientAccount,
                        mestype: $scope.chat.sendtype,
                        imgurl: $scope.chat.imgurl,
                        textcenter: $scope.chat.mescenter,
                        createtime: moment().valueOf(),
                    }
                    //添加到提醒 
                $scope.notice.pushoneunread({
                    roomname: clientRoomName,
                    count: 0,
                    mes: {
                        mes: sendmes,
                        mestype: $scope.chat.sendtype == 'serialize' ? 'text' : $scope.chat.sendtype,
                    },
                    time: moment().format('HH:mm:ss'),
                    type: $scope.globaltype,
                    niname: $scope.chat.name,
                    avatar: $scope.chat.note.avatar,
                    fromid: $scope.fromId,
                    fromname: $scope.toaccount
                });
                $scope.respond.push(newmes);
                $scope.chat.sendmes = "";
                $scope.chat.serializemes = "";
                $scope.chat.mescenter = false;
                $scope.chat.imgurl = null;
                $scope.serializemodalclose();
                $ionicScrollDelegate.$getByHandle('message').scrollBottom(true);
                $scope.chat.shownew = false;
                //保存本地消息，只保存15条及当前总聊天数量num
                var mescli = Storage.get(clientRoomName);
                mescli.mesnum++;
                if (mescli.mes.length >= 15) {
                    mescli.mes.splice(0, 1);
                }
                mescli.mes.push(newmes);
                Storage.set(clientRoomName, mescli);
            }
        }

        //加载更多
        $scope.loadmore = function() {
            $scope.chat.onscroll = true;
            // 加载以前的消息 
            if (!$scope.chat.loadbeforeall && $scope.chat.chatname) {
                Socket.emit("loadmoremessage", {
                    loadtime: $scope.chat.loadbeforetime,
                    roomname: $scope.chat.chatname,
                    pagesize: $scope.chat.pagesize
                });
            }
        }

        // 接收更多信息
        Socket.on("loadmoremessage", function(data) {
                $scope.$broadcast('scroll.refreshComplete');
                if (data.type == "err") {
                    $scope.chat.error = true;
                    $scope.chat.errortext = data.mes;
                } else {
                    if (data.mes.length > 0) {
                        if (!$scope.chat.showold && data.mes.length < $scope.chat.pagesize) {
                            $scope.chat.loadbeforeall = true;
                        }
                        $scope.chat.loadbeforetime = data.mes[data.mes.length - 1].chats.createtime;
                        data.mes.forEach(function(d) {
                            d.chats.sendtime = moment().format('YYYY-MM-DD') == moment(d.chats.createtime).format('YYYY-MM-DD') ? moment(d.chats.createtime).format('HH:mm:ss') : moment(d.chats.createtime).format('MM-DD HH:mm');
                            $scope.respond.push(d.chats)
                        })
                        $scope.$apply($scope.respond);
                        if ($scope.chat.showold) {
                            $ionicScrollDelegate.$getByHandle('message').resize();
                            $ionicScrollDelegate.$getByHandle('message').scrollTop(true);
                            $scope.chat.showold = false;
                        }
                        $scope.$apply($scope.chat);
                    } else {
                        $scope.chat.loadbeforeall = true;
                        $scope.$apply($scope.chat);
                    }
                }
            })
            //页面滚动事件
        $scope.onscroll = function() {
            $scope.chat.onscroll = true;
            $scope.chat.scollbottom = false;
        }
        $scope.stoponscroll = function() {
            $scope.$apply($scope.chat)
        }

        //点击新消息提醒滚动到底部
        $scope.shownewend = function() {
                console.log("滚动到底部查看新消息")
                $ionicScrollDelegate.$getByHandle('message').scrollBottom(true);
            }
            //滚动到底部事件
        $scope.scollbottom = function() {
            $scope.chat.onscroll = false;
            $scope.chat.shownew = false;
            $scope.chat.scollbottom = true;
            $scope.chat.newmesnum = 0;
        }

        //加载所有未读消息
        $scope.showoldend = function() {
            $scope.chat.onscroll = true;
            // 加载以前的所有未读消息 
            if (!$scope.chat.loadbeforeall) {
                Socket.emit("loadmoremessage", {
                    loadtime: $scope.chat.loadbeforetime,
                    roomname: $scope.chat.chatname,
                    pagesize: $scope.chat.oldmesnum
                });
            }
        }

        // 键盘事件
        window.addEventListener('native.keyboardshow', keyboardShowHandler);
        window.addEventListener('native.keyboardhide', keyboardShowHandler);

        function keyboardShowHandler(e) {
            $ionicScrollDelegate.$getByHandle('message').scrollBottom(false);
        }




    })