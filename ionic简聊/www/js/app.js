
'use strict';

angular.module('flbottle', [
    'ionic',
    'flbottle.controllers',
    'flbottle.filters',
    'flbottle.directives',
    'flbottle.config'
])

    .run(function ($ionicPlatform,$rootScope, $state, Storage) {
        $ionicPlatform.ready(function () {
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                console.log("keybar")
            }
            if (window.StatusBar) {
                StatusBar.styleDefault();
            }
        });
        //如果没有token就返回登录页
        $rootScope.$on('$stateChangeStart', function (event, next) {
            console.log('$stateChangeStart');
            var needlogin = next.needlogin;
            var localaccess = Storage.getstr("token");
            if (needlogin && !localaccess) {
                event.preventDefault();
                $state.go("login");
            }
        });
        
    })

    .config(function ($httpProvider, $stateProvider, $urlRouterProvider, $ionicConfigProvider) {
        $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
        $ionicConfigProvider.platform.android.tabs.position('standard');
        $ionicConfigProvider.platform.android.tabs.style('standard');
        $ionicConfigProvider.platform.ios.tabs.style('standard');
        $ionicConfigProvider.platform.ios.tabs.position('standard');
        $ionicConfigProvider.platform.ios.navBar.alignTitle('center');
        $ionicConfigProvider.platform.android.navBar.alignTitle('center');
        $ionicConfigProvider.backButton.previousTitleText(false).text("");
        $ionicConfigProvider.navBar.alignTitle('center');
        $ionicConfigProvider.platform.ios.views.transition('android');
        $ionicConfigProvider.platform.android.views.transition('android');
        // $ionicConfigProvider.scrolling.jsScrolling(false);
        $stateProvider
            //app独立模块，用于更新不缓存的数据
            .state('app', {
                url: "/app",
                cache: false,
                abstract: true,
                templateUrl: "views/app.html",
                controller: 'AppCtrl'
            })
            //首页公共模块
            .state('app.home', {
                url: "/home",
                abstract: true,
                views: {
                    'appContent': {
                        templateUrl: "views/home.html",
                        controller: 'HomeCtrl'
                    }
                }
            })
            //首页好友列表
            .state('app.home.friend', {
                url: "/friend",
                needlogin: true,
                views: {
                    'friend-tab': {
                        templateUrl: "views/templates/home/friend.html",
                        controller: "FriendCtrl"
                    }
                }
            })
            //首页捡瓶子操作
            .state('app.home.seaside', {
                url: "/seaside",
                needlogin: true,
                views: {
                    'seaside-tab': {
                        templateUrl: "views/templates/home/seaside.html",
                        controller: "SeasideCtrl"
                    }
                }
            })
            //首页消息提醒列表
            .state('app.home.messdata', {
                url: "/messdata",
                needlogin: true,
                messdata:true,
                views: {
                    'messdata-tab': {
                        templateUrl: "views/templates/home/messdata.html",
                        controller: "MessdataCtrl"
                    }
                }
            })
            //聊天公共页面
            .state('app.message', {
                url: "/message/:fromid/:type/:toaccount",
                needlogin: true,
                chat: true,
                cache: false,
                views: {
                    'appContent': {
                        templateUrl: "views/message.html",
                        controller: "MessageCtrl"
                    }
                }
            })
            //我的空间公共页面
            .state('app.zone', {
                url: "/zone",
                needlogin: true,
                views: {
                    'appContent': {
                        templateUrl: "views/zone.html",
                        controller: "ZoneCtrl"
                    }
                }
            })
            //漂来的瓶子
            .state('app.zone.float', {
                url: "/float",
                needlogin: true,
                views: {
                    'zone-tab': {
                        templateUrl: "views/templates/float/float.html",
                        controller: "FloatBottleCtrl"
                    }
                }
            })
            //我的瓶子
            .state('app.zone.myfloat', {
                url: "/myfloat",
                needlogin: true,
                views: {
                    'zone-tab': {
                        templateUrl: "views/templates/float/myfloat.html",
                        controller: "MyFloatCtrl"
                    }
                }
            })
            .state('app.zone.mybottlemeet', {
                url: "/mybottlemeet/:id",
                cache: false,
                needlogin: true,
                views: {
                    'zone-tab': {
                        templateUrl: "views/templates/float/mybottlemeet.html",
                        controller: "MyBottleMeetCtrl"
                    }
                }
            })
            //记事列表
            .state('app.zone.notelist', {
                url: "/notelist",
                needlogin: true,
                views: {
                    'zone-tab': {
                        templateUrl: "views/templates/note/notelist.html",
                        controller: "NoteListCtrl"
                    }
                }
            })
            //关注的记事列表
            .state('app.zone.focusnote', {
                url: "/focusnote",
                needlogin: true,
                views: {
                    'zone-tab': {
                        templateUrl: "views/templates/note/focusnote.html",
                        controller: "FocusNoteCtrl"
                    }
                }
            })
            //查看记事
            .state('app.zone.seenote', {
                url: "/seenote/:id/:index",
                needlogin: true,
                views: {
                    'zone-tab': {
                        templateUrl: "views/templates/note/seenote.html",
                        controller: "SeeNoteCtrl"
                    }
                }
            })
            //编辑/添加文字记事
            .state('app.zone.addnote', {
                url: "/addnote/:type/:id",
                needlogin: true,
                views: {
                    'zone-tab': {
                        templateUrl: "views/templates/note/addnote.html",
                        controller: "AddNoteCtrl"
                    }
                }
            })
            .state('app.zone.setting', {
                url: "/setting",
                needlogin: true,
                //cache: false,
                views: {
                    'zone-tab': {
                        templateUrl: "views/templates/setting/setting.html",
                        controller: "SettingCtrl",
                    }
                }
            })
            //退出公共页面
            .state('login', {
                url: "/login",
                cache: false,
                needlogin: false,
                views: {
                    '': {
                        templateUrl: "views/login.html",
                        controller: "LoginCtrl",
                    }
                }
            })
        $urlRouterProvider.otherwise('/login');
    });
angular.module('flbottle.controllers', ['ionic','flbottle.config', 'flbottle.services', 'citypicker', 'ionic-citydata','ngCordova']);

angular.module('flbottle.services', ['ngResource', 'flbottle.config']);

angular.module('flbottle.filters', ['flbottle.services']);

angular.module('flbottle.directives', []);

angular.module('flbottle.config', []);