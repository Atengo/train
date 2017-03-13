'use strict';

angular.module('flbottle.services')
.factory('Storage', function() {
  return {
    set: function(key, data) {
      return window.localStorage.setItem(key, window.JSON.stringify(data));
    },
    get: function(key) {
      return window.localStorage.getItem(key)?window.JSON.parse(window.localStorage.getItem(key)):null;
    },
    getstr: function(key) {
        return window.localStorage.getItem(key);
    },
    remove: function(key) {
      return window.localStorage.removeItem(key);
    }
  };
})

