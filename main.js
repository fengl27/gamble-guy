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
var switchState = function(target) {
    gameState = target;
    stateSwitchTimer = 0;
    switch(target) {
        case "mainMenu":
            playerStuff = JSON.parse(JSON.stringify(defaultPlayerStuff));
            break;
        case "playing":
            setupLevel();
            playerStuff.roundsLeft --;
            music.playing.play();
            break;
        case "upgrade":
            setupUpgrade(playerStuff.weapons.length === 0);//only give weapons when no weapons
            music.gambling.play();
            break;
        case "lose":
            console.log("ha ya' died");
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

            if(music.gambling.audio.paused) {
                music.gambling.play();
            }
            gamble.gambleTimer = 0;
            gamble.offsetVels = [h100, -h100, h100];
            break;
    }
    if(target !== "playing") {
        music.playing.pause();
    }
    else if(target !== "gamble" && target !== "upgrade") {
        music.gambling.pause();
    }
};
var mainMenu = {
    buttons: [//button constructor (x,y,w,h,txt)
        {b: new Button(canvas.width/2-h100*20, h100 * 50, h100 * 40, h100 * 10, "start >:)"), thing: () => mainMenu.transitionTimer++}
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
            for(var i = 0; i < this.buttons.length; i ++) {
                this.buttons[i].b.go();
                if(this.buttons[i].b.pressed) {
                    this.buttons[i].thing();
                }
            }
            optionsMenu.runOptionsButton();
            ctx.restore();
        }

        if(this.transitionTimer) {
            this.transitionTimer ++;
            if(this.transitionTimer >= 30) {
                switchState(tutorial? "playing": "upgrade");
            }
        }

    }
};
var loseButtons = {
    equipButton: new Button(h100*25, h100 * 80, h100 * 50, h100 * 10, "try again!"),
    menuButton: new Button(h100 *25, h100 * 80, h100 * 50, h100 * 10, "main menu")
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
        if(gameState === "playing") {
            music.playing.switchMuffled();
        }
        else if(gameState === "gamble") {
            music.gambling.switchMuffled();
        }
        if(!paused) {
            optionsMenu.isInOptions = false;
            optionsMenu.run();
        }
    }
    if(optionsMenu.isInOptions) {
        optionsMenu.run();
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
                var t = limit(stateSwitchTimer / 45, 0, 1);
                var opacity = easings.easeInOutQuad(t) / 2;
                ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                //variable shenanigans
                ctx.fillStyle = "rgb(206, 58, 36)";
                ctx.strokeStyle = "rgb(141, 34, 17)";
                ctx.lineWidth = h100;

                ctx.font = "5em cursive";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";

                //text falls out of sky
                var t = Math.min(stateSwitchTimer / 120, 1);
                var r = 0.2 * Math.sin(stateSwitchTimer/20);
                var y = canvas.height / 3 + canvas.height * (easings.easeOutQuad(t)-1);
                ctx.save();
                ctx.translate(canvas.width / 2, y);
                ctx.rotate(r);
                ctx.strokeText("Haha you lose", 0,0);
                ctx.fillText(  "Haha you lose", 0,0);
                ctx.restore();

                //other text just like appears idk
                var t2 = limit(stateSwitchTimer / 60 - 4, 0, 1);//just realized it's supposed to be called clamp
                var opacity = easings.easeInOutQuad(t2);
                ctx.globalAlpha = opacity;
                /*
                ctx.fillStyle = `rgba(150, 150, 150, ${opacity})`;
                ctx.strokeStyle = `rgba(100, 100, 100, ${opacity})`;
                ctx.strokeText("press space to yee", canvas.width / 2, canvas.height * 7/8);
                ctx.fillText(  "press space to yes", canvas.width / 2, canvas.height * 7/8);
                */
                
                loseButtons.menuButton.go();
                
                ctx.globalAlpha = 1;
                
                Particle.runParticles();//do the particling

                if(/*justPressed[" "]*/loseButtons.menuButton.pressed) {//press button
                    switchState("mainMenu");
                }
                break;
        }
        drawTutorial();
    }

    justPressed = [];
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