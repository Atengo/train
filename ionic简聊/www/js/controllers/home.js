'use strict';

angular.module('flbottle.controllers')
    //首页控制器》APP控制器
    .controller('HomeCtrl', function($scope, $cordovaToast, $http, $ionicLoading, Note, $state, $ionicPopup, $ionicModal, $timeout, $ionicTabsDelegate, $ionicScrollDelegate, Home, Storage) {
        var token = $scope.access.token;
        $scope.set.setready = Boolean(Number(Storage.getstr('setready')));

        //写新漂流瓶//创建漂流瓶是首页公共页面
        $ionicModal.fromTemplateUrl('views/templates/home/newbottle.html', {
            scope: $scope
        }).then(function(modal) {
            $scope.newbottle_modal = modal;
        });
        $scope.CreateCtrl = {
            setting: false,
            isFloating: false,
        }
        $scope.bottletimelist = Home.bottletimelist //定义漂流时间选择列表
        $scope.bottletomanlist = Home.bottletomanlist //定义漂流人数选择列表
        $scope.bottletypelist = Home.bottletypelist
        $scope.NewBottle = { //设置新瓶子默认数据
            Bottle_Text: "",
            textcenter: false,
            hasimg: false,
            imgurl: "",
            settype: 1,
            settypetext: "单人话题",
            choosedtime: true,
            choosedtoman: true,
            choosedtype: true,
            timeval: "一个月",
            tomanval: "不限",
        }
        $scope.addnewbottle = function() {
            if ($scope.set.setready) {
                $scope.newbottle_modal.show();
            } else {
                var myPopup = $ionicPopup.show({
                    title: '系统提示',
                    template: '您还没完成基本信息设置，还不能发话题操作。发话题操作需完成昵称、性别、生日、出生地、居住地的信息填写！',
                    scope: $scope,
                    buttons: [{
                        text: '取消',
                        type: 'button-light',
                        onTap: function(e) {
                            myPopup.close();
                        }
                    }, {
                        text: '去填写',
                        type: 'button-positive',
                        onTap: function(e) {
                            $state.go('app.zone.setting')
                        }
                    }]
                });
            }
        }
        $scope.choosetype = function() {
            $scope.myPopup = $ionicPopup.show({
                title: '选择话题类型',
                template: '<div class="list popupradio"><ion-radio ng-repeat="item in bottletypelist" name="type" ng-model="NewBottle.settype" ng-value="item.value" ng-click="myPopup.close();NewBottle.settypetext=item.text;">{{ item.text }}</ion-radio></div>',
                scope: $scope
            });
        }
        $scope.choosetime = function() {
            $scope.myPopup = $ionicPopup.show({
                title: '话题漂流时间',
                template: '<div class="list popupradio"><ion-radio ng-repeat="item in bottletimelist"  name="timeval" ng-model="NewBottle.timeval" ng-value="item.value" ng-click="myPopup.close();">{{ item.text }}</ion-radio></div>',
                scope: $scope
            });
        }
        $scope.chooseman = function() {
            $scope.myPopup = $ionicPopup.show({
                title: '话题漂流人数',
                template: '<div class="list popupradio"><ion-radio ng-repeat="item in bottletomanlist" name="toman" ng-model="NewBottle.tomanval" ng-value="item.value" ng-click="myPopup.close();">{{ item.text }}人</ion-radio></div>',
                scope: $scope
            });
        }
        $scope.changeSetting = function() {
            $ionicScrollDelegate.$getByHandle('bottle').resize();
            $scope.CreateCtrl.setting = !$scope.CreateCtrl.setting
        }
        $scope.createBottle = function(Bottle) {
            if (Bottle.Bottle_Text.length <= 0) { //瓶子内容不能为空
                var myPopup = $ionicPopup.show({
                    title: '系统提示',
                    template: '瓶子内容不能为空，请填写',
                    scope: $scope,
                    buttons: [{
                        text: '确定',
                        type: 'button-positive',
                        onTap: function(e) {
                            myPopup.close();
                        }
                    }]
                });
            } else {
                $scope.CreateCtrl.isFloating = true;
                //漂流时长计算
                var settime = $scope.NewBottle.timeval;

                switch (settime) {
                    case '三天':
                        $scope.NewBottle.settime = {
                            day: 3,
                            type: 'days'
                        }
                        break;
                    case '一星期':
                        $scope.NewBottle.settime = {
                            day: 7,
                            type: 'days'
                        }
                        break;
                    case '一个月':
                        $scope.NewBottle.settime = {
                            day: 1,
                            type: 'months'
                        }
                        break;
                    case '半年':
                        $scope.NewBottle.settime = {
                            day: 6,
                            type: 'months'
                        }
                        break;
                    case '永远漂流':
                        $scope.NewBottle.settime = {
                            day: 0,
                            type: 'days'
                        }
                        break;
                }
                Home.createbottle(token, $scope.NewBottle).$promise.then(function(res) {
                    if (res.bool) {
                        console.log(res.mes);
                        $scope.CreateCtrl.setting = false;
                        $scope.CreateCtrl.isFloating = false; //投递瓶子，成功则关闭
                        $scope.NewBottle.Bottle_Text = ""; //重置瓶子
                        $scope.NewBottle.hasimg = false,
                            $scope.NewBottle.settype = 1;
                        $scope.NewBottle.textcenter = false;
                        $scope.NewBottle.choosedtime = true;
                        $scope.NewBottle.choosedtoman = true;
                        $scope.NewBottle.timeval = "一个月";
                        $scope.NewBottle.tomanval = "不限";
                        $scope.NewBottle.settypetext = "单人话题"
                    } else {
                        $scope.manage.showTip(res.mes, "short", "bottom");
                    }
                }, function(res) {
                    $scope.manage.showTip("操作失败！", "short", "bottom");
                });
            }
        }
        $scope.closenewbottle = function() {
                $scope.CreateCtrl.setting = false;
                $scope.CreateCtrl.isFloating = false; //投递瓶子，成功则关闭
                $scope.NewBottle.Bottle_Text = ""; //重置瓶子
                $scope.NewBottle.hasimg = false,
                    $scope.NewBottle.settype = 1;
                $scope.NewBottle.textcenter = false;
                $scope.NewBottle.choosedtime = true;
                $scope.NewBottle.choosedtoman = true;
                $scope.NewBottle.timeval = "一个月";
                $scope.NewBottle.tomanval = "不限";
                $scope.NewBottle.settypetext = "单人话题";
                $scope.newbottle_modal.hide();
            }
            // 当前tab页保存
        $scope.changehometab = function(i, t) {
            $ionicTabsDelegate.select(i);
            $scope.hometab.tab = t
        }

        // 空间导航出来
        $ionicModal.fromTemplateUrl('views/templates/home/zonenav.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.zonenav = modal;
        });
        $scope.zonenavshow = function() {
            $scope.zonenav.show()
        }
        $scope.zonenavhide = function() {
            $scope.zonenav.hide()
        }


        //    写建议
        //写新漂流瓶//创建漂流瓶是首页公共页面
        $ionicModal.fromTemplateUrl('views/templates/home/suggest.html', {
            scope: $scope
        }).then(function(modal) {
            $scope.suggestmodal = modal;
        });
        $scope.suggestmodalclose = function() {
            $scope.manage.suggestmes = "";
            $scope.suggestmodal.hide()
        }
        $scope.sendsuggest = function() {
            Home.sendsuggest(token, $scope.manage.suggestmes,null).$promise.then(function(res) {
                if (res.bool) {
                    $scope.manage.showTip("投递建议成功！", "short", "bottom");
                    $scope.manage.suggestmes = "";
                    $scope.suggestmodal.hide()
                }
                else{
                     $scope.manage.showTip(res.mes, "short", "bottom");
                }
            },function(){
                 $scope.manage.showTip("操作失败！", "short", "bottom");
            })
        }

    })
    //捡瓶子控制器》首页控制器》APP控制器
    .controller('SeasideCtrl', function($scope, $cordovaToast, $state, $ionicGesture, $ionicLoading, $ionicModal, Home, Storage) {
        var token = $scope.access.token;
        $scope.floatBottle = [];
        var adfb = [],
            fb;
        //捡瓶子、捡日记及相遇推送都是在海边显示
        $scope.getfloat = function() {
            Home.getfloat(token).$promise.then(function(res) {
                console.log(res)
                if (res.bool) {
                    var nfb = []; //瓶子数据刷新
                    for (var i = 0; i < res.mes.length; i++) {
                        fb = {};
                        fb.id = res.mes[i]._id;
                        if (res.mes[i].meet) {
                            fb.meet = res.mes[i].meet;
                        }
                        fb.type = res.mes[i].settype;
                        fb.account = res.mes[i].account;
                        fb.create_time = moment(res.mes[i].time).format('YYYY-MM-DD');
                        fb.intro = res.mes[i].introduction;
                        fb.create_name = res.mes[i].setting[0].setting.name;
                        fb.sign = res.mes[i].setting[0].setting.sign;
                        fb.avatar = res.mes[i].setting[0].setting.avatar;
                        nfb.push(fb);
                    }
                    $scope.floatBottle = nfb;
                    $scope.$broadcast('scroll.refreshComplete');
                } else {
                    $scope.$broadcast('scroll.refreshComplete');
                    $scope.manage.showTip(res.mes, "short", "bottom");
                }
            }, function(res) {
                $scope.$broadcast('scroll.refreshComplete');
                $scope.manage.showTip("操作失败！", "short", "bottom");
            });

        }

        //查看瓶子 广告瓶子消失
        $scope.readbottle = function(item, j) {
            console.log(item)
            if (item.type == 1) {
                $state.go('app.message', {
                    fromid: item.meet._id,
                    type: item.type,
                    toaccount: item.account
                });
            } else {
                $state.go('app.message', {
                    fromid: item.id,
                    type: item.type,
                    toaccount: item.account
                });
            }
        }
    })
    //好友控制器》首页控制器》APP控制器
    .controller('FriendCtrl', function($scope, $cordovaToast, $ionicModal, $ionicLoading, $ionicPopup, Home, Storage) {
        var token = $scope.access.token;
        //好友数据
        $scope.friendlist = {
                type: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '其他', ],
                A: [],
                B: [],
                C: [],
                D: [],
                E: [],
                F: [],
                G: [],
                H: [],
                I: [],
                J: [],
                K: [],
                L: [],
                M: [],
                N: [],
                O: [],
                P: [],
                Q: [],
                R: [],
                S: [],
                T: [],
                U: [],
                V: [],
                W: [],
                X: [],
                Y: [],
                Z: [],
                '其他': [],
            }
            //获取好友列表
        $scope.getfriendlist = function() {
            Home.getfriendlist(token).$promise.then(function(res) {
                if (res.bool) {
                    $scope.friends = [];
                    for (var i = 0; i < res.mes.length; i++) {
                        var t = res.mes[i].type.substr(0, 1);
                        var str = /^[A-Za-z]+$/;
                        res.mes[i].time =moment(res.mes[i].time).format('YYYY-MM-DD');
                        if (str.test(t)) {
                            res.mes[i].type = t.toUpperCase();
                            $scope.friendlist[t.toUpperCase()].push('1');
                        } else {
                            res.mes[i].type = '其他';
                            $scope.friendlist['其他'].push('1');
                        }
                    }
                    $scope.friends = res.mes;
                    $scope.$broadcast('scroll.refreshComplete');
                } else {
                    $scope.$broadcast('scroll.refreshComplete');
                    $scope.manage.showTip(res.mes, "short", "bottom");
                }
            }, function(res) {
                $scope.$broadcast('scroll.refreshComplete');
                $scope.manage.showTip("操作失败！", "short", "bottom");
            });
        }
        $scope.getfriendlist();
        //删除好友
        $scope.deletefriend = function(i, item, items) {
            var myPopup = $ionicPopup.show({
                title: '删除好友提示',
                template: '你确定要删除好友' + item.setting.name + '吗?',
                scope: $scope,
                buttons: [{
                    text: '取消',
                    onTap: function(e) {
                        myPopup.close();
                    }
                }, {
                    text: '<b>确定</b>',
                    type: 'button-positive',
                    onTap: function(e) {
                        $scope.load.showaiting(false);
                        Home.deletefriend(token, item.account).$promise.then(function(res) {
                            $ionicLoading.hide();
                            if (res.bool) {
                                $scope.friendlist[items].pop(); //分组元素减少一个
                                $scope.friends.splice(i, 1); //删除好友
                                $scope.manage.showTip(res.mes, "short", "bottom");
                            } else {
                                $scope.manage.showTip(res.mes, "short", "bottom");
                            }
                        }, function(res) {
                            $ionicLoading.hide();
                            $scope.manage.showTip("操作失败！", "short", "bottom");
                        });
                    }
                }, ]
            });
        }
    })
    //信息记录控制器》首页控制器》APP控制器
    .controller('MessdataCtrl', function($scope, $timeout, Home) {
        var token = $scope.access.token;

        //消息记录数据
        $scope.messdata = $scope.notice.messdata;
    })