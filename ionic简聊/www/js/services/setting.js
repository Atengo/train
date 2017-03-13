'use strict';

angular.module('flbottle.services')
    .factory('Setting', function(config, $resource, Storage) {
        var api = config.ENV.domain;
        var resource = $resource(api + '/setting', {}, {
            getsetting: {
                method: 'get',
                url: api + '/setting/getsetting'
            },
            getresetcode: {
                method: 'post',
                url: api + '/setting/getresetcode'
            },
            checkresetcode: {
                method: 'post',
                url: api + '/setting/checkresetcode'
            },
            resetpassbypass: {
                method: 'post',
                url: api + '/setting/resetpassbypass'
            },
            resetpassbycode: {
                method: 'post',
                url: api + '/setting/resetpassbycode'
            },
            savesetting: {
                method: 'post',
                url: api + '/setting/savesetting'
            },
        });
        return {
            resetpassbypass: function(token, account, oldpass, newpass) {
                return resource.resetpassbypass({
                    token: token,
                    account: account,
                    oldpass: oldpass,
                    newpass: newpass,
                }, {}, function(res) {
                    if (res.bool) {
                        Storage.set("token", res.token)
                    }
                });
            },
            getresetcode: function(token, account) {
                return resource.getresetcode({
                    token: token,
                    account: account,
                }, {});
            },
            checkresetcode: function(account, code) {
                return resource.checkresetcode({
                    account: account,
                    code: code
                }, {});
            },
            resetpassbycode: function(token, account, code, newpass) {
                return resource.resetpassbycode({
                    token: token,
                    account: account,
                    code: code,
                    newpass: newpass,
                }, {}, function(res) {
                    if (res.bool) {
                        Storage.set("token", res.token)
                    }
                });
            },
            getsetting: function(token) {
                return resource.getsetting({
                    token: token
                });
            },
            savesetting: function(token, newset) {
                return resource.savesetting({
                    token: token,
                    newset: newset
                }, {});
            },
            passwordtypelist: [{
                text: "用旧密码修改",
                value: "用旧密码修改"
            }, {
                text: "用验证码修改",
                value: "用验证码修改"
            }]
        };
    });