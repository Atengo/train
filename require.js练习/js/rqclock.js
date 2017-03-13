requirejs.config({
    baseUrl: 'js',
    paths: {
        jquery: 'jquery.min',
        clock: "clock"
    }
});

require([
    'jquery', 'clock'
], function($) {
    $(".main").clock()
});