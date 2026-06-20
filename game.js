
var displayGame = function() {
    //grass bg
    var tl = cam.toScreen(Vect.mult(l2, -1));
    var br = cam.toScreen(l2);

    let grassSize = cam.scale * 70;
    for(var x = tl.x; x < canvas.width; x += grassSize) {
        for(var y = tl.y; y < canvas.height; y += grassSize) {
            ctx.drawImage(assets.grass, x, y, grassSize, grassSize);
        }
    }
    //red danger stuff
    for(var i = 0; i < enemies.length; i ++) {
        if(enemies[i].type.drawDanger) {
            enemies[i].type.drawDanger.call(enemies[i]);
        }
    }

    //walls

    ctx.fillStyle = "rgb(22, 78, 22)";


    ctx.fillStyle = "rgb(45, 60, 40)";
    ctx.fillRect(0, 0, tl.x, canvas.height);
    ctx.fillRect(0, 0, canvas.width, tl.y);
    ctx.fillRect(br.x, 0, canvas.width, canvas.height);

    let margin = 4 * cam.scale;
    ctx.fillStyle = "rgb(20, 27, 21)";
    ctx.fillRect(0, 0, tl.x - margin, canvas.height);
    ctx.fillRect(0, 0, canvas.width, tl.y - margin);
    ctx.fillRect(br.x + margin, 0, canvas.width, canvas.height);

    //actual stuff
    player.display();
    enemies.sort((a, b) => a.pos.y-b.pos.y);
    for(var i = 0; i < enemies.length; i ++) {
        enemies[i].display();
    }

    //more walls (bottom wall)
    ctx.fillStyle = "rgb(45, 60, 40)";
    ctx.fillRect(tl.x, br.y, settings.levelSize.x * cam.scale, canvas.height);
    ctx.fillStyle = "rgb(20, 27, 21)";
    ctx.fillRect(0, br.y + margin, canvas.width, canvas.height);
};
const enemyTypes = ['archer', 'rock', 'small']
var updateGame = function() {
    /*
    if(stateSwitchTimer % 120 === 0) {
        enemies.push(new Enemy(-16/9*50, 0, enemyTypes[Math.floor(Math.random()*3)]));
    }
    */

    player.update();
    for(var i = 0; i < enemies.length; i ++) {
        enemies[i].update();
        if(enemies[i].dead) {
            enemies.splice(i, 1);
            i --;
        }
    }

    //move screen
    var diff = Vect.sub(Vect.mult(player.pos, 0.2), cam.pos);
    cam.pos.add(Vect.mult(diff, 0.2));
    cam.scale += (h100 - cam.scale) / 20;
};
var game = function() {

    updateGame();
    displayGame();
};
var upgradeScreen = function() {
};
var pauseScreen = function() {
};

var drawGamble = function(things, offset, thingSpacing, pos, size) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(...pos, ...size);
    ctx.clip();
    ctx.fillStyle = "red";
    ctx.font = "100px pixelFont";

    var closest = -1;
    var closestDist = 99999;
    for(var i = 0; i < things.length; i ++) {
        var yPos = ((i * thingSpacing + offset) % (things.length * thingSpacing)) - thingSpacing;
        
        ctx.drawImage( //draw the first image in each tileset
            assets[things[i]],
            0, 0,
            Player.spriteSize, Player.spriteSize,
            pos[0] + h100 * 4, pos[1] + yPos,
            size[0] - h100 * 8,
            size[0] - h100 * 8
        );
        var dst = Math.abs((yPos + (size[0]-h100*8)/2) - size[1]/2);
        if(dst < closestDist) {
            closest = i;
            closestDist = dst;
        }
        /*
        ctx.fillRect(pos[0] + h100 * 4, yPos,
            size[0] - h100 * 8,
            size[0] - h100 * 8);
        */
    }
    ctx.closePath();
    ctx.restore();
    ctx.strokeRect(...pos, ...size);

    ctx.fillStyle = "rgba(24, 24, 24, 0.1)  ";
    ctx.fillRect(...pos, size[0], size[1] / 5);
    ctx.fillRect(pos[0], pos[1] + size[1] * 4/5, size[0], size[1] / 5);

    return closest;
};

var gamble = function() {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    let results = [];
    let gambling = [
        ["small", "archer", "rock"],
        ["small", "plus", "archer", "plus", "rock", "plus"],
        ["small", "archer", "rock"],
    ];
    for(var x = 0; x < 3; x ++) {
        gamble.offsets[x] += gamble.offsetVels[x];
        var threshold = (x + 1) * 60;
        if(gamble.gambleTimer === threshold) {
            gamble.offsets[x] = h100*31 + gamble.spacing*Math.floor(Math.random() * gambling[x].length);
        }
        else if(gamble.gambleTimer > threshold) {
            gamble.offsetVels[x] *= 0.85;
        }
        results.push(drawGamble(
            gambling[x],
            gamble.offsets[x],
            gamble.spacing,
            [w100 * 30 + x * w100 * 20, h100 * 3],
            [w100 * 20 - h100 * 3, h100 * 60]
        ));
    }
    if(gamble.gambleTimer === 250) {
        console.log("letS go GAMbliNG")
        for(var i = 0; i < results.length; i ++) {
            if(gambling[i][results[i]] !== "plus") {//add plussing later
                roundEnemies.push(...Array(2).fill(gambling[i][results[i]]));
            }
        }
    }

    if(mouse.justPressed && !gamble.gambleTimer) {
        gamble.gambleTimer = 1;
        soundEffects.gamble.play();
        //gamble.offsetVels = [40 * h100, 40 * h100, 40 * h100];
        
    }
    if(gamble.gambleTimer) {
        gamble.gambleTimer ++;
        if(gamble.gambleTimer === 10) {
            screenshake.shake(20, Math.random() - 1/2, 1);
            gamble.offsetVels = [40 * h100, 40 * h100, 40 * h100];
            soundEffects.gambleSpin.play();
            soundEffects.gambleSpin.play(1);
            soundEffects.gambleSpin.play(2);
        }
    }
};
gamble.gambleTimer = 0;
gamble.spacing = h100 * 70;
gamble.offsets = [0, 0, 0];
gamble.offsetVels = [0, 0, 0];
//gamble.offsetVels = [40 * h100, 40 * h100, 40 * h100];