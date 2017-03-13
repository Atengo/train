'use strict';

angular.module('flbottle.services')
.factory('Socket', function (Storage,config, $rootScope) {
    var api = config.ENV.domain;
    var socket = io.connect(api,{'force new connection': true})
    return {
        on: function (eventName, callback) {
            socket.on(eventName, function () {
                var args = arguments;
                if (callback) {
                    callback.apply(socket, args);
                }
            });
        },
        emit: function (eventName, data, callback) {
            socket.emit(eventName, data, function () {
                var args = arguments;
                if (callback) {
                    callback.apply(socket, args);
                }
            })
        },
        off:function (name) {
            socket.off(name);
        },
        close: function (callback) {
            socket.close();
            socket = null;
            if (callback) {
                callback.apply(socket);
            }
        },
        open: function (callback) {
            socket = io.connect(api, { 'force new connection': true })
            socket.connect();
            if (callback) {
                callback.apply(socket);
            }
        }
    };
});