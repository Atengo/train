requirejs.config({
    baseUrl: 'js',
    paths: {
        jquery: 'jquery.min',
        countdown: "countdown"
    },
    shim: {
        countdown: ['jquery']
    },
});

require([
    'jquery', 'countdown'
], function($) {
    $(".countdown").countdown({
        time: 10,
        cb: function() {
            console.log("完成倒计时")
        }
    })
});