var bird = null, board = null;
var dimPipe = { width:40, height:420 }, cPos = { x: 80, y:100, h:40, w:50 };
var gravity = 0.8, iniSpeed = -7, curSpeed = 0;
var score = 0, noClr = 0, tmStep = 0, state = 0; 		// 0-not started,1-play,2-over;

(function($) {
	$.cssNumber.rotate = true;
	$.cssHooks.rotate = {
		set : function(el, v) {
			if (typeof v === 'string') 
				v = (v.indexOf("rad") != -1) ? parseInt(v) * 180 / Math.PI : parseInt(v);
			v = (~~v);
			if (v == ($.data(el, 'rotate') || 0)) return;
			el.style["MozTransform"] = el.style["MozTransform"] = el.style["-webkit-transform"]
				= el.style["transform"] = " rotate(" + (v % 360) + "deg)"; 
			$.data(el, 'rotate', v);
		},
		get : function(el, computed) {
			return $.data(el, 'rotate') || 0;
		}
	};
})(jQuery);

function gameOver() {
	state = 2;
	$(":animated").stop();
	if (tmStep) tmStep = window.clearInterval(tmStep);
	bird.animate({ top:board.height()-cPos.h, rotate:540}, 1000)
		.animate({ top:board.height()-cPos.h}, 500, function() {
			$('#score').text(' Score: ' + score);
			start();
		});
}
function Parallax(elm, tmo) {
	elm.css('left', 0).animate({left:-15360}, {
			duration:tmo*1000, easing:'linear', //step : PrlxStep,
			complete : function() { Parallax(elm, tmo); } 
	});
}

function BirdStep() {
	curSpeed += gravity;
	cPos.y = Math.max(cPos.y + curSpeed, 0);
	var ang = curSpeed * 5, mh = board.height()-cPos.h, m = -12, lo = 0, actPipe = $('.obs');
	bird.css({top: cPos.y, rotate:(ang < -20) ? -20 : (ang > 90) ? 90 : ang});
	if (cPos.y > mh)
		return gameOver();
	for (var i = actPipe.length-1; i >= 0; i--) {
		var s = actPipe[i].style, x = parseInt(s.left), y = parseInt(s.top);
		lo = Math.max(lo, x);
		if (x+dimPipe.width +m < cPos.x || x > cPos.x+cPos.w+m)	continue;
		if (y+dimPipe.height+m < cPos.y || y > cPos.y+cPos.h+m) continue;
		return gameOver();
	}
	if (actPipe.length > 3 || lo > 300 || Math.random() >= 0.05 * (1+noClr))
		return;
	var og = cPos.h * 2;
	var oh = og + Math.floor(Math.random() * (mh-og+1));
	var obs = $("<img/><img/>").addClass('c obs').css({left:480, zIndex:3}).css(dimPipe).attr('src', '/p/img/fb/vine.png')
		.appendTo(board).animate({left:-50}, Math.max(2000,3500-noClr*50), 'linear', function() { 
			$('#score').text(' Score: ' + (score += 1 + Math.floor(++noClr/10)));
			this.remove();
		});
	obs[0].style.top = oh + 'px';
	obs[1].style.top = (oh - og - dimPipe.height) + "px";
}
function onTap() {
	if (state > 1) return;
	if (state == 0) {
		state = 1;
		$('#score').text(' Score: ' + (score = 0));
		//Parallax($('#bGrnd'), 240);
		//Parallax($('#fGrnd'), 80);
		$('#instr').hide();
		tmStep = window.setInterval(BirdStep, 30);
	}
	curSpeed = iniSpeed;
}
function start() {
	state = noClr = score = 0;					// not started
	cPos = { x: 80, y:100, h:40, w:50 };
	bird.css({left:cPos.x, top:cPos.y, width:cPos.w, height:cPos.h, rotate:0});
	$('.obs').remove();
	$('#instr').show();
}

$(document).ready(function() {
	bird = $('#bird');
	var evt = (typeof(bird[0].ontouchend) == "function") ? "touchstart" : "mousedown";
	board = $('#board').bind(evt, onTap);
	start();
});
