'use strict';

angular.module('flbottle.config')
.factory('config', function () {
    return {
        ENV: {
            domain: 'http://120.24.181.204:3000',
            // domain: 'http://localhost:3000',
            api: '1'
        }
    } 
});