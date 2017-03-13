'use strict';

angular.module('flbottle.services')
.factory('Message', function (config,$resource) {
    var api = config.ENV.domain;
    var resource = $resource(api + '/message', {}, {
        getaftermessage: {
            method: 'get',
            url: api + '/message/getaftermessage'
        },
        getbeforemessage: {
            method: 'get',
            url: api + '/message/getbeforemessage'
        },
    });
    return {
        getaftermessage: function (token, name, time, type) {
            return resource.getaftermessage({
                token: token,
                name: name,
                time: time,
                type: type,//1为单人聊天，2为多人瓶子聊天，3为单人瓶子聊天
            });
        },
        getbeforemessage: function (token, name, stime, etime, type) {
            return resource.getbeforemessage({
                token: token,
                name: name,
                stime: stime,
                etime: etime,
                type: type,//1为单人聊天，2为多人瓶子聊天，3为单人瓶子聊天
            });
        }
    }
});
