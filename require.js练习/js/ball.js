(function() {
    $.fn.Ball=function(options) {
        return this.each(function() {
            new Ball($(this),options);
        })
        }
    Ball = function(elm,options) {
        var set = {
            radius: 40,
            color: "#ff0000",
            close: 1,
            numBalls: 15,
            bounce: -1.0,
            speed: 10,
            lineWidth:1
        }
        this.set = $.extend(set, options);
        console.log(this.set)
        this.canvas = elm[0];
        this.context = this.canvas.getContext('2d');
        this.balls = [];
        for (var i = 0; i < this.set.numBalls; i++) {
            var ball = {};
            ball.radius=this.set.radius;
            ball.mass = this.set.radius;
            ball.x = Math.random() * this.canvas.width;
            ball.y = Math.random() * this.canvas.height;
            ball.vx = Math.random() * this.set.speed - 1;
            ball.vy = Math.random() * this.set.speed - 1;
            ball.rotation = 0;
            ball.scaleX = 1;
            ball.scaleY = 1;
            ball.color = this.set.color
            ball.lineWidth = this.set.lineWidth;
            this.balls.push(ball);
        }
        this.init()
    }

    Ball.prototype.draw = function(b, context) {
        context.save();
        context.translate(b.x, b.y);
        context.rotate(b.rotation);
        context.scale(b.scaleX, b.scaleY);
        context.lineWidth = b.lineWidth;
        context.fillStyle = b.color;
        context.beginPath();
        //x, y, radius, start_angle, end_angle, anti-clockwise
        context.arc(0, 0, b.radius, 0, (Math.PI * 2), true);
        context.closePath();
        context.fill();
        if (b.lineWidth > 0) {
            context.stroke();
        }
        context.restore();
    };

    Ball.prototype.rotate = function(x, y, sin, cos, reverse) {
        return {
            x: (reverse) ? (x * cos + y * sin) : (x * cos - y * sin),
            y: (reverse) ? (y * cos - x * sin) : (y * cos + x * sin)
        };
    }

    Ball.prototype.checkCollision = function(ball0, ball1) {
        var _this = this;
        var dx = ball1.x - ball0.x,
            dy = ball1.y - ball0.y,
            dist = Math.sqrt(dx * dx + dy * dy);
        //collision handling code here
        if (dist < ball0.radius / _this.set.close + ball1.radius / _this.set.close) {
            //calculate angle, sine, and cosine
            var angle = Math.atan2(dy, dx),
                sin = Math.sin(angle),
                cos = Math.cos(angle),
                //rotate ball0's position
                pos0 = {
                    x: 0,
                    y: 0
                }, //point
                //rotate ball1's position
                pos1 = _this.rotate(dx, dy, sin, cos, true),
                //rotate ball0's velocity
                vel0 = _this.rotate(ball0.vx, ball0.vy, sin, cos, true),
                //rotate ball1's velocity
                vel1 = _this.rotate(ball1.vx, ball1.vy, sin, cos, true),
                //collision reaction
                vxTotal = vel0.x - vel1.x;
            vel0.x = ((ball0.mass - ball1.mass) * vel0.x + 2 * ball1.mass * vel1.x) /
                (ball0.mass + ball1.mass);
            vel1.x = vxTotal + vel0.x;
            //update position - to avoid objects becoming stuck together
            var absV = Math.abs(vel0.x) + Math.abs(vel1.x),
                overlap = (ball0.radius / _this.set.close + ball1.radius / _this.set.close) - Math.abs(pos0.x - pos1.x);
            pos0.x += vel0.x / absV * overlap;
            pos1.x += vel1.x / absV * overlap;
            //rotate positions back
            var pos0F = _this.rotate(pos0.x, pos0.y, sin, cos, false),
                pos1F = _this.rotate(pos1.x, pos1.y, sin, cos, false);
            //adjust positions to actual screen positions
            ball1.x = ball0.x + pos1F.x;
            ball1.y = ball0.y + pos1F.y;
            ball0.x = ball0.x + pos0F.x;
            ball0.y = ball0.y + pos0F.y;
            //rotate velocities back
            var vel0F = _this.rotate(vel0.x, vel0.y, sin, cos, false),
                vel1F = _this.rotate(vel1.x, vel1.y, sin, cos, false);
            ball0.vx = vel0F.x;
            ball0.vy = vel0F.y;
            ball1.vx = vel1F.x;
            ball1.vy = vel1F.y;
        }
    }

    Ball.prototype.checkWalls = function(ball) {
        var _this = this;
        if (ball.x + ball.radius > _this.canvas.width) {
            ball.x = _this.canvas.width - ball.radius;
            ball.vx *= _this.set.bounce;
        } else if (ball.x - ball.radius < 0) {
            ball.x = ball.radius;
            ball.vx *= _this.set.bounce;
        }
        if (ball.y + ball.radius > _this.canvas.height) {
            ball.y = _this.canvas.height - ball.radius;
            ball.vy *= _this.set.bounce;
        } else if (ball.y - ball.radius < 0) {
            ball.y = ball.radius;
            ball.vy *= _this.set.bounce;
        }
    }

    Ball.prototype.move = function(t, ball) {
        var _this = t;
        ball.x += ball.vx;
        ball.y += ball.vy;
        _this.checkWalls(ball);
    }

    Ball.prototype.init = function() {
        var _this = this;
        window.requestAnimationFrame(_this.init.bind(_this), _this.canvas);
        _this.context.clearRect(0, 0, _this.canvas.width, _this.canvas.height);
        _this.context.strokeRect(0, 0, _this.canvas.width, _this.canvas.height);

        $(_this.balls).each(function(i, b) {
            _this.move(_this, b)
        })
        for (var ballA, i = 0, len = _this.set.numBalls - 1; i < len; i++) {
            ballA = _this.balls[i];
            for (var ballB, j = i + 1; j < _this.set.numBalls; j++) {
                ballB = _this.balls[j];
                _this.checkCollision(ballA, ballB);
            }
        }
        $(_this.balls).each(function(i, b) {
            _this.draw(b, _this.context)
        })
    }
})(jQuery);