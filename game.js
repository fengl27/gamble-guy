var displayGame = function() {
    //grass bg
    var tl = cam.toScreen(Vect.mult(l2, -1));
    var br = cam.toScreen(l2);

    let grassSize = cam.scale * 20;
    for(var x = tl.x; x < canvas.width; x += grassSize) {
        for(var y = tl.y; y < canvas.height; y += grassSize) {
            ctx.drawImage(assets[tutorial? "wood": "bricks"], x, y, grassSize, grassSize);
        }
    }
    //red danger stuff
    for(var i = 0; i < enemies.length; i ++) {
        if(enemies[i].type.drawDanger) {
            enemies[i].type.drawDanger.call(enemies[i]);
        }
    }

    //walls



    ctx.fillStyle = "rgb(66, 66, 66)";
    ctx.fillRect(0, 0, tl.x, canvas.height);
    ctx.fillRect(0, 0, canvas.width, tl.y);
    ctx.fillRect(br.x, 0, canvas.width, canvas.height);

    let margin = 4 * cam.scale;
    ctx.fillStyle = "rgb(20, 20, 20)";
    ctx.fillRect(0, 0, tl.x - margin, canvas.height);
    ctx.fillRect(0, 0, canvas.width, tl.y - margin);
    ctx.fillRect(br.x + margin, 0, canvas.width, canvas.height);
    Particle.runParticles();
    
    //actual stuff
    player.display();
    enemies.sort((a, b) => a.pos.y-b.pos.y);
    for(var i = 0; i < enemies.length; i ++) {
        enemies[i].display();
    }

    //more walls (bottom wall)
    ctx.fillStyle = "rgb(66, 66, 66)";
    ctx.fillRect(tl.x, br.y, settings.levelSize.x * cam.scale, canvas.height);
    ctx.fillStyle = "rgb(20, 20, 20)";
    ctx.fillRect(0, br.y + margin, canvas.width, canvas.height);
};
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
    if(enemies.length===0 && roundEnemies.length!==0 && !tutorial){
        switchState("gamble");
        roundEnemies = [];
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
    ctx.fillStyle = "rgba(48, 48, 48, 0.05)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = 20 * h100 + "px pixelFont";
    ctx.textAlign = "center";
    ctx.textBaseline = "hanging";
    ctx.fillStyle = "white";
    ctx.fillText("PAUSED!!!!!!!!!!!!!!!", canvas.width/2, canvas.height / 4);

    optionsMenu.runOptionsButton();
};

var drawGamble = function(things, offset, thingSpacing, pos, size) {
    ctx.fillStyle = "white";
    ctx.fillRect(...pos, ...size);
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
            Player.spriteSize - 0.04, Player.spriteSize,
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
    ctx.lineWidth = h100;
    ctx.strokeRect(...pos, ...size);

    ctx.fillStyle = "rgba(24, 24, 24, 0.1)  ";
    ctx.fillRect(...pos, size[0], size[1] / 5);
    ctx.fillRect(pos[0], pos[1] + size[1] * 4/5, size[0], size[1] / 5);

    return closest;
};

const enemyTypes = ['rock', 'archer', 'sword', 'small']
/*
var enemyMerges = [
    ["boulder", "roller",     "deflector", "controller"],
    [false,     "crossbow", "spear",     "rogue"     ],
    [false,     false,      "fencer",    "barbarian" ]
];
*/
var enemyMerges = [
    ["boulder",    "roller",   "deflector", "controller"],
    ["roller",     "crossbow", "spear",     "rogue"     ],
    ["deflector",  "spear",    "fencer",    "barbarian" ],
    ["controller", "rogue",    "barbarian", "stack"     ],
];
var gamble = function() {
    const gradient = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 30*h100, canvas.width/2, canvas.height/2, canvas.width / 2);
    gradient.addColorStop(0, "rgb(0, 0, 0)");
    gradient.addColorStop(1, "rgb(34, 34, 34)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    let results = [];
    let gambling = [
        enemyTypes,
        ["small", "plus", "archer", "plus", "rock", "plus", "sword", "plus"],
        enemyTypes,
    ];
    ctx.fillStyle = "rgb(105, 11, 11)";
    ctx.fillRect(w100 * 25, 0, w100 * 70 - h100 * 3, h100 * 100);
    ctx.fillStyle = "rgb(255, 255, 255)";
    ctx.font = 15 * h100 + "px pixelFont";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("SPIN TO WIN!", w100 * 60 - h100 * 1.5, h100 * 70);
    for(var x = 0; x < 3; x ++) {
        gamble.offsets[x] += gamble.offsetVels[x];
        var threshold = (x + 1) * 60;
        if(gamble.gambleTimer === threshold) {
            gamble.offsets[x] = h100*31 + gamble.spacing*Math.floor(Math.random() * gambling[x].length);
        }
        else if(gamble.gambleTimer > threshold) {
            gamble.offsetVels[x] *= 0.85;
            if(gamble.gambleTimer === threshold + 20) {
                soundEffects.gambleFinish.play();
            }
        }
        if(gamble.offsets[x] < 0) {
            gamble.offsets[x] += gamble.spacing * gambling[x].length;//loop back around so ya don't run out of stuff
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
        let cool = false;
        if(gambling[1][results[1]] === "plus") {
            let mergedEnemy = enemyMerges[enemyTypes.indexOf(gambling[0][results[0]])][enemyTypes.indexOf(gambling[2][results[2]])];
            if(Enemy[mergedEnemy]) {//if it's actually a thing that exists
                roundEnemies.push(mergedEnemy);//one merged guy cuz op
                cool = true;
            }
        }
        if(!cool) {
            for(var i = 0; i < results.length; i ++) {
                if(gambling[i][results[i]] !== "plus") {//don't spawn plusses ya dingus
                    roundEnemies.push(gambling[i][results[i]]);
                }
            }
        }
    }
    else if(gamble.gambleTimer > 250) {
        gamble.button.go();
        if(gamble.button.pressed) {
            if(tutorial) {
                tutorialText[32].funnyThing = currTutorialMessage;
                currTutorialMessage = 23;
                tutorialText[currTutorialMessage].time = stateSwitchTimer;
            }
            else {
                switchState("playing");
            }
        }
    }

    if(mouse.justPressed && (!gamble.gambleTimer || gamble.gambleTimer > 250)) {
        gamble.gambleTimer = 1;
        soundEffects.gamble.play();
        //gamble.offsetVels = [40 * h100, 40 * h100, 40 * h100];
        
    }
    if(gamble.gambleTimer) {
        gamble.gambleTimer ++;
        if(gamble.gambleTimer === 10) {
            screenshake.shake(20, Math.random() - 1/2, 1);
            gamble.offsets = [h100 * 20, h100 * 20, h100 * 20];//teehee
            gamble.offsetVels = [40 * h100, 40 * h100, 40 * h100];
            soundEffects.gambleSpin.play();
            soundEffects.gambleSpin.play(1);
            soundEffects.gambleSpin.play(2);
        }
    }
};
gamble.gambleTimer = 0;
gamble.spacing = h100 * 70;
gamble.offsets = [h100 * 20, h100 * 20, h100 * 20];
gamble.offsetVels = [0, 0, 0];
gamble.button = new Button(40 * w100 - 1.5 * h100, 80 * h100, 40 * w100, 10 * h100, "Next level!", "rgb(218, 193, 7)");
//gamble.offsetVels = [40 * h100, 40 * h100, 40 * h100];


var currTutorialMessage = 0;
var tutorialText = [
    {txt: "Welcome to kai's slop machine game! (Press enter to continue)", time: 0},
    {txt: "You can move around with WASD (I think )"},
    {txt: "Here, have a sword, i guess (idk)", thing: () => {player.weapons.push(weapons.sword);}},
    {txt: "Oh, you don't know how to use the sword?"},
    {txt: "Press space to select the sword (it will cycle between weapons when you have more later)."},
    {txt: "Weapons will perform better while selected."},
    {
        txt: "Try beating this guy up with the sword! (you can continue once you beat him up)",
        criteria: () => {return !enemies.length;},
        thing: () => {
            enemies.push(new Enemy(0, 0, "dummy"));
        }
        
    },
    {txt: "Good job! Killing normal people would give you money. (that guy wasn't normal)"},
    {txt: "Now it's time to go gambling!", thing: () => {
        switchState("gamble");
    }},
    {txt: "Click the funny nonexistant lever to gamble!"},
    {txt: "The enemies the slot machine lands on are the enemies in the next round."},
    {txt: "If the center one lands on a + sign, the two other enemies will merge together!"},
    {txt: "You can gamble as many times as you want (as long as you have enough money)."},
    {txt: "This will make the rounds harder, but you will get more $$$$$$$$"},
    {txt: "Just make sure to get enough money to pay your rent!"},
    {txt: "glhf go gambling now", thing: () => {
        if(Math.random() < 0.01) {
            currTutorialMessage += 2;
            tutorialText[currTutorialMessage].time = stateSwitchTimer;
        }
    }},
    {txt: "ERROR 404", thing: () => {
        tutorial = false;
    }},



    {txt: "there's a 1% chance of this text appearing"},
    {txt: "A Bb F Bb A Bb F Bb A Bb F Bb A Bb F Bb G# A "},
    {txt: "ERROR 403", thing: () => {
        tutorialText[14].thing();
    }},



    {txt: "why'd you do that?"},
    {txt: "have another one", criteria: () => {return !enemies.length;}, thing: () => {enemies.push(new Enemy(0, 0, "dummy"));}},
    {txt: "ERROR 213", thing: () => {
        currTutorialMessage = 8;
        tutorialText[currTutorialMessage].time = stateSwitchTimer;
        tutorialText[currTutorialMessage].thing();
    }},

    {txt: "finish the tutorial ya' doopid"},
    {txt: "impatient"},
    {txt: "mean"},
    {txt: "depressing"},
    {txt: "evil"},
    {txt: "burger"},
    {txt: "..."},
    {txt: "...meanie"},
    {txt: ":("},
    {txt: "ERROR 212", thing: () => {
        //console.log(tutorialText[32].funnyThing);
        currTutorialMessage = tutorialText[32].funnyThing > 15? 9: tutorialText[32].funnyThing;
        tutorialText[currTutorialMessage].time = stateSwitchTimer;
        tutorialText[currTutorialMessage].thing();
    }} 
];
var drawTutorial = function() {
    if(gameState !== "mainMenu") {
        ctx.fillStyle = "rgb(200, 200, 200)";
        ctx.strokeStyle = "black";
        ctx.lineWidth = h100;
        var width = easings.easeInOutQuad(limit(stateSwitchTimer / 30, 0, 1)) * (canvas.width / 2 - 4 * h100);
        var yPos = (easings.easeOutBack(limit(stateSwitchTimer / 30 - 0.1, 0, 1)) - 1) * canvas.height;
        yPos += h100 * 73 + Math.sin(limit(stateSwitchTimer - tutorialText[currTutorialMessage].time, 0, 5) / 5 * Math.PI) * h100 * 5;
        rect(ctx, h100 * 2, yPos, width, canvas.height / 4, true, true);
        
        if(stateSwitchTimer > 30) {
            ctx.fillStyle = "black";
            var currLine = "";
            var lineIdx = 0;
            var words = tutorialText[currTutorialMessage].txt.split(" ");
            words.push("\n");//to make sure it draws the last line
            ctx.font = 5 * h100 + "px pixelFontSmall";
            ctx.textAlign = "left";
            ctx.textBaseline = "hanging";
            for(var i = 0; i < words.length; i ++) {
                if(words[i] === "\n" || ctx.measureText(currLine + words[i]).width > width-4*h100) {
                    ctx.fillText(currLine, h100 * 4, yPos + h100 * 2 + h100 * 5 * lineIdx);
                    lineIdx ++;
                    currLine = "";
                }
                currLine += words[i] + " ";
            }
            if(justPressed['enter'] && (!tutorialText[currTutorialMessage].criteria || tutorialText[currTutorialMessage].criteria())) {
                currTutorialMessage ++;
                tutorialText[currTutorialMessage].time = stateSwitchTimer;
                try {
                    tutorialText[currTutorialMessage].thing();
                }
                catch {
                    //do nothing
                }
            }
        }
    }
};


var optionsMenu = {
    isInOptions: false,
    run: function() {
        ctx.fillStyle = "rgba(95, 95, 95, 0.05)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = 20 * h100 + "px pixelFont";
        ctx.textAlign = "center";
        ctx.textBaseline = "hanging";
        ctx.fillStyle = "white";
        ctx.fillText("OPTIONS!!!", canvas.width/2, canvas.height / 4);

        this.leaveOptionsButton.go();
        if(this.leaveOptionsButton.pressed) {
            this.isInOptions = false;
        }
    },
    optionsButton: new Button(
        canvas.width/2-h100*20, h100 * 63,
        h100 * 40, h100 * 10,
        "Options"
    ),
    leaveOptionsButton: new Button(
        h100 * 3, h100 * 3,
        h100 * 30, h100 * 10,
        "Exi(s)t", "rgb(165, 165, 1)"
    ),
    runOptionsButton: function() {
        this.optionsButton.go();
        if(this.optionsButton.pressed) {
            this.isInOptions = true;
        }
    }
};