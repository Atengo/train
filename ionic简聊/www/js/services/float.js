'use strict';

angular.module('flbottle.services')
    .factory('Float', function(config, $resource, $log) {
        var api = config.ENV.domain;
        var resource = $resource(api + '/home', {}, {
            getmybottle: {
                method: 'get',
                url: api + '/home/getmybottle'
            },
            getfloatbottle: {
                method: 'get',
                url: api + '/home/getfloatbottle'
            },
            getmybottlemeet: {
                method: 'post',
                url: api + '/home/getmybottlemeet'
            },
            deletefloatonebottle: {
                method: 'post',
                url: api + '/home/deletefloatonebottle'
            },
            deletefloatbottle: {
                method: 'post',
                url: api + '/home/deletefloatbottle'
            },
            deletemyonebottle: {
                method: 'post',
                url: api + '/home/deletemyonebottle'
            },
            deletemybottle: {
                method: 'post',
                url: api + '/home/deletemybottle'
            },
        })



        return {
            getmybottle: function(token,pageno) {
                return resource.getmybottle({
                    token: token,
                    pageno:pageno
                });
            },
            getfloatbottle: function(token,pageno) {
                return resource.getfloatbottle({
                    token: token,
                    pageno:pageno
                });
            },
            getmybottlemeet: function(token, id,pageno) {
                return resource.getmybottlemeet({
                    token: token,
                    id: id,
                    pageno:pageno
                }, {});
            },
            deletefloatonebottle: function(token, id) {
                return resource.deletefloatonebottle({
                    token: token,
                    id: id
                }, {});
            },
            deletefloatbottle: function(token, id) {
                return resource.deletefloatbottle({
                    token: token,
                    id: id
                }, {});
            },
            deletemyonebottle:function(token, id) {
                return resource.deletemyonebottle({
                    token: token,
                    id: id
                }, {});
            },
            deletemybottle: function(token, id) {
                return resource.deletemybottle({
                    token: token,
                    id: id
                }, {});
            }
        }  

    });