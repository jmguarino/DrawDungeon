var isDown = false;
var x1, y1, x2, y2;
var canvas;
var ctx;

init();


function CanvasState(canvas) {
  
  this.canvas = canvas;
  this.width = canvas.width;
  this.height = canvas.height;

  if(canvas.getContext) {
    this.ctx = canvas.getContext('2d');
    //placeholder ####
    ctx = canvas.getContext('2d');
  } else {
    return;
  }
}

function Shape(x, y, w, h, fill) {
	this.x = x || 0;
	this.y = y || 0;
	this.w = w || 1;
	this.h = h || 1;
	this.fill = fille || '#AAAAAA';
}

Shape.prototype.draw = function(ctx) {
	ctx.fillStyle = this.fill;
	ctx.fillRect(this.x, this.y, this.w, this.h);
}

$("#dungeonmap").on('mousedown', function(e){
    if(isDown === false) {
      isDown = true;

      x1 = e.offsetX;
      y1 = e.offsetY;
    }
});

$(window).on('mouseup', function(e){
  if(isDown === true) {

    x2 = e.offsetX - x1;
    y2 = e.offsetY - y1;

	  console.log("x1: " + x1 + " y1: " + y1 + " x2: " + x2 + " y2: " + y2);

    ctx.fillStyle = 'rgb(200, 0, 0)';
    ctx.fillRect(x1, y1, x2, y2);
    isDown = false;
  }
});

$("#clearbtn").click(function() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

function init() {
	var state = new CanvasState(document.getElementById('dungeonmap'));
}
