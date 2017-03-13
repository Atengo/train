
 ;(function (factory) {
    if (typeof define === "function" && define.amd) {
        define([ "jquery" ], factory);
    } else {
        factory(jQuery);
    }
}(function ($) {
    $.fn.clock = function() {
         return this.each(function() {
             new Clock($(this));
         })
     }
     Clock = function(elm) {
         this.elm = elm;
         this.init()
     }
     Clock.prototype.init = function() {
         this.fixelm();
         this.setTime()
     }

     Clock.prototype.fixelm = function() {
         var _this = this.elm;
         var ro = 6;
         var rom = 30;
         var p = 1;
         for (i = 0; i < 29; i++) {
             var d = ro + "deg"
             var a = _this.find("div.colo60").clone();
             a.css("transform", "rotate(" + d + ")");
             a.removeClass("colo60");
             _this.find(".under").append(a);
             ro = ro + 6;

         }
         for (j = 0; j < 11; j++) {
             var e = rom + "deg"
             var b = _this.find("div.colo12").clone();
             b.css("transform", "rotate(" + e + ")");
             b.removeClass("colo12");
             b.children().text(p);
             _this.find(".under").append(b);
             rom = rom + 30;
             p = p + 1;
         }
     }

     Clock.prototype.setTime = function() {
         var _this = this.elm;
         var today = new Date();
         var h = today.getHours();
         var m = today.getMinutes();
         var s = today.getSeconds();
         var sro = (s / 60 * 360);
         var mro = (m / 60 * 360 + s * 0.1);
         if (h > 12) {
             h = h - 12
         }
         var hro = (h / 12 * 360 + m * 0.5 + s * 0.00833);
         _this.find(".hour").css("transform", "rotate(" + hro + "deg)");
         _this.find(".minu").css("transform", "rotate(" + mro + "deg)");
         _this.find(".sec").css("transform", "rotate(" + sro + "deg)");
         var style = '<style>';
         style += '@keyframes hou {100% {transform: rotate(' + (360 + hro) + 'deg);}}'
         style += '@keyframes min {100% {transform: rotate(' + (360 + mro) + 'deg);}}'
         style += '@keyframes sec {100% {transform: rotate(' + (360 + sro) + 'deg);}}'
         style += '.hourm {animation: hou 43200s linear infinite;}'
         style += '.minum {animation: min 3600s linear infinite;}'
         style += '.secm {animation: sec 60s linear infinite;}</style>'
         $('head').append(style);
         _this.find(".hour").addClass("hourm");
         _this.find(".minu").addClass("minum");
         _this.find(".sec").addClass("secm");
     }
}));