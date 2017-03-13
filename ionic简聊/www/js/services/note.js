'use strict';

angular.module('flbottle.services')
    .factory('Note', function(config, $resource, $log) {
        var api = config.ENV.domain;
        var resource = $resource(api + '/note', {}, {
            createnote: {
                method: 'post',
                url: api + '/note/createnote'
            },
            getnotelist: {
                method: 'get',
                url: api + '/note/getnotelist'
            },
            getfocusnote: {
                method: 'get',
                url: api + '/note/getfocusnote'
            },
            getnote: {
                method: 'get',
                url: api + '/note/getnote'
            },
            deletenote: {
                method: 'post',
                url: api + '/note/deletenote'
            },
            deletefocusnote: {
                method: 'post',
                url: api + '/note/deletefocusnote'
            },
            setsecret: {
                method: 'post',
                url: api + '/note/setsecret'
            },
            savenote: {
                method: 'post',
                url: api + '/note/savenote'
            },
        });
        return {
            createnote: function(token, newnote) {
                return resource.createnote({
                    token: token,
                    newnote: newnote,
                }, {});
            },
            getnotelist: function(token,pageno) {
                return resource.getnotelist({
                    token: token,
                    pageno:pageno
                });
            },
            getfocusnote: function(token,pageno) {
                return resource.getfocusnote({
                    token: token,
                    pageno:pageno
                });
            },
            getnote: function(token, id) {
                return resource.getnote({
                    token: token,
                    id: id
                });
            },
            deletenote: function(token, id) {
                return resource.deletenote({
                    token: token,
                    id: id,
                }, {});
            },
            deletefocusnote: function(token, id) {
                return resource.deletefocusnote({
                    token: token,
                    id: id,
                }, {});
            },
            setsecret: function(token, id, bool) {
                return resource.setsecret({
                    token: token,
                    id: id,
                    bool: bool
                }, {});
            },
            savenote: function(token, id, newnote) {
                return resource.savenote({
                    token: token,
                    id: id,
                    newnote: newnote
                }, {});
            }
        }
    });