'use strict';

angular.module('flbottle.controllers')
    //首页控制器》APP控制器
    .controller('ZoneCtrl', function($scope, $http, $cordovaToast, $ionicLoading, Note, $state, $ionicPopup, $ionicModal, $timeout, $ionicTabsDelegate, Home, Storage) {
        var token = $scope.access.token;
        //记事部分公共方法
        // 页码计数，记事列表会动态变化，所以要添加在母控制器中
        $scope.note = {
                pageNo: 1,
                alloaded: true
            }
            //删除记事
        $scope.delete_note = function(id, i, callback) {
                var myPopup = $ionicPopup.show({
                    title: "删除记事提示",
                    template: "你确定删除该记事吗？",
                    scope: $scope,
                    buttons: [{
                        text: '取消',
                        type: 'button',
                        onTap: function(e) {
                            myPopup.close();
                        }
                    }, {
                        text: '确定',
                        type: 'button button-positive',
                        onTap: function(e) {
                            $scope.load.showaiting(false);
                            Note.deletenote(token, id).$promise.then(
                                function(res) {
                                    $ionicLoading.hide();
                                    if (res.bool) {
                                        $scope.manage.showTip(res.mes, "short", "bottom")
                                        $scope.note.notelists.splice(i, 1);
                                        $scope.notice.getunread()
                                        if (typeof(callback) == "function") {
                                            callback();
                                        }
                                    } else {
                                        $scope.manage.showTip(res.mes, "short", "bottom")
                                    }

                                },
                                function(res) {
                                    $ionicLoading.hide();
                                    $scope.manage.showTip("操作失败！", "short", "bottom")
                                });
                        }
                    }]
                });
            }
            //设置私密记事
        $scope.setsecret = function(id, i, callback) {
            console.log($scope.note.notelists)
            var myPopup = $ionicPopup.show({
                title: "秘密记事设置提示",
                template: "你确定将此记事转换成私密记事吗，转换后相遇空间里别人将不能查看这篇记事。",
                scope: $scope,
                buttons: [{
                    text: '取消',
                    type: 'button',
                    onTap: function(e) {
                        myPopup.close();
                    }
                }, {
                    text: '确定',
                    type: 'button button-positive',
                    onTap: function(e) {
                        $scope.load.showaiting(false);
                        Note.setsecret(token, id, true).$promise.then(
                            function(res) {
                                $ionicLoading.hide();
                                if (res.bool) {
                                    $scope.manage.showTip(res.mes, "short", "bottom")
                                    $scope.note.notelists[i].lock = true;
                                    if (typeof(callback) == "function") {
                                        callback();
                                    }
                                } else {
                                    $scope.manage.showTip(res.mes, "short", "bottom")
                                }

                            },
                            function(res) {
                                $ionicLoading.hide();
                                $scope.manage.showTip("操作失败！", "short", "bottom")
                            });

                    }
                }, ]
            });
        }

        //解除私密记事
        $scope.removesecret = function(id, i, callback) {
            var myPopup = $ionicPopup.show({
                title: "解除秘密记事提示",
                template: "你确定解除该私密记事吗，转换后相遇空间里别人将可以查看这篇记事。",
                scope: $scope,
                buttons: [{
                    text: '取消',
                    type: 'button',
                    onTap: function(e) {
                        myPopup.close();
                    }
                }, {
                    text: '确定',
                    type: 'button button-positive',
                    onTap: function(e) {
                        $scope.load.showaiting(false);
                        Note.setsecret(token, id, false).$promise.then(
                            function(res) {
                                $ionicLoading.hide();
                                if (res.bool) {
                                    $scope.manage.showTip(res.mes, "short", "bottom")
                                    $scope.note.notelists[i].lock = false;
                                    if (typeof(callback) == "function") {
                                        callback();
                                    }
                                } else {
                                    $scope.manage.showTip(res.mes, "short", "bottom")
                                }

                            },
                            function(res) {
                                $ionicLoading.hide();
                                $scope.manage.showTip("操作失败！", "short", "bottom")
                            });
                    }
                }, ]
            });
        }

        // 设置完成才能添加记事
        $scope.addnewnote = function() {
            if ($scope.set.setready) {
                $state.go('app.zone.addnote', {
                    type: "add",
                    id: "0"
                })
            } else {
                var myPopup = $ionicPopup.show({
                    title: '系统提示',
                    template: '您还没完成基本信息设置，还不能写记事操作。写记事操作需完成昵称、性别、生日、出生地、居住地的信息填写！',
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
        $scope.note.getnotelist = function(pageno, cb) {
            $scope.load.showaiting(false);
            Note.getnotelist(token, pageno).$promise.then(
                function(res) {
                    $ionicLoading.hide();
                    $scope.$broadcast('scroll.refreshComplete');
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                    if (res.bool) {
                        // 清空list,每次页面只显示一页内容，每页15篇记事
                        if (res.mes.length < 15) {
                            $scope.note.alloaded = true;
                        } else {
                            $scope.note.alloaded = false;
                        }
                        if (res.mes.length) {
                            $scope.note.notelists = [];
                            angular.forEach(res.mes, function(data, index, array) {
                                data.time = moment(data.time).format("YYYY-MM-DD HH:mm");
                                $scope.note.notelists.push(data);
                            });
                            console.log(res.mes)
                            if (cb) {
                                cb()
                            }
                        }
                    } else {
                        $scope.manage.showTip(res.mes, "short", "bottom")
                    }
                },
                function(res) {
                    $ionicLoading.hide();
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                    $scope.$broadcast('scroll.refreshComplete');
                    $scope.manage.showTip("操作失败", "short", "bottom")
                });
        }
    })
    //记事列表》记事本控制器》App控制器
    .controller('NoteListCtrl', function($scope, $timeout, $ionicScrollDelegate, $cordovaToast, $ionicPopup, $ionicLoading, $state, Note) {
        var token = $scope.access.token;
        $scope.note.notelists = [];
        // 进入页面先加载第一页数据
        $scope.note.getnotelist(1);
        //加载下一页数据
        $scope.getnextpage = function() {
                $scope.note.getnotelist($scope.note.pageNo + 1, function() {
                    $scope.note.pageNo++;
                    $ionicScrollDelegate.$getByHandle('notelist').scrollTop(false);
                });
            }
            //加载上一页数据
        $scope.getprevpage = function() {
            $scope.note.getnotelist($scope.note.pageNo - 1, function() {
                $scope.note.pageNo--;
                $ionicScrollDelegate.$getByHandle('notelist').scrollBottom(false);
            });
        }
    })
    //关注的记事列表》记事本控制器》App控制器
    .controller('FocusNoteCtrl', function($scope, $ionicScrollDelegate, $cordovaToast, $ionicPopup, $ionicLoading, $state, Note) {
        var token = $scope.access.token;
        $scope.page = {
            pageNo: 1,
            alloaded: true,
        }
        $scope.getfocusnote = function(pageno, cb) {
            $scope.load.showaiting(false);
            Note.getfocusnote(token, pageno).$promise.then(
                function(res) {
                    $ionicLoading.hide();
                    $scope.$broadcast('scroll.refreshComplete');
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                    if (res.bool) {
                        // 清空list,每次页面只显示一页内容，每页15篇记事
                        if (res.mes.length < 15) {
                            $scope.page.alloaded = true;
                        } else {
                            $scope.page.alloaded = false;
                        }
                        if (res.mes.length) {
                            $scope.note.focusnote = [];
                            angular.forEach(res.mes, function(data, index, array) {
                                data.time = moment(data.time).format("YYYY-MM-DD HH:mm");
                                $scope.note.focusnote.push(data);
                            });
                            console.log(res.mes)
                            if (cb) {
                                cb()
                            }
                        }
                    } else {
                        $scope.manage.showTip(res.mes, "short", "bottom")
                    }

                },
                function(res) {
                    $ionicLoading.hide();
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                    $scope.$broadcast('scroll.refreshComplete');
                    $scope.manage.showTip("操作失败", "short", "bottom")

                });
        }
        $scope.getfocusnote(1);
        //加载下一页数据
        $scope.getnextpage = function() {
                $scope.getfocusnote($scope.page.pageNo + 1, function() {
                    $scope.page.pageNo++;
                    $ionicScrollDelegate.$getByHandle('focusnote').scrollTop(false);
                });
            }
            //加载上一页数据
        $scope.getprevpage = function() {
                $scope.getfocusnote($scope.page.pageNo - 1, function() {
                    $scope.page.pageNo--;
                    $ionicScrollDelegate.$getByHandle('focusnote').scrollBottom(false);
                });
            }
            //删除关注的记事
        $scope.deletefocusnote = function(id, i, callback) {
            var myPopup = $ionicPopup.show({
                title: "删除记事提示",
                template: "你确定删除该记事吗？",
                scope: $scope,
                buttons: [{
                    text: '取消',
                    type: 'button',
                    onTap: function(e) {
                        myPopup.close();
                    }
                }, {
                    text: '确定',
                    type: 'button button-positive',
                    onTap: function(e) {
                        $scope.load.showaiting(false);
                        Note.deletefocusnote(token, id).$promise.then(
                            function(res) {
                                $ionicLoading.hide();
                                if (res.bool) {
                                    $scope.manage.showTip(res.mes, "short", "bottom")
                                    $scope.note.focusnote.splice(i, 1);
                                    $scope.notice.getunread()
                                    if (typeof(callback) == "function") {
                                        callback();
                                    }
                                } else {
                                    $scope.manage.showTip(res.mes, "short", "bottom")
                                }

                            },
                            function(res) {
                                $ionicLoading.hide();
                                $scope.manage.showTip("操作失败！", "short", "bottom")
                            });
                    }
                }]
            });
        }
    })
    //查看记事》记事本控制器》App控制器
    .controller('SeeNoteCtrl', function($scope, $cordovaToast, $state, $ionicLoading, $stateParams, $ionicPopup, Note) {
        var token = $scope.access.token;
        $scope.i = $stateParams.index; //模拟数据先用数组顺序i来改变数组数据，实际数据应该以id来判断
        $scope.id = $stateParams.id;
        $scope.load.showaiting(false);
        Note.getnote(token, $stateParams.id).$promise.then(
            function(res) {
                $ionicLoading.hide();
                if (res.bool) {
                    res.mes.time = moment(res.mes.time).format("YYYY-MM-DD HH:mm")
                    $scope.notedetail = res.mes;
                } else {
                    $scope.manage.showTip(res.mes, "short", "bottom")
                }
            },
            function(res) {
                $ionicLoading.hide();
                $scope.manage.showTip("操作失败！", "short", "bottom")
            });
        $scope.delete_seenote = function() {
            $scope.delete_note($scope.id, $scope.i, function() {
                $state.go("app.zone.notelist");
            });
        }
    })
    //添加/编辑文字记事》记事本控制器》App控制器
    .controller('AddNoteCtrl', function($scope, $cordovaToast, $state, $ionicLoading, $stateParams, Note) {
        var token = $scope.access.token;
        if ($stateParams.type == "edit") {
            $scope.textnotetype = "edit";
            $scope.load.showaiting(false);
            Note.getnote(token, $stateParams.id).$promise.then(
                function(res) {
                    $ionicLoading.hide();
                    if (res.bool) {
                        res.mes.time = moment(res.mes.time).format("YYYY-MM-DD HH:mm")
                        $scope.notedetail = res.mes;
                    } else {
                        $scope.manage.showTip(res.mes, "short", "bottom")
                    }

                },
                function(res) {
                    $ionicLoading.hide();
                    $scope.manage.showTip("操作失败！", "short", "bottom")
                });
        } else {
            $scope.textnotetype = "add";
            $scope.notedetail = {
                title: '',
                time: moment().format('YYYY-DD-MM HH:mm'),
                detail: '',
                textcenter: false,
                lock: true
            }
        }
        //创建新记事
        $scope.createnote = function() {
                $scope.load.showaiting(false);
                Note.createnote(token, $scope.notedetail).$promise.then(
                    function(res) {
                        $ionicLoading.hide();
                        if (res.bool) {
                            $scope.manage.showTip("保存成功！", "short", "bottom");
                            $scope.note.getnotelist(1);
                            $state.go("app.zone.notelist");
                        } else {
                            $scope.manage.showTip(res.mes, "short", "bottom")
                        }

                    },
                    function(res) {
                        $ionicLoading.hide();
                        $scope.manage.showTip("操作失败！", "short", "bottom")

                    });
            }
            //修改保存记事
        $scope.savenote = function() {
            $scope.load.showaiting(false);
            Note.savenote(token, $stateParams.id, $scope.notedetail).$promise.then(
                function(res) {
                    $ionicLoading.hide();
                    if (res.bool) {
                        $scope.manage.showTip("保存成功！", "short", "bottom")
                        $state.go("app.zone.notelist");
                    } else {
                        $scope.manage.showTip(res.mes, "short", "bottom")
                    }

                },
                function(res) {
                    $ionicLoading.hide();
                    $scope.manage.showTip("操作失败！", "short", "bottom")

                });
        }
    })

.controller('FloatBottleCtrl', function($scope, $cordovaToast, $ionicScrollDelegate, $ionicLoading, $timeout, $ionicModal, $ionicPopup, Float) {
        var token = $scope.access.token;
        $scope.page = {
                pageNo: 1,
                alloaded: true,
            }
            //漂来的瓶子数据
        $scope.getfloatbottle = function(pageno, cb) {
            $scope.load.showaiting(false);
            Float.getfloatbottle(token, pageno).$promise.then(
                function(res) {
                    $ionicLoading.hide();
                    $scope.$broadcast('scroll.refreshComplete');
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                    if (res.bool) {
                        if (res.mes.length < 15) {
                            $scope.page.alloaded = true;
                        } else {
                            $scope.page.alloaded = false;
                        }
                        if (res.mes.length) {
                            // 有数据就清空list,每次页面只显示一页内容
                            $scope.floatbottles = [];
                            angular.forEach(res.mes, function(data, index, array) {
                                data.time = moment(data.time).format("YYYY-MM-DD HH:mm");
                                $scope.floatbottles.push(data);
                            });
                            console.log(res.mes)
                            if (cb) {
                                cb()
                            }
                        }
                    } else {
                        $scope.manage.showTip(res.mes, "short", "bottom")
                    }
                },
                function(res) {
                    $ionicLoading.hide();
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                    $scope.$broadcast('scroll.refreshComplete');
                    $scope.manage.showTip("操作失败", "short", "bottom")
                });
        }
        $scope.getfloatbottle(1);
        //加载下一页数据
        $scope.getnextpage = function() {
                $scope.getfloatbottle($scope.page.pageNo + 1, function() {
                    $scope.page.pageNo++;
                    $ionicScrollDelegate.$getByHandle('float').scrollTop(false);
                });
            }
            //加载上一页数据
        $scope.getprevpage = function() {
                $scope.getfloatbottle($scope.page.pageNo - 1, function() {
                    $scope.page.pageNo--;
                    $ionicScrollDelegate.$getByHandle('float').scrollBottom(false);
                });
            }
            //删除漂来的单人瓶子
        $scope.deletefloatonebottle = function(i, id) {
                var myPopup = $ionicPopup.show({
                    title: '删除瓶子提示',
                    template: '你确定要删除漂来的瓶子吗?删除漂来的瓶子将不会再收到这个瓶子的回复信息！',
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
                            Float.deletefloatonebottle(token, id).$promise.then(
                                function(res) {
                                    $ionicLoading.hide();
                                    if (res.bool) {
                                        $scope.manage.showTip(res.mes, "short", "bottom")
                                        $scope.floatbottles.splice(i, 1);
                                        // 重置未读消息数量
                                        $scope.notice.getunread()
                                    } else {
                                        $scope.manage.showTip(res.mes, "short", "bottom")
                                    }

                                },
                                function(res) {
                                    $ionicLoading.hide();
                                    $scope.manage.showTip("操作失败！", "short", "bottom")
                                });
                        }
                    }, ]
                });
            }
            //删除漂来的多人瓶子
        $scope.deletefloatbottle = function(i, id) {
            var myPopup = $ionicPopup.show({
                title: '删除瓶子提示',
                template: '你确定要删除漂来的瓶子吗?删除漂来的瓶子将不会再收到这个瓶子的回复信息！',
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
                        Float.deletefloatbottle(token, id).$promise.then(
                            function(res) {
                                $ionicLoading.hide();
                                if (res.bool) {
                                    $scope.manage.showTip(res.mes, "short", "bottom")
                                    $scope.floatbottles.splice(i, 1);
                                    // 重置未读消息数量
                                    $scope.notice.getunread()
                                } else {
                                    $scope.manage.showTip(res.mes, "short", "bottom")
                                }

                            },
                            function(res) {
                                $ionicLoading.hide();
                                $scope.manage.showTip("操作失败！", "short", "bottom")
                            });
                    }
                }, ]
            });
        }
    })
    .controller('MyFloatCtrl', function($scope, $ionicScrollDelegate, $cordovaToast, $timeout, $ionicLoading, $ionicModal, $ionicPopup, Float) {
        var token = $scope.access.token;
        $scope.page = {
                pageNo: 1,
                alloaded: true,
            }
            //我的瓶子数据
        $scope.getmybottle = function(pageno, cb) {
            $scope.load.showaiting(false);
            Float.getmybottle(token, pageno).$promise.then(
                function(res) {
                    $ionicLoading.hide();
                    $scope.$broadcast('scroll.refreshComplete');
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                    if (res.bool) {
                        if (res.mes.length < 15) {
                            $scope.page.alloaded = true;
                        } else {
                            $scope.page.alloaded = false;
                        }
                        if (res.mes.length) {
                            // 有数据就清空list,每次页面只显示一页内容
                            $scope.myfloatbottles = [];
                            angular.forEach(res.mes, function(data, index, array) {
                                data.time = moment(data.time).format("YYYY-MM-DD HH:mm");
                                $scope.myfloatbottles.push(data);
                            });
                            console.log(res.mes)
                            if (cb) {
                                cb()
                            }
                        }
                    } else {
                        $scope.manage.showTip(res.mes, "short", "bottom")
                    }
                },
                function(res) {
                    $ionicLoading.hide();
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                    $scope.$broadcast('scroll.refreshComplete');
                    $scope.manage.showTip("操作失败", "short", "bottom")
                });
        }
        $scope.getmybottle(1);
        //加载下一页数据
        $scope.getnextpage = function() {
                $scope.getmybottle($scope.page.pageNo + 1, function() {
                    $scope.page.pageNo++;
                    $ionicScrollDelegate.$getByHandle('float').scrollTop(false);
                });
            }
            //加载上一页数据
        $scope.getprevpage = function() {
                $scope.getmybottle($scope.page.pageNo - 1, function() {
                    $scope.page.pageNo--;
                    $ionicScrollDelegate.$getByHandle('float').scrollBottom(false);
                });
            }
            //删除我的单人瓶子
        $scope.deletemyonebottle = function(i, id) {
            var myPopup = $ionicPopup.show({
                title: '删除瓶子提示',
                template: '你确定要删除漂来的瓶子吗?删除单人瓶子则瓶子所有的捡到人将不能再发消息给你！',
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
                        Float.deletemyonebottle(token, id).$promise.then(
                            function(res) {
                                $ionicLoading.hide();
                                if (res.bool) {
                                    $scope.manage.showTip(res.mes, "short", "bottom")
                                    $scope.myfloatbottles.splice(i, 1);
                                    // 重置未读消息数量
                                    $scope.notice.getunread()
                                } else {
                                    $scope.manage.showTip(res.mes, "short", "bottom")
                                }

                            },
                            function(res) {
                                $ionicLoading.hide();
                                $scope.manage.showTip("操作失败！", "short", "bottom")
                            });
                    }
                }, ]
            });
        }

        //删除我的瓶子
        $scope.deletemybottle = function(i, id) {
            var myPopup = $ionicPopup.show({
                title: '删除瓶子提示',
                template: '你确定要删除自己发起的瓶子吗?删除的瓶子将不再漂流，但存在的聊天还可以继续！',
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
                        Float.deletemybottle(token, id).$promise.then(
                            function(res) {
                                $ionicLoading.hide();
                                if (res.bool) {
                                    $scope.manage.showTip(res.mes, "short", "bottom")
                                    $scope.myfloatbottles.splice(i, 1);
                                    // 重置未读消息数量
                                    $scope.notice.getunread()
                                } else {
                                    $scope.manage.showTip(res.mes, "short", "bottom")
                                }

                            },
                            function(res) {
                                $ionicLoading.hide();
                                $scope.manage.showTip("操作失败！", "short", "bottom")
                            });
                    }
                }, ]
            });
        }

    })
    .controller('MyBottleMeetCtrl', function($scope, $cordovaToast, $stateParams, $timeout, $ionicLoading, $ionicModal, $ionicPopup, Float) {
        var token = $scope.access.token;
        var id = $stateParams.id;
        $ionicLoading.show();
        $scope.page = {
            pageNo: 1,
            alloaded: true,
        }
        $scope.mybottlemeet = [];
        $scope.getmybottlemeet = function(pageno, cb) {
            $scope.load.showaiting(false);
            Float.getmybottlemeet(token, id, pageno).$promise.then(
                function(res) {
                    $ionicLoading.hide();
                    $scope.$broadcast('scroll.refreshComplete');
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                    if (res.bool) {
                        if (res.mes.length < 15) {
                            $scope.page.alloaded = true;
                        } else {
                            $scope.page.alloaded = false;
                        }
                        if (res.mes.length) {
                            // 有数据就清空list,每次页面只显示一页内容
                            $scope.mybottlemeet = [];
                            angular.forEach(res.mes, function(data, index, array) {
                                data.time = moment(data.time).format("YYYY-MM-DD HH:mm")
                                $scope.mybottlemeet.push(data)
                            });
                            console.log(res.mes)
                            if (cb) {
                                cb()
                            }
                        }
                    } else {
                        $scope.manage.showTip(res.mes, "short", "bottom")
                    }
                },
                function(res) {
                    $ionicLoading.hide();
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                    $scope.$broadcast('scroll.refreshComplete');
                    $scope.manage.showTip("操作失败", "short", "bottom")
                });
        }
        $scope.getmybottlemeet(1);
        //加载下一页数据
        $scope.getnextpage = function() {
                $scope.getmybottle($scope.page.pageNo + 1, function() {
                    $scope.page.pageNo++;
                    $ionicScrollDelegate.$getByHandle('float').scrollTop(false);
                });
            }
            //加载上一页数据
        $scope.getprevpage = function() {
            $scope.getmybottle($scope.page.pageNo - 1, function() {
                $scope.page.pageNo--;
                $ionicScrollDelegate.$getByHandle('float').scrollBottom(false);
            });
        }



    })