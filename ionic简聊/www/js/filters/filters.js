'use strict';

angular.module('flbottle.filters')
.filter('trustHtml', function ($sce) {
        return function (input) {
            return $sce.trustAsHtml(input);
        }
    });