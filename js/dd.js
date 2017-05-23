var isDown = false;
var x1, y1, x2, y2;
var canvas;
var ctx;

$(function() {
  canvas = document.getElementById('dungeonmap');

  if(canvas.getContext) {
    ctx = canvas.getContext('2d');
  } else {
    // Stuff for non-canvas browsers here
  }
});

function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
}

$("#dungeonmap").on('mousedown', function(e){
    if(isDown === false) {
      isDown = true;
      var pos = getMousePos(canvas,e);
      x1 = pos.x;
      y1 = pos.y;
    }
});

$(window).on('mouseup', function(e){
  if(isDown === true) {
    var pos = getMousePos(canvas, e);

    x2 = pos.x;
    y2 = pos.y;

    ctx.fillStyle = 'rgb(200, 0, 0)';
    ctx.fillRect(x1, y1, x2, y2);
    isDown = false;
  }
});

$("#clearbtn").click(function() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});
