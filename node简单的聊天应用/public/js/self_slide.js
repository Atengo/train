/**
 * @L_slide picutre scroll
 * @version 1.0
 * @author DQ Lee
 **/

(function($){
	$.fn.slide=function(options){
	    var defaults = {
	        affect: 1,         //1：上下滚动; 2:幕布式; 3:左右滚动；4：淡入淡出
	        time: 4000,       //间隔时间
	        top: -320,        //每次向上移动距离
	        left: -900,       //每次向左移动距离
	        setclass: "dot",   //设置控制数字的class
            speed: 500,       //动画快慢
            tnum: false,      //是否管理按钮个数
            cnum: 0,          //按钮个数
            lastL:0,
            dot_text: true  //按钮上有无序列号
	    };
	   var opts=$.extend(defaults,options);
	   
		   var $this=$(this);
		   var ool = $("<div class='" + opts.setclass + "'><p></p></div>");
		   var $box=$this.find("ul");
		   var $li=$box.find("li");
		   var timer=null;
		   var num=0;
	   
		   $this.append(ool);
		   if (opts.tnum) {
		       for(i=0;i<opts.cnum;i++){
		           ool.find("p").append($("<b></b>"));
		           if (opts.dot_text) {
		               ool.find("b").eq(i).html(i + 1)
		           }
		       }
		   }
		   if (!opts.tnum) {
		       $box.find("li").each(function (i) {
		       ool.find("p").append($("<b></b>"));
		       if(opts.dot_text){
		           ool.find("b").eq(i).html(i+1)
		       }
		       })
		   }
		   ool.find("b").eq(0).addClass("cur");
		   $this.find(".control").children().eq(0).addClass("cur");
		   $this.find(".control2").children().eq(0).addClass("cur");
		   $this.next(".banner-text").children().eq(0).addClass("cur");
	   switch(opts.affect){
		   case 1:
		      break;
		   case 2:
		      $box.find("li").css("display","none");
		      break;
		   case 3:
			   //$box.css({"width":$li.eq(0).width()*$li.length});
			   $li.css("float","left");
			   break;
		   case 4:
		      $box.find("li").css("display","none");
		      break;
	   }
	   $box.find("li").eq(0).show(0);
	   ool.find("b").mouseover(function(){	
			num=$(this).index();
			run ();
		})
		timer=setInterval(auto,opts.time);
			function auto(){
			    if (opts.tnum) { num < opts.cnum - 1 ? num++ : num = 0; }
			    else { num < $box.find("li").length - 1 ? num++ : num = 0; }
				run();
			}
		function run(){
		    ool.find("b").eq(num).addClass("cur").siblings().removeClass("cur");
		    $this.find(".control").children().eq(num).addClass("cur").siblings().removeClass("cur");
		    $this.find(".control2").children().eq(num).addClass("cur").siblings().removeClass("cur");
		    $this.next(".banner-text").children().eq(num).addClass("cur").siblings().removeClass("cur");
		    switch (opts.affect) {
				    case 1:
				        $box.stop(true, false).animate({ "top": opts.top* num }, opts.speed);
						break;
					case 2:
						$box.find("li").css({"position":"absolute"});
						$box.find("li").stop(false, true).fadeOut(opts.left.speed).eq(num).slideDown(opts.speed);
						break;
				    case 3:
				        if (opts.tnum && num == (opts.cnum - 1)) {
				            $box.stop(true, false).animate({ "left": opts.lastL }, opts.speed);
				        }
				        else {
				            $box.stop(true, false).animate({ "left": opts.left * num }, opts.speed);
				        }
					    break;	
					case 4:
						$box.find("li").css({"position":"absolute"});
						$box.find("li").stop(false,true).fadeOut(opts.speed).eq(num).fadeIn(opts.speed);
						break;	
				}
		}
		$this.mouseover(function(){
			  clearInterval(timer);	
		})
		 $this.mouseout(function(){
			  timer=setInterval(auto,opts.time);	
		 })
		 $this.siblings("#nex").click(function () {
		     num = $this.children(".myulctl").find("b.cur").index();
		     num++;
		     if (opts.tnum) { num > opts.cnum - 1 ? num = 0: num = num; }
		     else { num > $box.find("li").length - 1? num = 0 : num = num; }
		     run();
		 });
		 $this.siblings("#pre").click(function () {
		     num = $this.children(".myulctl").find("b.cur").index();
		     num--;
		     if (opts.tnum) { num < 0 ? num = opts.cnum - 1 : num = num; }
		     else { num <0  ? num=$box.find("li").length - 1 : num = num; }
		     run();
		 });
}
})(jQuery)