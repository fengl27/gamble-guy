var stateSwitchTimer = 0;
var setupLevel = function() {
    //nothing
    player = new Player();
    enemies = [];
    cam.scale = h100 / 3;

    for(var i = 0; i < roundEnemies.length; i ++) {
        //actual spaghetti
        var p = Math.random() < 0.5? new Vect(Math.sign(Math.random()-0.5) * l2.x, Math.random() * l2.y): new Vect(Math.random() * l2.x, Math.sign(Math.random()-0.5) * l2.y);
        enemies.push(new Enemy(p.x, p.y, roundEnemies[i]));
    }
    roundEnemies = [];
};
var setupUpgrade = function(depressing, isReroll) {
    prevUpgradeChoices = upgradeChoices.slice();
    upgradeChoices = [];
    //Choose three different upgrades from currPossibleUpgrades as the upgrades.
    var tempThing = currPossibleUpgrades.slice();//make tempThing so that we don't actually delete stuff fromcurrpossibleupgrades because you only do that hwen they actually buy it
    for(var i = 0; i < 3; i ++) {
        var lim = 50;
        while(--lim >= 0) {
            if(tempThing.length <= 0) {
                break;
            }
            var id = depressing? 0: limit < tempThing.length? limit: Math.floor(Math.random() * tempThing.length);
            if((!tempThing[id].criteria || tempThing[id].criteria()) && (!isReroll || !prevUpgradeChoices.includes(tempThing[id]))) {
                upgradeChoices.push(tempThing[id]);
                tempThing.splice(id, 1);
                break;
            }
        }
    }
};
var resetUpgrades = function() {
    currPossibleUpgrades = [];
    for(var i = 0; i < possibleUpgrades.length; i ++) {
        currPossibleUpgrades.push(possibleUpgrades[i]);
    }
};
var switchState = function(target) {
    gameState = target;
    stateSwitchTimer = 0;
    switch(target) {
        case "mainMenu":
            //you've deaded so we reset ya stuff
            playerStuff = JSON.parse(JSON.stringify(defaultPlayerStuff));
            resetUpgrades();
            music.mainMenu.play();
            break;
        case "playing":
            if(tutorial) {
                currTutorialMessage = 0;
            }
            setupLevel();
            player.resetWeapons();
            playerStuff.roundsLeft --;
            music.playing.play();
            break;
        case "upgrade":
            playerStuff.totalRentCycles ++;
            setupUpgrade(playerStuff.weapons.length === 0);//only give weapons when no weapons
            if(!music.gambling.playing) {
                music.gambling.play();
            }
            break;
        case "lose":
            music.gambling.play();
            break;
        case "equip":
            equipScreen.button.txt = "to Lv. " + (currLevel + 1) + "!";
            break;
        case "gamble":
            if(playerStuff.roundsLeft === 0) {
                if(playerStuff.coins < playerStuff.requiredRent + playerStuff.debt) {
                    //ya' die
                    switchState("lose");
                    break;
                }
                else {
                    music.gambling.play();
                    switchState("upgrade");
                    return;
                }
            }
            if(!music.gambling.playing) {
                music.gambling.play();
            }

            gamble.gambleTimer = 0;
            gamble.offsetVels = [h100, -h100, h100];
            break;
    }
    //spaghet alert
    if(target !== "playing" && !music.playing.audio.paused) {
        music.playing.pause();
    }
    else if(target !== "gamble" && target !== "upgrade" && target !== "lose" && !music.gambling.audio.paused) {
        music.gambling.pause();
    }
    else if(target !== "mainMenu") {
        music.mainMenu.pause();
    }
};
var mainMenu = {
    buttons: [//button constructor (x,y,w,h,txt)
        {b: new Button(canvas.width/2-h100*20, h100 * 50, h100 * 40, h100 * 10, "Start!!"), thing: () => mainMenu.transitionTimer++},
        {b: new Button(canvas.width / 2 - h100 * 20, h100 * 37, h100 * 40, h100 * 10, "Tutorial"), thing: () => {mainMenu.transitionTimer++;tutorial=true;playerStuff.coins = 0;playerStuff.roundsLeft=4;}},
        {b: new Button(canvas.width / 2 - h100 * 20, h100 * 76, h100 * 40, h100 * 10, "Dictionary"), thing: () => {enemyDict = true;}}
    ],
    transitionTimer: 0,
    go: function() {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        if(this.transitionTimer < 15) {
            ctx.save();
            if(this.transitionTimer) {
                ctx.beginPath();
                ctx.arc(canvas.width/2, canvas.height/2, canvas.width * 0.6 * (1-easings.easeInQuart(this.transitionTimer/15)), 0, Math.PI * 2);
                ctx.clip();
            }
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "white";
            ctx.font = 20*h100 + "px pixelFont";
            ctx.strokeStyle = "black";
            ctx.lineWidth = 2 * h100;
            ctx.textAlign = "center";
            ctx.textBaseline = "hanging";
            ctx.fillText("GOD SAVE THE", canvas.width/2, 5*h100);
            ctx.fillText("SLOT MACHINE", canvas.width/2, 15*h100);
            for(var i = 0; i < this.buttons.length; i ++) {
                this.buttons[i].b.go();
                if(this.buttons[i].b.pressed) {
                    this.buttons[i].thing();
                }
            }
            optionsMenu.runOptionsButton();
            ctx.restore();
        }
        if(stateSwitchTimer < 30 && !firstTime) {
            ctx.fillStyle = "black";
            let t = 1-easings.easeInOutQuad(Math.max(0, stateSwitchTimer/15-1));
            ctx.beginPath();
            ctx.arc(0, canvas.height / 2, Math.sqrt(canvas.width*canvas.width+canvas.height*canvas.height/4)*t, 0, Math.PI*2);
            ctx.fill();
        }

        if(this.transitionTimer) {
            this.transitionTimer ++;
            if(this.transitionTimer >= 30) {
                this.transitionTimer = 0;
                firstTime = false;
                switchState(tutorial? "playing": "upgrade");
            }
        }

    }
};
var loseButtons = {
    menuButton: new Button(w100 *35, h100 * 80, w100 * 30, h100 * 10, "Main menu")
};
var lives = 3;
//switchState("playing");
var performanceTracker = {
    lastMillis: Date.now(),
    fps: 0,
    dt: 0,
    timer: 250,
    update: function() {
        var currMillis = Date.now();
        this.timer -= currMillis - this.lastMillis;
        if(this.timer <= 0) {
            this.fps = 1000 / (currMillis - this.lastMillis);
            this.dt = 60 / this.fps;
            //this.timer += 250;
        }
        this.lastMillis = currMillis;
    }
};
var frame = function() {
    performanceTracker.update();
    //fixes wierd canvas bug with uhhhhhhhhh wierd rectangles lingering
    ctx.fillStyle = "rgba(255,0,0,0.01)";
    ctx.beginPath();
    ctx.rect(0,0,1,1);
    ctx.fill();
    ctx.closePath();

    //screenshake stuff
    screenshake.update();
    canvas.style.transform = `translate(${screenshake.x}px, ${screenshake.y}px)`;
    
    //pause screen stuff
    if(justPressed["p"]) {
        paused = !paused;
        if(music.playing.playing) {
            music.playing.switchMuffled();
        }
        else if(music.gambling.playing) {
            //console.log("hi");
            music.gambling.switchMuffled();
        }
        if(!paused) {
            optionsMenu.isInOptions = false;
            enemyDict = false;
            optionsMenu.run();
        }
    }
    //spaghetti alert (pause screens are wierd and i'm lazy)
    if(optionsMenu.isInOptions) {
        optionsMenu.run();
    }
    else if(enemyDict) {
        drawEnemyDict();
    }
    else if(paused) {
        pauseScreen();
    }
    else {
        switch(gameState) {
            case "mainMenu":
                mainMenu.go();
                break;
            case "playing":
                game();
                break;
            case "gamble":
                gamble();
                break;
            case "upgrade":
                ctx.fillStyle = "black";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                //offset of doom
                var t = limit(stateSwitchTimer / 15-1, 0, 1);
                var offsetY = -easings.easeInOutQuad(t) * canvas.height;
                ctx.save();
                ctx.translate(0, offsetY + canvas.height);
                upgradeScreen();
                ctx.restore();
                break;
            case "lose":
                displayGame();
                //darkness of doom
                
                upgradeScreen(true);
                break;
        }
        drawTutorial();
    }

    justPressed = {};
    mouse.justPressed = false;
    mouse.justReleased = false;
    stateSwitchTimer ++;
    /*
    ctx.fillStyle = "red";
    ctx.fillRect(0, 0, 100, 40);
    
    ctx.fillStyle = "green"
    ctx.fillRect(0, 0, performanceTracker.fps/60 * 100, 40);
    */
    /*
    ctx.font = "20px pixelFontSmall";
    ctx.fillStyle = "white";
    ctx.textAlign = "left";
    ctx.textBaseline = "hanging";
    ctx.fillText(performanceTracker.fps.toFixed(2), 10, 10);
    */

    if(!keys.x) {
        window.requestAnimationFrame(frame);
    }
};

function startGame() {
    canvas.style.visibility = "visible";
    music.mainMenu.play();
    frame();
}
/*
ctx.textAlign = "center";
ctx.textBaseline = "middle";
ctx.fillStyle = "white";
ctx.strokeStyle = "black";
ctx.font = "6em cursive";
ctx.lineWidth = h100;
ctx.strokeText("click to start :)", canvas.width / 2, canvas.height / 2);
ctx.fillText(  "click to start :)", canvas.width / 2, canvas.height / 2);
//window.requestAnimationFrame(frame);
*/