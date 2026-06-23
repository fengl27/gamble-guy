

var cam = {
    pos: new Vect(0,0),
    scale: h100 / 3,//each 1 global u is equal to x screen px
    toScreen: function(global) {
        return new Vect(
            canvas.width / 2 + (global.x - this.pos.x) * this.scale,
            canvas.height/ 2 + (global.y - this.pos.y) * this.scale,
        );
    },
    toGlobal: function(screen) {
        return new Vect(
            (screen.x - canvas.width / 2) / this.scale + this.pos.x,
            (screen.y - canvas.height / 2) / this.scale + this.pos.y
        );
    }
};

//mouse shenanigan
var mouse = {
    pressed: false,
    x: 0,
    y: 0,
    justPressed: false,
    justReleased: false,
    button: 0
};
function handleMousePress(e) {
    mouse.pressed = true;
    mouse.justPressed = true;
    mouse.button = e.button;

    if(audioCtx.state === 'suspended') {
        console.log("resume audioctx");
        audioCtx.resume();
    }
}
function handleMouseMove(e) {
    mouse.x = (e.clientX - canvas.offsetLeft) * canvas.width/canvas.offsetWidth;
    mouse.y = (e.clientY - canvas.offsetTop) * canvas.height/canvas.offsetHeight;
}
function handleMouseRelease(e) {
    mouse.pressed = false;
    mouse.justReleased = true;
}
canvas.addEventListener("mousedown", handleMousePress   );
canvas.addEventListener("mousemove", handleMouseMove    );
canvas.addEventListener("mouseup",   handleMouseRelease );

//very yes functions
var distRectToPoint = function(tl, br, p) {
    var x = Math.min(br.x, Math.max(tl.x, p.x));
    var y = Math.min(br.y, Math.max(tl.y, p.y));

    var dx = x - p.x,
        dy = y - p.y;

    return [Math.sqrt(dx * dx + dy * dy), new Vect(x, y)];
};
var sqrDistRectToPoint = function(tl, br, p) {
    var x = Math.min(br.x, Math.max(tl.x, p.x));
    var y = Math.min(br.y, Math.max(tl.y, p.y));

    var dx = x - p.x,
        dy = y - p.y;

    return [dx * dx + dy * dy, new Vect(x, y)];
};
var IsPointInAABB = function(point, pos, size) {
    return point.x > pos.x && point.x < pos.x + size.x &&
            point.y > pos.y && point.y < pos.y + size.y;
};
var AABBCollide = function(p1, s1, p2, s2) {
    //no i didn't take this from the internet i logicked this into existance
    return p1.x + s1.x > p2.x && p1.x < p2.x + s2.x && p1.y + s1.y > p2.y && p1.y < p2.y + s2.y;
}
var fillArr = function([r, g, b]) {
    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;//waoooo
}
var limit = function(n, minV, maxV) {//limits float between a max and min
    return Math.max(Math.min(n, maxV), minV);
}
var lerp = function(a, b, t) {
    return a + (b - a) * t;
}
var sqrDist = function(x, y, x2, y2) {
    return (x - x2) * (x - x2) + (y - y2) * (y - y2);
}
var dist = function(x, y, x2, y2) {
    return Math.sqrt(sqrDist(x, y, x2, y2));
}
var lerpArr = function(a, b, t) {
    var out = [];
    for(var i = 0; i < a.length; i ++) {
        out.push(lerp(a[i], b[i], t));
    }
    return out;
};
var chooseWithWeighting = function(arr) {
    var rand = getRand();
    for(var i = 0; i < arr.length; i ++) {
        rand -= arr[i][1];
        if(rand <= 0) {
            return arr[i][0];
        }
    }
};

function drawImgWithHue(img, hue, rect, shouldReturn) {//rect is an array with x,y,w,h
    var bob = new OffscreenCanvas(rect[2], rect[3]);
    var bctx = bob.getContext("2d");
    bctx.imageSmoothingEnabled = false;//make my sad pixel art less sad (it still suck)

    // 1. Draw original image
    bctx.drawImage(img, 0, 0, rect[2], rect[3]);

    // 2. just draw over it idk at this point
    bctx.globalCompositeOperation = 'source-atop';
    bctx.fillStyle = `hsl(${hue}, 100%, 50%)`; // Target hue
    bctx.fillRect(0, 0, rect[2], rect[3]);

    //do shenanigans to make it like the same luminosity-ish
    bctx.globalCompositeOperation = 'luminosity';
    bctx.drawImage(img, 0, 0, rect[2], rect[3]);
    
    bctx.globalCompositeOperation = 'screen';
    bctx.fillStyle = `hsl(${hue}, 100%, 20%)`; // Target hue
    bctx.fillRect(0, 0, rect[2], rect[3]);
    
    
    bctx.globalCompositeOperation = 'destination-in';
    bctx.drawImage(img, 0, 0, rect[2], rect[3]);

    if(shouldReturn) {
        return [bob, bctx];
    }
    else {
        ctx.drawImage(bob, rect[0], rect[1]);
    }
}

function drawImgWithColor(img, col, sx, sy, sw, sh, x, y, w, h) {
    var bob = new OffscreenCanvas(w, h);
    var bctx = bob.getContext("2d");
    bctx.imageSmoothingEnabled = false;//make my sad pixel art less sad (it still suck)
    bctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);//draw original img
    bctx.globalCompositeOperation = "source-atop";
    bctx.fillStyle = col;
    bctx.fillRect(0, 0, w, h);
    ctx.drawImage(bob, x, y);
}

function drawGrayedImage(img, sx, sy, sw, sh, x, y, w, h) {
    var bob = new OffscreenCanvas(w, h);
    var bctx = bob.getContext("2d");
    bctx.imageSmoothingEnabled = false;//make my sad pixel art less sad (it still suck)
    bctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);//draw original img
    bctx.globalCompositeOperation = "source-atop";
    bctx.fillStyle = "rgba(48, 48, 48, 0.3)";
    bctx.fillRect(0, 0, w, h);
    ctx.drawImage(bob, x, y);
}

//display functions
var rect = function(ctx, x, y, w, h, fill, stroke) {
    /*
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    if(fill)    ctx.fill();
    if(stroke)  ctx.stroke();
    ctx.closePath();
    */
    if(fill)     ctx.fillRect(x,y,w,h);
    if(stroke) ctx.strokeRect(x,y,w,h);
}
var circle = function(ctx, x, y, s) {
    ctx.beginPath();
    ctx.arc(x, y, s, 0, Math.PI * 2);
    ctx.closePath();
};
var triangle = function(ctx, x, y, x2, y2, x3, y3) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.closePath();
};
function getTilesheetPos(walkCycle, dir) {
    return dir.x=== 1? new Vect(10 + walkCycle % 2, 0):
        dir.x===-1? new Vect(4  + walkCycle % 2, 0):
        dir.y=== 1? new Vect(     walkCycle,     0):
        dir.y===-1? new Vect(6  + walkCycle,     0):
        new Vect(0,0);
}
//easing functions (https://easings.net)
var easings = {
    easeOutQuad: (x) => {
        return 1 - (1 - x) * (1 - x);
    },
    easeInQuart: (x) => {
        return x * x * x * x;
    },
    easeInOutQuad: (x) => {
        return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
    },
    easeOutBack: (x) => {
        const c1 = 1.70158;
        const c3 = c1 + 1;

        return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
    }
};
var keys = {};
var justPressed = {};
keys.handleKeyDown = function(e) {
    //console.log("pressed " + e.key.toLowerCase());
    var k = e.key.toLowerCase();
    if(!keys[k]) {
        keys[k] = true;
        justPressed[k] = true;
    }
};
keys.handleKeyUp = function(e) {
    var k = e.key.toLowerCase();
    keys[k] = false;
};
document.body.addEventListener("keydown", keys.handleKeyDown);
document.body.addEventListener("keyup", keys.handleKeyUp);


function getInput(inputName, isJustPressed) {
    if(isJustPressed) {
        return inputName === "mouseLeft"? mouse.justPressed&&mouse.button===0:
            input.name === "mouseRight"? mouse.justPressed&&mouse.button===2:
            !!justPressed[inputName];
    }
    else {
        return inputName === "mouseLeft"? mouse.pressed&&mouse.button===0:
            inputName === "mouseRight"? mouse.pressed&&mouse.button===2:
            !!keys[inputName];
    }
}