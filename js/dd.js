//TODO:
// 1) fix movement not working
// 2) add logic to mouse handlers to create new shape after clicking, dragging, releasing
// 3) add logic to mouse handlers to handle right click select + move shape (hold)
// 4) add strokeRect preview for click + drag, then fillRect when mouseup
var isDown = false;
var x1, y1; //mousedown position
var x2, y2; //mouseup position
var ctx;

function Shape(x, y, w, h, fill) {
	this.x = x || 0;
	this.y = y || 0;
	this.w = w || 1;
	this.h = h || 1;
	this.fill = fill || '#AAAAAA';
}

Shape.prototype.draw = function(ctx) {
	ctx.fillStyle = this.fill;
	ctx.fillRect(this.x, this.y, this.w, this.h);
}

Shape.prototype.contains = function(mx, my) {
  return (this.x <= mx) && (this.x + this.w >= mx) &&
    (this.y <= my) && (this.y + this.h >= my);
}

function CanvasState(canvas) {

  this.canvas = canvas;

  if(!canvas.getContext) {
    return; //Browser doesn't support canvas, bail
  }

  this.width = canvas.width;
  this.height = canvas.height;
  this.ctx = canvas.getContext('2d');

  this.selectionColor = '#CC0000';
  this.selectionWidth = 2;
  this.interval = 30; //draw rate
  var myState = this; // will lose "this" reference to CanvasState in canvas listeners
  setInterval(function() { myState.draw(); }, myState.interval); //draw loop

  // fixes mouse coordinate problems when there's a border or padding
  var stylePaddingLeft, stylePaddingTop, styleBorderLeft, styleBorderTop;
  if (document.defaultView && document.defaultView.getComputedStyle) {
    this.stylePaddingLeft = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingLeft'], 10)      || 0;
    this.stylePaddingTop  = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingTop'], 10)       || 0;
    this.styleBorderLeft  = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderLeftWidth'], 10)  || 0;
    this.styleBorderTop   = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderTopWidth'], 10)   || 0;
  }

  // Fixes fixed position bars
  var html = document.body.parentNode;
  this.htmlTop = html.offsetTop;
  this.htmlLeft = html.offsetLeft;

  this.valid = false; //if false will redraw
  this.shapes = [];
  this.dragging = false;
  this.selection = null;
  this.dragoffx = 0; //offsets used to draw moving shapes more naturally
  this.dragoffy = 0;

  //disable canvas text highlighting
  canvas.addEventListener('selectstart', function(e) {
    e.preventDefault();
    return false;
  }, false);

  canvas.addEventListener('mousedown', function(e) {
      var mouse = myState.getMouse(e);
      var mx = mouse.x;
      var my = mouse.y;
      var shapes = myState.shapes;
      var l = shapes.length;
      for(var i = l-1; i >= 0; i--) {
        if(shapes[i].contains(mx, my)) {
          var sel = shapes[i];
          myState.dragoffx = mx - sel.x;
          myState.dragoffy = my - sel.y;
          myState.dragging = true;
          myState.selection = sel;
          myState.valid = false;
          return;
        }
      }

      if (myState.selection) {
        myState.selection = null;
        myState.valid = false;
      }
  }, true);

  canvas.addEventListener('mousemove', function(e) {
    if (myState.dragging){
      var mouse = myState.getMouse(e);

      //drag from selected point on shape
      myState.selection.x = mouse.x - myState.dragoffx;
      myState.selection.y = mouse.y - myState.dragoffy;
      myState.valid = false;
    }
  }, true);

  canvas.addEventListener('mouseup', function(e) {
    myState.dragging = false;
  }, true);

  canvas.addEventListener('dblclick', function(e) {
    var mouse = myState.getMouse(e);
    myState.addShape(new Shape(mouse.x - 10, mouse.y - 10, 20, 20, 'rgba(0,255,0,.6)'));
  }, true);

  $("#clearbtn").click(function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  });
}

CanvasState.prototype.addShape = function(shape) {
  this.shapes.push(shape);
  this.valid = false;
}

CanvasState.prototype.clear = function() {
  this.ctx.clearRect(0, 0, this.width, this.height);
}

//Draw rate set by this.interval
//Only draws if this.valid is false (see above constructor)
CanvasState.prototype.draw = function() {
  if(!this.valid)  {
    console.log("drawing");
    var ctx = this.ctx;
    var shapes = this.shapes;
    this.clear();

    //draw shapes
    var l = shapes.length;
    for (var i = 0; i < 1; i++) {
      var shape = shapes[i];
      if(shape == null) continue;
      if(shape.x > this.width || shape.y > this.height ||
        shape.x + shape.w < 0 || shape.y + shape.h < 0) continue;
      shapes[i].draw(ctx);
    }

    // Draw selection
    if (this.selection != null) {
      ctx.strokeStyle = this.selectionColor;
      ctx.lineWidth = this.selectionWidth;
      var mySel = this.selection;
      ctx.strokeRect(mySel.x, mySel.y, mySel.w, mySel.h);
    }

    this.valid = true;
  }
}

CanvasState.prototype.getMouse = function(e) {
  var element = this.canvas;
  var offsetX = 0;
  var offsetY = 0;
  var mx;
  var my;

  if(element.offsetParent !== undefined) {
    do {
      offsetX += element.offsetLeft;
      offsetY += element.offsetTop;
    } while((element = element.offsetParent));
  }

  offsetX += this.styplePaddingLeft + this.styleBorderLeft + this.htmlLeft;
  offsetY += this.stylePaddingTop + this.styleBorderTop + this.htmlTop;

  mx = e.pageX - offsetX;
  my = e.pageY - offsetY;

  return {x: mx, y: my};
}

/*
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
*/

function init() {
	var state = new CanvasState(document.getElementById('dungeonmap'));
}
