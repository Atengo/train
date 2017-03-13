requirejs.config({
    baseUrl: 'js',
    paths: {
        jquery: 'jquery.min',
        ball: "ball"
    },
    shim:{
        ball:["jquery"]
    }
});

require([
    'jquery', 'ball'
], function($) {
    'use strict';
    $(".canvas").Ball({
            numBalls: 5,
            speed: 3,
            close:1,
            radius:60,
            color:"#666",
            lineWidth:0
        })
});

