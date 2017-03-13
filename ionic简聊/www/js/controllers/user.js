'use strict';

angular.module('flbottle.controllers')
    //登录控制器
    .controller('LoginCtrl', function($scope,$ionicPlatform, $ionicPopup, $timeout, $ionicModal, $cordovaToast, $state, $ionicLoading, Login, Storage, Setting) {
        //全局等待
        $scope.showaiting = function() {
            $ionicLoading.show({
                content: '',
                animation: 'fade-in',
                showBackdrop: true,
                maxWidth: 200,
                showDelay: 0
            });
        }

        // 全局提示信息
        $scope.showTip = function(mes, cb) {
            $cordovaToast.show(mes, "short", "bottom").then(function(success) {
                if (cb) {
                    cb()
                }
            });
        }
        if (Storage.get("token")) {
            $state.go("app.home.seaside") //如果存在token则自动登录
                // Login.login(null, null, Storage.get("token")).$promise.then(function(res) {
                //     if (res.bool) {
                //         $ionicLoading.hide();
                //         $state.go("app.home.seaside") //如果存在token则自动登录
                //     } else {
                //         $ionicLoading.hide();
                //         $scope.showTip(res.mes);
                //     }
                // }, function(res) {
                //     $ionicLoading.hide();
                //     $scope.showTip("登录失败！");
                // });
        }
        //全局设置背景样式
        $scope.setted = {
            login_bg: Login.login_bg,
        }

        //双击退出
        $ionicPlatform.registerBackButtonAction(function(e) {
            //判断处于哪个页面时双击退出
            if ($state.includes("login")) {
                if ($scope.backButtonPressedOnceToExit) {
                    ionic.Platform.exitApp();
                } else {
                    $scope.backButtonPressedOnceToExit = true;
                    $scope.showTip('再按一次退出系统');
                    $timeout(function() {
                        $scope.backButtonPressedOnceToExit = false;
                    }, 2000);
                }
            }
            e.preventDefault();
            return false;
        }, 101);

        //登录注册控制变量
        $scope.login = {
            isnew: false,
            checkout: false,
            getcode: true,
            getcodeing: false,
            getcodesucc: false,
            getcodefail: false,
            getresetcode: true,
            getresetcodeing: false,
            getresetcodesucc: false,
            getresetcodefail: false,
            checkcodesuss: false,
            checkcodefail: false,
            checkresetcodesuss: false,
            checkresetcodefail: false,
        }

        //安全设置
        $scope.safeset = {
                passwordtype: true,
                choosed_passwordtype: false,
                choosed_passwordtypetext: "用旧密码修改",
                passwordtypelist: Setting.passwordtypelist
            }
            //修改密码
        $ionicModal.fromTemplateUrl('templates/safeset_modal.html', {
            scope: $scope,
            cache: false,
        }).then(function(modal) {
            $scope.safeset_modal = modal;
        });
        $scope.resetsafeset_modal = function() { //重置修改密码modal
            $scope.login.getresetcode = true;
            $scope.login.mimaaccount = "";
            $scope.login.getresetcodeing = false;
            $scope.login.getresetcodesucc = false;
            $scope.login.getresetcodefail = false;
            $scope.login.checkresetcodesuss = false
            $scope.login.checkresetcodefail = false
            $scope.login.resetcode = $scope.login.newpassword = $scope.login.oldpassword = "";
            $scope.safeset.passwordtype = true;
            $scope.safeset.choosed_passwordtypetext = "用旧密码修改";
            $scope.safeset_modal.hide();
        }
        var ph = /^1[3|4|5|8][0-9]\d{8}$/,
            em = /\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+(com|cn|info|net|org)/;
        $scope.checkisnew = function() {
            if (ph.test($scope.login.account) || em.test($scope.login.account)) {
                Login.getexist($scope.login.account).$promise.then(function(res) { //判断用户是否存在
                    $scope.login.checkout = true;
                    console.log(res.iscoded)
                    if (res.isexist) {
                        $scope.login.isnew = false;
                    } else {
                        $scope.showTip("没有该用户，请注册！");
                        $scope.login.isnew = true;
                        if (res.iscoded) {
                            $scope.login.getcode = false;
                            $scope.login.getcodeing = false;
                            $scope.login.getcodesucc = true;
                            $scope.login.getcodefail = false;
                        } else {
                            $scope.login.getcode = true;
                            $scope.login.getcodeing = false;
                            $scope.login.getcodesucc = false;
                            $scope.login.getcodefail = false;
                        }
                    }

                }, function(res) {
                    $scope.login.checkout = false;
                    $scope.showTip("操作失败！");
                });
            } else {
                $scope.login.checkout = false;
            }
        }
        $scope.getcode = function() {
            $scope.login.getcode = false;
            $scope.login.getcodeing = true;
            $scope.login.getcodesucc = false;
            $scope.login.getcodefail = false;
            Login.getcode($scope.login.account).$promise.then(function(res) {
                if (res.issend) {
                    $scope.login.getcode = false;
                    $scope.login.getcodeing = false;
                    $scope.login.getcodesucc = true;
                    $scope.login.getcodefail = false;
                } else {
                    $scope.login.getcode = false;
                    $scope.login.getcodeing = false;
                    $scope.login.getcodesucc = false;
                    $scope.login.getcodefail = true;

                }
            }, function(res) {
                $scope.login.getcode = true;
                $scope.login.getcodeing = false;
                $scope.login.getcodesucc = false;
                $scope.login.getcodefail = false;
            });
        }
        $scope.checkcode = function() {
            if ($scope.login.code.length == 4) {
                Login.checkcode($scope.login.account, $scope.login.code).$promise.then(function(res) {
                    if (res.bool) {
                        $scope.login.checkcodesuss = true
                        $scope.login.checkcodefail = false
                    } else {
                        $scope.login.checkcodesuss = false
                        $scope.login.checkcodefail = true
                        if (res.timeout) {
                            $scope.login.getcode = true;
                            $scope.login.getcodeing = false;
                            $scope.login.getcodesucc = false;
                            $scope.login.getcodefail = false;
                        }
                    }
                }, function(res) {});
            }
        }
        $scope.reg = function() {
            $scope.showaiting();
            if ($scope.login.account && $scope.login.checkcodesuss && $scope.login.newpassword) {
                Login.reg($scope.login.account, $scope.login.code, $scope.login.newpassword).$promise.then(function(res) {
                    $ionicLoading.hide();
                    if (res.bool) {
                        $scope.showTip(res.mes);
                        $state.go("app.home.seaside")
                    } else {
                        $scope.showTip(res.mes);
                        if (res.timeout) {
                            $scope.login.getcode = true;
                            $scope.login.getcodeing = false;
                            $scope.login.getcodesucc = false;
                            $scope.login.getcodefail = false;
                        }
                    }
                }, function(res) {
                    $ionicLoading.hide();
                    $scope.showTip("系统错误！");
                });
            } else {
                $scope.showTip("信息填写有误！");
            }
        }


        $scope.dologin = function() {
            if (ph.test($scope.login.account) || em.test($scope.login.account)) {
                if ($scope.login.account && $scope.login.password) {
                    $scope.showaiting();
                    Login.login($scope.login.account, $scope.login.password, null).$promise.then(function(res) {
                        $ionicLoading.hide();
                        if (res.bool) {
                            $state.go("app.home.seaside")
                            $scope.showTip("登录成功！");
                        } else {
                            if (res.isexist) {
                                $scope.login.isnew = false;
                                $scope.showTip(res.mes);
                            } else {
                                $scope.showTip("不存在该用户，请注册！");
                                $scope.login.isnew = true;
                                if (res.iscoded) {
                                    $scope.login.getcode = false;
                                    $scope.login.getcodeing = false;
                                    $scope.login.getcodesucc = true;
                                    $scope.login.getcodefail = false;
                                } else {
                                    $scope.login.getcode = true;
                                    $scope.login.getcodeing = false;
                                    $scope.login.getcodesucc = false;
                                    $scope.login.getcodefail = false;
                                }
                            }
                        }
                    }, function(res) {
                        $ionicLoading.hide();
                        $scope.showTip(res.mes);
                    });
                } else {
                    $scope.showTip("请填写账号和密码信息");
                }
            } else {
                $scope.showTip("账号必须为邮箱或手机号码");
            }

        }
        $scope.choosetype = function() {
            $scope.myPopup = $ionicPopup.show({
                title: '密码修改选项',
                template: '<div class="list popupradio"><ion-radio ng-repeat="item in safeset.passwordtypelist" ng-model="safeset.choosed_passwordtypetext" ng-value="item.value" ng-click="myPopup.close();">{{ item.text }}</ion-radio></div>',
                scope: $scope
            });
        }
        $scope.resetpassbypass = function() {
            if (ph.test($scope.login.mimaaccount) || em.test($scope.login.mimaaccount)) {
                if ($scope.login.mimaaccount && $scope.login.oldpassword && $scope.login.newpassword) {
                    $scope.showaiting();
                    Setting.resetpassbypass(null, $scope.login.mimaaccount, $scope.login.oldpassword, $scope.login.newpassword).$promise.then(function(res) {
                        $ionicLoading.hide();
                        if (res.bool) {
                            $scope.resetsafeset_modal();
                            $scope.showTip(res.mes);
                        } else {
                            $scope.showTip(res.mes);
                        }
                    }, function(res) {
                        $ionicLoading.hide();
                        $scope.showTip("操作失败！");
                    });
                } else {
                    $scope.showTip("请填写账号和密码信息！");
                }
            } else {
                $scope.showTip("账号必须为邮箱或手机号码");
            }
        }
        $scope.resetpassbycode = function() {
            if (ph.test($scope.login.mimaaccount) || em.test($scope.login.mimaaccount)) {
                if ($scope.login.mimaaccount && $scope.login.resetcode && $scope.login.newpassword) {
                    $scope.showaiting();
                    Setting.resetpassbycode(null, $scope.login.mimaaccount, $scope.login.resetcode, $scope.login.newpassword).$promise.then(function(res) {
                        if (res.bool) {
                            $ionicLoading.hide();
                            $scope.resetsafeset_modal()
                            $scope.showTip(res.mes);
                        } else {
                            if (res.timeout) {
                                $scope.login.getresetcode = true;
                                $scope.login.getresetcodeing = false;
                                $scope.login.getresetcodesucc = false;
                                $scope.login.getresetcodefail = false;

                            }
                            $ionicLoading.hide();
                            $scope.showTip(res.mes);
                        }
                    }, function(res) {
                        $ionicLoading.hide();
                        $scope.showTip("操作失败！");
                    });
                } else {
                    $scope.showTip("请填写账号和密码信息！");
                }
            } else {
                $scope.showTip("账号必须为邮箱或手机号码");
            }
        }
        $scope.getresetcode = function() {
            $scope.login.getresetcode = false;
            $scope.login.getresetcodeing = true;
            $scope.login.getresetcodesucc = false;
            $scope.login.getresetcodefail = false;
            Setting.getresetcode(null, $scope.login.mimaaccount).$promise.then(function(res) {
                if (res.issend) {
                    $scope.login.getresetcode = false;
                    $scope.login.getresetcodeing = false;
                    $scope.login.getresetcodesucc = true;
                    $scope.login.getresetcodefail = false;
                } else {
                    $scope.login.getresetcode = false;
                    $scope.login.getresetcodeing = false;
                    $scope.login.getresetcodesucc = false;
                    $scope.login.getresetcodefail = true;
                    $scope.showTip("获取失败，请查对账号是否为邮箱或手机号码！");
                }
            }, function(res) {
                $scope.login.getresetcode = true;
                $scope.login.getresetcodeing = false;
                $scope.login.getresetcodesucc = false;
                $scope.login.getresetcodefail = false;
                $scope.showTip("操作失败！");
            });
        }
        $scope.checkresetcode = function() {
            if ($scope.login.resetcode.length == 4) {
                Setting.checkresetcode($scope.login.mimaaccount, $scope.login.resetcode).$promise.then(function(res) {
                    if (res.bool) {
                        $scope.login.checkresetcodesuss = true
                        $scope.login.checkresetcodefail = false
                    } else {
                        $scope.login.checkresetcodesuss = false
                        $scope.login.checkresetcodefail = true
                        if (res.timeout) {
                            $scope.login.getresetcode = true;
                            $scope.login.getresetcodeing = false;
                            $scope.login.getresetcodesucc = false;
                            $scope.login.getresetcodefail = false;
                        }
                    }
                }, function(res) {
                    $scope.showTip("操作失败！");
                });
            }
        }

    })