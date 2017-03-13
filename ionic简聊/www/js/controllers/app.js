'use strict';

angular.module('flbottle.controllers')
    //APP控制器
    .controller('AppCtrl', function($ionicHistory, $timeout, $cordovaToast, $ionicPlatform, $scope, $state, $ionicModal, $cordovaVibration, $ionicLoading, $ionicPopup, $rootScope, $ionicActionSheet, $ionicSideMenuDelegate, Home, Storage, Login, Socket) {
        moment.locale('zh-cn');
        //双击退出
        $ionicPlatform.registerBackButtonAction(function(e) {
            //判断处于哪个页面时双击退出
            if ($state.includes("app.home")) {
                // ionic.Platform.exitApp();
            } else if ($state.includes("app.message")) {
                $state.go("app.home." + $scope.hometab.tab)
            } else {
                $ionicHistory.goBack();
            }
            e.preventDefault();
            return false;
        }, 102);

        //AppCtrl不缓存,用于刷新登录信息及取登录数据
        $scope.clientAccount = Storage.get('clientAccount');
        $scope.account = {}
        $scope.account.avatar = Storage.get('clientAvatar');
        //全局等待
        $scope.load = {};
        //提醒事件，包括新瓶子，未读消息，新相遇
        $scope.notice = {};
        $scope.notice.messdata = [] //消息提醒列表
        $scope.notice.meetdata = [] //相遇提醒列表
        $scope.notice.bottledata = [] //漂流瓶提醒列表
            //全局token，AppCtrl不缓存，防止token错误
        $scope.access = {};
        $scope.access.token = Storage.get('token');
        //全局聊天
        $scope.chats = {};
        $scope.chats.chatname = "";
        $scope.chats.inchat = false;
        //全局是否设置中控制
        $scope.set = {
                // 全局设置控制
                issetting: false,
                savesetting: {},
                setready: Boolean(Number(Storage.getstr('setready'))),
                // 全局声音震动提醒控制，在提醒页面则不提醒
                vibrate: Storage.get('setting').shock,
                volice: Storage.get('setting').voile,
                innoticepage: false
            }
            //当前首页tab项切换
        $scope.hometab = {
                tab: "seaside"
            }
            //全局等待事件
        $scope.load.showaiting = function(bool) {
            $ionicLoading.show({
                content: '',
                animation: 'fade-in',
                showBackdrop: bool,
                maxWidth: 200,
                showDelay: 0
            })
        }
        $scope.manage = {
            causelist: [{
                value: "色情暴力赌博"
            }, {
                value: "欺诈骚扰"
            }, {
                value: "广告侵权"
            }, {
                value: "其他等"
            }, ],
            cause: "其他等",
            connecterr: false
        };
        $scope.manage.tipoff = function(type, id) {
            console.log("举报")
            if (type == 0) {
                var n = "人",
                    m = 500;
            } else if (type == 1 || type == 2) {
                var n = "话题",
                    m = 200;
            } else {
                var n = "日记",
                    m = 200;
            }
            var myPopup = $ionicPopup.show({
                title: '举报操作提示',
                template: '你确定举报此' + n + '吗,举报总数大于' + m + '次，此' + n + '将会自动锁定！<div class="list popupradio tipoffradio"><ion-radio ng-repeat="item in manage.causelist" name="cause" ng-model="manage.cause"  ng-value="item.value">{{ item.value}}</ion-radio></div>',
                scope: $scope,
                buttons: [{
                    text: '取消',
                    type: 'button-light',
                    onTap: function(e) {
                        myPopup.close();
                    }
                }, {
                    text: '确定',
                    type: 'button-positive',
                    onTap: function(e) {
                        myPopup.close();
                        Home.tipoff($scope.access.token, type, id, $scope.manage.cause).$promise.then(function(res) {
                            $scope.manage.showTip(res.mes, "short", "bottom");
                        }, function(res) {
                            $scope.manage.showTip("操作失败！", "short", "bottom");
                        });
                    }
                }]
            });
        }

        //设置调用函数震动 
        $scope.startVib = function() {
            // 双震动
            console.log("震动")
            console.log($scope.set.vibrate)
            console.log($scope.set.innoticepage)
            if ($scope.set.vibrate && !$scope.set.innoticepage) {
                $cordovaVibration.vibrate([150, 70, 80]);
            }
            // 声音
            if ($scope.set.volice && !$scope.set.innoticepage) {

            }
        };
        // 全局提示信息
        $scope.manage.showTip = function(mes, time, position, cb) {
                $cordovaToast.show(mes, time, position).then(function(success) {
                    if (cb) {
                        cb()
                    }
                });
            }
            //监听路由变化，路由变化事件集中在这里处理
        $rootScope.$on('$stateChangeStart', function(event, next, nextp, prev, prevp) {
            // 退出聊天界面时清除消息on事件，防止重复on
            if (prev.chat) {
                Socket.off("chatmessage");
                Socket.off("newmessage");
                Socket.off("loadmoremessage");
                Socket.off("avatarlist");
                $scope.chats.chatname = "";
                $scope.chats.inchat = false;
            }
            // 将当前页是否提醒页设置为否
            if (next.messdata) {
                $scope.set.innoticepage = true;
            } else {
                $scope.set.innoticepage = false;
            }
            //判断设置是否完成
            $scope.set.setready = Boolean(Number(Storage.getstr('setready')));
            console.log("设置准备" + $scope.set.setready)
                //判断设置是否已保存
            if ($scope.set.issetting) {
                event.preventDefault()
                var myPopup = $ionicPopup.show({
                    title: '系统提示',
                    template: '设置还未保存，离开将不保存设置信息，你确定离开吗！',
                    scope: $scope,
                    buttons: [{
                        text: '取消',
                        type: 'button-light',
                        onTap: function(e) {
                            myPopup.close();
                        }
                    }, {
                        text: '确定',
                        type: 'button-positive',
                        onTap: function(e) {
                            $scope.set.issetting = false;
                            $state.go(next.name)
                        }
                    }, ]
                });
            }
        });

        //对话中的消息条数记录数据//消息条数是全局数据，但由子控制器更新
        //瓶子消息记录条数,后台动态更新这个数据
        $scope.mesdatacount = {
                allcount: 0,
                allcountmes: 0
            }
            //消息数量界面更新
        $scope.mesdatacount.refresh = function() {
                $scope.mesdatacount.allcount = 0;
                angular.forEach($scope.notice.messdata, function(data, index, array) {
                    $scope.mesdatacount.allcount += data.count;
                    if ($scope.mesdatacount.allcount > 99) {
                        $scope.mesdatacount.allcountmes = "99+";
                    } else {
                        $scope.mesdatacount.allcountmes = $scope.mesdatacount.allcount;
                    }
                });
                console.log("计数" + $scope.mesdatacount.allcountmes)
            }
            // 测试提醒，清空提醒
        Storage.remove($scope.clientAccount + "unreadmessdata");
        //获取本地未读消息
        $scope.notice.messdata = Storage.get($scope.clientAccount + "unreadmessdata");
        //获取本地未读漂流瓶
        $scope.notice.bottledata = Storage.get($scope.clientAccount + "unreadbottledata");
        //获取本地未读相遇
        $scope.notice.meetdata = Storage.get($scope.clientAccount + "unreadmeetdata ");
        // 刷新全局消息计数
        $scope.mesdatacount.refresh();

        //保存本地未读消息
        $scope.setClientUnread = function() {
            //保存新的未读消息到本地
            Storage.set($scope.clientAccount + "unreadmessdata", $scope.notice.messdata);
            //保存新的未读漂流瓶到本地
            Storage.set($scope.clientAccount + "unreadbottledata", $scope.notice.bottledata);
            //保存新的未读相遇到本地
            Storage.set($scope.clientAccount + "unreadmeetdata", $scope.notice.meetdata);
            // 刷新全局消息计数
            $scope.mesdatacount.refresh();
        }

        //个人发消息时更新自己的提醒
        $scope.notice.pushoneunread = function(oneunread) {
            //分类单个未读消息 
            var messdataitem = {},
                meetdataitem = {},
                bottledataitem = {},
                hasthisunread = false,
                togetdata;
            if (oneunread.type == 0 || oneunread.type == 1 || oneunread.type == 2 || oneunread.type == 3 || oneunread.type == 4) {
                togetdata = $scope.notice.messdata;
            } else if (oneunread.type == 5) {
                togetdata = $scope.notice.meetdata;
            } else {
                togetdata = $scope.notice.bottledata;
            }
            angular.forEach(togetdata, function(data, index, arr) {
                // 如果已经存在提醒，则修改提醒数目和时间
                if (data.roomname == oneunread.roomname) {
                    console.log("存在提醒，修改")
                    data.sortime = moment(oneunread.time).valueOf();
                    data.time = moment(oneunread.time).format("HH:mm:ss");
                    data.mes.mestype = oneunread.mes.mestype;
                    data.mes.mes = oneunread.mes.mes;
                    hasthisunread = true;
                    return;
                }
            });
            // 如果不存在则添加一个提醒
            if (!hasthisunread) {
                console.log("不存在提醒，添加")
                togetdata.push(oneunread);
            }
        }

        //获得单个新提醒时，分类排序新提醒
        $scope.notice.getoneunread = function(oneunread) {
            //如果在聊天中，就发送增加缓存聊天消息记数事件
            if ($scope.chats.chatname == oneunread.roomname) {
                console.log("发送增加计数")
                Socket.emit("plusunreadcount", {
                    roomname: oneunread.roomname
                })
            }
            console.log("获得单个新提醒")
            console.log(oneunread)
                //分类单个未读消息 
            var messdataitem = {},
                meetdataitem = {},
                bottledataitem = {},
                hasthisunread = false,
                togetdata;
            if (oneunread.type == 0 || oneunread.type == 1 || oneunread.type == 2 || oneunread.type == 3 || oneunread.type == 4) {
                togetdata = $scope.notice.messdata;
            } else if (oneunread.type == 5) {
                togetdata = $scope.notice.meetdata;
            } else {
                togetdata = $scope.notice.bottledata;
            }
            angular.forEach(togetdata, function(data, index, arr) {
                // 如果已经存在提醒，则修改提醒数目和时间
                if (data.roomname == oneunread.chatname) {
                    data.sortime = moment(oneunread.sendtime).valueOf()
                    data.time = moment().format('YYYY-MM') == moment(oneunread.sendtime).format('YYYY-MM') ? (moment().format('YYYY-MM-DD') == moment(oneunread.sendtime).format('YYYY-MM-DD') ? moment(oneunread.sendtime).format('HH:mm:ss') : moment(oneunread.sendtime).format('MM-DD')) : moment(oneunread.sendtime).format('YYYY-MM-DD');
                    data.mes.mestype = oneunread.mestype;
                    data.mes.mes = oneunread.mes;
                    //如果不在聊天中，就增加聊天消息计数
                    if ($scope.chats.chatname != oneunread.roomname) {
                        data.count++;
                        $scope.startVib();
                    }
                    hasthisunread = true
                }
            });
            // 如果不存在提醒则远程获取提醒
            if (!hasthisunread) {
                Home.getoneunread($scope.access.token, oneunread.chatname).$promise.then(function(res) {
                    $scope.$broadcast('scroll.refreshComplete');
                    if (res.bool) {
                        console.log("如果不存在提醒则远程获取提醒")
                        console.log(res.mes)
                        messdataitem = res.mes;
                        messdataitem.sortime = moment(oneunread.sendtime).valueOf()
                        messdataitem.time = moment().format('YYYY-MM') == moment(oneunread.sendtime).format('YYYY-MM') ? (moment().format('YYYY-MM-DD') == moment(oneunread.sendtime).format('YYYY-MM-DD') ? moment(oneunread.sendtime).format('HH:mm:ss') : moment(oneunread.sendtime).format('MM-DD')) : moment(oneunread.sendtime).format('YYYY-MM-DD');
                        messdataitem.count = 0;
                        if ($scope.chats.chatname != oneunread.roomname) {
                            messdataitem.count = 1;
                            $scope.startVib();
                        }
                        messdataitem.mes.mestype = oneunread.mestype;
                        messdataitem.mes.mes = oneunread.mes;
                        togetdata.push(messdataitem);
                        $scope.$apply($scope.notice);
                        $scope.setClientUnread();
                        $scope.$apply($scope.mesdatacount);
                    }
                })
            } else {
                $scope.$apply($scope.notice);
                $scope.setClientUnread();
                $scope.$apply($scope.mesdatacount);
            }
        }


        //获取未读消息
        $scope.notice.getunread = function() {
            Home.getunread($scope.access.token).$promise.then(function(res) {
                $scope.$broadcast('scroll.refreshComplete');
                if (res.bool) {
                    var unread = res.mes;
                    var hasnewnotice = false;
                    console.log("获取的有未读消息")
                    console.log(unread)
                        //分类未读数据
                        //重置消息列表
                    $scope.notice.messdata = [];
                    $scope.notice.meetdata = [];
                    $scope.notice.bottledata = []
                    var messdataitem = {},
                        meetdataitem = {},
                        bottledataitem = {};
                    angular.forEach(unread, function(data, index, arr) {
                        if (data.type == 0 || data.type == 1 || data.type == 2 || data.type == 3 || data.type == 4) {
                            console.log(data);
                            messdataitem = data;
                            messdataitem.sortime = moment(data.mes.createtime).valueOf()
                            messdataitem.time = moment().format('YYYY-MM') == moment(data.mes.createtime).format('YYYY-MM') ? (moment().format('YYYY-MM-DD') == moment(data.mes.createtime).format('YYYY-MM-DD') ? moment(data.mes.createtime).format('HH:mm:ss') : moment(data.mes.createtime).format('MM-DD')) : moment(data.mes.createtime).format('YYYY-MM-DD');
                            var climes = Storage.get(data.roomname);
                            messdataitem.count = data.mes.len - data.onelen;
                            if (messdataitem.count > 0) {
                                hasnewnotice = true;
                            }
                            $scope.notice.messdata.push(messdataitem)
                        }
                    })
                    console.log($scope.notice.messdata)
                    if (hasnewnotice) {
                        $scope.startVib();
                    }
                    $scope.setClientUnread();
                }
            })
        }

        //点击未读消息进入聊天
        $scope.notice.readmessdata = function(i) {
            if ($scope.notice.messdata[i].type == 0) {
                $state.go("app.message", {
                    fromid: $scope.notice.messdata[i].fromname,
                    type: $scope.notice.messdata[i].type,
                    toaccount: $scope.notice.messdata[i].toaccount
                })
            }
        }

        //socket全局连接与退出
        Socket.open(); //打开连接
        Socket.on('connect', function() {
            $scope.manage.connecterr = false;
            $scope.notice.getunread(); //重连接时获取未读消息
            Socket.emit('entersocket', {
                token: $scope.access.token
            }, function() {
                console.log('请求连接到服务器');
            });
        });
        Socket.on('connect_error', function() {
            console.log("connect_error")
            $scope.manage.connecterr = true;
            $scope.manage.connecterrtext = "连接服务器失败！"
        });
        //真正有效连接事件
        Socket.on('entersocket', function(data) {
            if (!data.bool) {
                Socket.close(function() {
                    Storage.remove('token');
                    $state.go("login");
                    $scope.manage.showTip(data.mes, "long", "center");
                });
            } else {
                console.log('socket已连接到服务器');
            }
        });
        //重复登录事件,前一用户被退出
        Socket.on('doublelogin', function(data) {
            Socket.close(function() {
                Storage.remove('token');
                $scope.manage.showTip(data.mes, "long", "center");
                $state.go("login");
            });
        });
        //断开连接本地事件
        Socket.on('disconnect', function(message) {
            $scope.manage.connecterr = true;
            $scope.manage.connecterrtext = "网络错误，未连接！"
        });

        //新消息提醒事件
        Socket.on('newnotice', function(data) {
            console.log("新提醒")
            $scope.notice.getoneunread(data);
        });
        Socket.on('shotoff', function() {
                var alertPopup = $ionicPopup.alert({
                    title: '系统提示',
                    template: '你因被举报过多，账号已经被锁定，请到官网申请解锁。'
                });
                $timeout(function() {
                    alertPopup.close();
                    Storage.remove("token"); //注销用户,删除tokens
                    Socket.close(function() { //退出断开连接
                        $state.go("login");
                    });
                }, 5000);
            })
            //全局设置背景样式
        $scope.setted = Home.setted;
        //退出操作
        $scope.login_out = function() {
            $ionicActionSheet.show({
                buttons: [{
                    text: '注销账号'
                }, ],
                titleText: '退出账号提示',
                cancelText: '取消',
                cancel: function() {},
                buttonClicked: function(index) {
                    $scope.load.showaiting(true);
                    Socket.emit('logout');
                    Socket.on('logout', function(res) {
                        if (res.bool) {
                            Storage.remove("token"); //注销用户,删除tokens
                            Socket.off('disconnect');
                            Socket.close(function() { //退出断开连接
                                $ionicLoading.hide();
                                $state.go("login");
                            });
                        } else {
                            $ionicLoading.hide();
                            $scope.manage.showTip(res.mes, "short", "bottom");
                        }
                    })
                }
            });
        }

        //查看名片公共查询
        //好友名片modal
        $scope.firendcard = {}
        $ionicModal.fromTemplateUrl('views/templates/home/card.html', {
            scope: $scope
        }).then(function(modal) {
            $scope.card_modal = modal;
        });
        $scope.firendcard.showcard = function(account) {
                $scope.load.showaiting(false);
                //获取名片
                Home.getcard($scope.access.token, account).$promise.then(function(res) {
                    console.log(res.mes)
                    var ncard = {};
                    ncard = {
                        account: account,
                        avtar: res.mes.setting.avatar,
                        niname: res.mes.setting.name,
                        createtime:moment(res.mes.time).format('YYYY-MM-DD'),
                        sign: res.mes.setting.sign,
                        birthcity: res.mes.setting.birthcity,
                        livecity: res.mes.setting.livecity,
                        age: res.mes.setting.birthday,
                        isfriend: res.mes.isfriend,
                        time: moment(res.mes.betime).format('YYYY-MM-DD'),
                        shield: res.mes.shield
                    }
                    $scope.card = ncard;
                    $ionicLoading.hide();
                }, function(res) {
                    $ionicLoading.hide();
                });
                $scope.card_modal.show();
            }
            //关闭名片
        $scope.firendcard.closeshowcard = function() {
                $ionicLoading.hide();
                $scope.card_modal.hide();
            }
            // 屏蔽此人
        $scope.firendcard.addshield = function(account) {
                Home.addshield($scope.access.token, account).$promise.then(function(res) {
                    if (res.bool) {
                        $scope.card.shield = true;
                    } else {
                        $scope.manage.showTip(res.mes, "short", "bottom");
                    }
                }, function(res) {
                    $scope.manage.showTip("操作失败！", "short", "bottom");
                });
            }
            // 取消屏蔽此人
        $scope.firendcard.unshield = function(account) {
                Home.unshield($scope.access.token, account).$promise.then(function(res) {
                    if (res.bool) {
                        $scope.card.shield = false;
                    } else {
                        $scope.manage.showTip(res.mes, "short", "bottom");
                    }
                }, function(res) {
                    $scope.manage.showTip("操作失败！", "short", "bottom");
                });
            }
            //请求加好友
        $scope.firendcard.addfriend = function(account) {
            $scope.load.showaiting(false);
            var newfriend = {
                account: account,
            }
            Home.addfriend($scope.access.token, newfriend).$promise.then(function(res) {
                if (res.bool) {
                    $ionicLoading.hide();
                    $scope.card.isfriend = true;
                    $scope.card.time = moment().format("HH:mm:ss")
                } else {
                    $ionicLoading.hide();
                    $scope.manage.showTip(res.mes, "short", "bottom");
                }
            }, function(res) {
                $ionicLoading.hide();
                $scope.manage.showTip("操作失败！", "short", "bottom");
            });
        }
    })