'use strict';




angular.module('flbottle.services')
    .factory('Home', function(config, $resource) {
        var api = config.ENV.domain;
        var resource = $resource(api + '/home', {}, {
            createbottle: {
                method: 'post',
                url: api + '/home/createbottle'
            },
            getfloat: {
                method: 'get',
                url: api + '/home/getfloat'
            },
            getcard: {
                method: 'get',
                url: api + '/home/getcard'
            },
            addfriend: {
                method: 'post',
                url: api + '/home/addfriend'
            },
            getfriendlist: {
                method: 'post',
                url: api + '/home/getfriendlist'
            },
            deletefriend: {
                method: 'post',
                url: api + '/home/deletefriend'
            },
            getunread: {
                method: 'post',
                url: api + '/home/getunread'
            },
            getoneunread: {
                method: 'post',
                url: api + '/home/getoneunread'
            },
            addshield: {
                method: 'post',
                url: api + '/home/addshield'
            },
            unshield: {
                method: 'post',
                url: api + '/home/unshield'
            },
            tipoff: {
                method: 'post',
                url: api + '/home/tipoff'
            },
            createsuggest: {
                method: 'post',
                url: api + '/home/createsuggest'
            }  
        });
        return {
            createbottle: function(token, newbottle) {
                return resource.createbottle({
                    token: token,
                    newbottle: newbottle,
                }, {});
            },
            getfloat: function(token) {
                return resource.getfloat({
                    token: token
                });
            },
            getcard: function(token, account) {
                return resource.getcard({
                    token: token,
                    account: account
                });
            },
            addfriend: function(token, newfriend) {
                return resource.addfriend({
                    token: token,
                    newfriend: newfriend
                }, {});
            },
            getfriendlist: function(token) {
                return resource.getfriendlist({
                    token: token
                }, {});
            },
            deletefriend: function(token, account) {
                return resource.deletefriend({
                    token: token,
                    account: account
                }, {});
            },

            getunread: function(token) {
                return resource.getunread({
                    token: token
                }, {});
            },
            getoneunread: function(token, name) {
                return resource.getoneunread({
                    token: token,
                    roomname: name
                }, {});
            },
            addshield: function(token, account) {
                return resource.addshield({
                    token: token,
                    account: account
                }, {});
            },
            unshield: function(token, account) {
                return resource.unshield({
                    token: token,
                    account: account
                }, {});
            },
            tipoff: function(token, type, id, cause) {
                return resource.tipoff({
                    token: token,
                    type: type,
                    id: id,
                    cause: cause
                }, {});
            },
            sendsuggest: function(token, message,url) {
                return resource.createsuggest({
                    token: token,
                    message: message,
                    imgurl:url
                }, {});
            },
            setted: {
                view_bg: "view-bg",
                view_bgwhite: "view-bgwhite",
            },
            //写漂流瓶数据
            bottletimelist: [ //定义漂流时间选择列表
                {
                    text: "三天",
                    value: "三天"
                }, {
                    text: "一星期",
                    value: "一星期"
                }, {
                    text: "一个月",
                    value: "一个月"
                }, {
                    text: "半年",
                    value: "半年"
                }, {
                    text: "永远漂流",
                    value: "永远漂流"
                }
            ],
            bottletomanlist: [ //定义漂流时间选择列表
                {
                    text: "1",
                    value: "1"
                }, {
                    text: "5",
                    value: "5"
                }, {
                    text: "10",
                    value: "10"
                }, {
                    text: "50",
                    value: "50"
                }, {
                    text: "不限",
                    value: "不限"
                },
            ],
            bottletypelist: [ //定义漂流时间选择列表
                {
                    text: "单人话题",
                    value: "1"
                }, {
                    text: "多人话题",
                    value: "2"
                },
            ]
        }

    });