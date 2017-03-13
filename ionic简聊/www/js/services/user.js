'use strict';

angular.module('flbottle.services')
    .factory('Login', function(config, Storage, $resource) {
        var api = config.ENV.domain;
        var resource = $resource(api + '/login', {}, {
            getexist: {
                method: 'post',
                url: api + '/login/getexist'
            },
            getcode: {
                method: 'post',
                url: api + '/login/getcode'
            },
            checkcode: {
                method: 'post',
                url: api + '/login/checkcode'
            },
            reg: {
                method: 'post',
                url: api + '/login/reg'
            },
            login: {
                method: 'post',
                url: api + '/login/login'
            },
        });
        return {
            login_bg: "view-bglogin",
            getexist: function(account) {
                return resource.getexist({
                    account: account
                }, {});
            },
            getcode: function(account) {
                return resource.getcode({
                    account: account
                }, {});
            },
            checkcode: function(account, code) {
                return resource.checkcode({
                    account: account,
                    code: code
                }, {});
            },
            reg: function(account, code, pass) {
                return resource.reg({
                    account: account,
                    code: code,
                    pass: pass
                }, {}, function(res) {
                    if (res.bool) {
                        Storage.set("clientAccount", account);
                        Storage.set("clientAvatar", res.avatar);
                        Storage.set("token", res.token);
                        Storage.set("setready", 0);
                        Storage.set("setting", {
                            voile: true,
                            shock: true
                        });
                    }
                });
            },
            login: function(account, pass, token) {
                return resource.login({
                    account: account,
                    pass: pass,
                    token: token
                }, {}, function(res) {
                    if (res.bool) {
                        if (res.setting.name != '未设置' && res.setting.name != '' && res.setting.sex != '未设置' && res.setting.birthday != '未设置' && res.setting.birthcity != '未设置' && res.setting.livecity != '未设置') {
                            var setready = 1;
                        } else {
                            var setready = 0;
                        }
                        Storage.set("clientAccount", res.account);
                        Storage.set("clientAvatar", res.setting.avatar);
                        Storage.set("token", res.token);
                        Storage.set("setready", setready);
                        Storage.set("setting", {
                            voile: res.setting.voile,
                            shock: res.setting.shock
                        });
                    }
                });
            },
        };
    });