(function() {
    $.fn.countdown = function(options) {
        return this.each(function() {
            new countdown($(this), options);
        })
    }
    countdown = function(elm, options) {
        var set = {
            time: 10,
        }
        this.elm=elm;
        this.set = $.extend(set, options);
        this.totle = this.set.time;
        this.rotate = 360 / this.set.time;
        this.callback = this.set.cb ? this.set.cb : null;
        this.count = 0;
        this.init()
    }
    countdown.prototype.init = function() {
        this.elm.find(".time").text(this.set.time);
        this.timeshow = setInterval(this.showTime.bind(this), 1000);
        this.pieshow = setInterval(this.start.bind(this), 1000);
    }
    countdown.prototype.showTime=function() {
        this.totle--;
        if (this.totle < 0) {
            clearInterval(this.timeshow);
            clearInterval(this.pieshow);
        } else if (this.totle == 0) {
            this.elm.find(".time").text(this.totle);
            if (this.callback) {
                this.callback();
            }
        } else {
            this.elm.find(".time").text(this.totle);
        }
    }

    countdown.prototype.start=function() {
        this.count++;
        this.dorotate = this.rotate * this.count;
        if (this.dorotate > 180) {
            this.elm.find(".pie1").css("-webkit-transform", "rotate(180deg)");
            this.elm.find(".pie2").css("-webkit-transform", "rotate(" + (this.dorotate - 180) + "deg)");
        } else {
            this.elm.find(".pie1").css("-webkit-transform", "rotate(" + this.dorotate + "deg)");
            this.elm.find(".pie2").css("-webkit-transform", "rotate(0deg)");
        }
    }
})(jQuery);