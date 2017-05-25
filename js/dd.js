//TODO:
// 1) Fix FF right click bug
// 2) Figure out bounding box/normals (orientation)
var isDown = false;
var x1, y1; //mousedown position
var x2, y2; //mouseup position
var ctx;

function Shape(x, y, w, h, fill, temp) {
    this.x = x || 0;
    this.y = y || 0;
    this.w = w || 1;
    this.h = h || 1;
    this.fill = fill || '#AAAAAA';
    //this.fill = getRandomColor();
    this.temp = temp || false;
}

Shape.prototype.draw = function(ctx) {
    //Is a temporary shape (preview while holding mouse)
    if (this.temp) {
        ctx.setLineDash([5, 15]);
        ctx.strokeRect(this.x, this.y, this.w, this.h);
    } else {
        ctx.setLineDash([]); //Back to bold line
        ctx.fillStyle = this.fill;
        ctx.fillRect(this.x, this.y, this.w, this.h);
    }
}

Shape.prototype.contains = function(mx, my) {
    return (this.x <= mx) && (this.x + this.w >= mx) &&
        (this.y <= my) && (this.y + this.h >= my);
}

function CanvasState(canvas) {

    this.canvas = canvas;

    if (!canvas.getContext) {
        return; //Browser doesn't support canvas, bail
    }

    this.width = canvas.width;
    this.height = canvas.height;
    this.ctx = canvas.getContext('2d');

    this.selectionColor = '#CC0000';
    this.selectionWidth = 2;
    this.interval = 30; //draw rate
    var myState = this; // will lose "this" reference to CanvasState in canvas listeners
    setInterval(function() {
        myState.draw();
    }, myState.interval); //draw loop

    // fixes mouse coordinate problems when there's a border or padding
    var stylePaddingLeft, stylePaddingTop, styleBorderLeft, styleBorderTop;
    if (document.defaultView && document.defaultView.getComputedStyle) {
        this.stylePaddingLeft = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingLeft'], 10) || 0;
        this.stylePaddingTop = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingTop'], 10) || 0;
        this.styleBorderLeft = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderLeftWidth'], 10) || 0;
        this.styleBorderTop = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderTopWidth'], 10) || 0;
    }

    // Fixes fixed position bars
    var html = document.body.parentNode;
    this.htmlTop = html.offsetTop;
    this.htmlLeft = html.offsetLeft;

    this.valid = false; //if false will redraw
    this.shapes = [];
    this.dragging = false;
    this.drawing = false;
    this.selection = null;
    this.drawingShape = null;
    this.dragoffx = 0; //offsets used to draw moving shapes more naturally
    this.dragoffy = 0;
    this.x1 = null;
    this.y1 = null;

    //disable canvas text highlighting
    canvas.addEventListener('selectstart', function(event) {
        event.preventDefault();
        return false;
    }, false);

    //disable context menu (right click menu) on canvas
    $("#dungeonmap").contextmenu(function(event) {
        event.preventDefault();
    });

    canvas.addEventListener('mousedown', function(event) {
        var mouse = myState.getMouse(event);
        var mx = mouse.x;
        var my = mouse.y;

        myState.dragging = true;
        myState.valid = false;

        //clear last set selection
        if (myState.selection) {
            myState.selection = null;
        }

        //which mouse button was pressed
        switch (event.which) {
            case 1: //left click
                //Set start point of new shape
                myState.x1 = mouse.x;
                myState.y1 = mouse.y;
                break;


            case 2: //middle mouse
                break;


            case 3: //right click
                //select shape, move while held
                var shapes = myState.shapes;
                var l = shapes.length;
                for (var i = l - 1; i >= 0; i--) {
                    if (shapes[i].contains(mx, my)) {
                        var sel = shapes[i];
                        myState.selection = sel;
                        myState.dragoffx = mx - sel.x;
                        myState.dragoffy = my - sel.y;
                        return;
                    }
                }
                break;
                //end 3
        }
				event.preventDefault();
    }, true);

    canvas.addEventListener('mousemove', function(event) {
        if (myState.dragging) {
            var mouse = myState.getMouse(event);
            //which mouse button was pressed
						console.log(event.button);
            switch (event.which) {
                case 1: //left click
                    var w = mouse.x - myState.x1;
                    var h = mouse.y - myState.y1;
                    myState.drawingShape = new Shape(myState.x1, myState.y1, w, h, 'rgba(0,255,0,.6)', true);
                    myState.valid = false;
                    break;


                case 2: //middle mouse
                    break;


                case 3: //right click
                    if (myState.selection) {
												mysState.dragging = true;
                        //drag from selected point on shape
                        myState.selection.x = mouse.x - myState.dragoffx;
                        myState.selection.y = mouse.y - myState.dragoffy;
                        myState.valid = false;
                        break;
                    }
                    //end 3
            }
        }
				event.preventDefault();
    }, true);

    canvas.addEventListener('mouseup', function(event) {
        myState.dragging = false;
        myState.drawingShape = null;
        //which mouse button is being released
        switch (event.which) {
            case 1: //left click
                //should finalize drawn shape on release of left mouse
                var mouse = myState.getMouse(event);
                //Without the absolute value + offset you can get funky negative height
                //and width boxes that look fine but can't be selected to move
                var w = Math.abs(mouse.x - myState.x1);
                var h = Math.abs(mouse.y - myState.y1);
                var startx = (mouse.x - myState.x1 < 0) ? mouse.x : myState.x1;
                var starty = (mouse.y - myState.y1 < 0) ? mouse.y : myState.y1;
                myState.drawingShape = null;
                myState.valid = false;
                myState.addShape(new Shape(startx, starty, w, h, 'rgba(0,255,0,.6)', false));
                break;


            case 2: //middle mouse
                break;


            case 3: //right click
                break;


        }
				event.preventDefault();
    }, true);

    canvas.addEventListener('dblclick', function(event) {
        var mouse = myState.getMouse(event);
        myState.addShape(new Shape(mouse.x - 10, mouse.y - 10, 20, 20, 'rgba(0,255,0,.6)'));
				event.preventDefault();
    }, true);


    $("#clearbtn").click(function() {
        myState.shapes = [];
        myState.dragging = false;
        myState.drawing = false;
        myState.selection = null;
        myState.drawingShape = null;
        myState.dragoffx = 0;
        myState.dragoffy = 0;
        myState.x1 = null;
        myState.y1 = null;
        myState.ctx.clearRect(0, 0, canvas.width, canvas.height);
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
    if (!this.valid) {
        console.log("drawing");
        var ctx = this.ctx;
        var shapes = this.shapes;
        this.clear();

        //draw shapes
        var l = shapes.length;
        for (var i = 0; i < l; i++) {
            var shape = shapes[i];
            if (shape == null) continue;
            if (shape.x > this.width || shape.y > this.height ||
                shape.x + shape.w < 0 || shape.y + shape.h < 0) continue;
            shapes[i].draw(ctx);
        }

        // Draw border around selection
        if (this.selection) {
            ctx.strokeStyle = this.selectionColor;
            ctx.lineWidth = this.selectionWidth;
            var mySel = this.selection;
            ctx.strokeRect(mySel.x, mySel.y, mySel.w, mySel.h);
        }

        // Draw dotted line preview of shape being drawn
        if (this.drawingShape) {
            this.drawingShape.draw(ctx);
        }


        this.valid = true;
    }
}

CanvasState.prototype.getMouse = function(event) {
    var element = this.canvas;
    var offsetX = 0;
    var offsetY = 0;
    var mx;
    var my;

    if (element.offsetParent !== undefined) {
        do {
            offsetX += element.offsetLeft;
            offsetY += element.offsetTop;
        } while ((element = element.offsetParent));
    }

    offsetX += this.stylePaddingLeft + this.styleBorderLeft + this.htmlLeft;
    offsetY += this.stylePaddingTop + this.styleBorderTop + this.htmlTop;

    mx = event.pageX - offsetX;
    my = event.pageY - offsetY;

    return {
        x: mx,
        y: my
    };
}

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function init() {
    var state = new CanvasState(document.getElementById('dungeonmap'));
}
