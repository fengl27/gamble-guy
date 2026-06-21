var currTutorialMessage = 0;
var tutorialText = [
    {txt: "Welcome to <insert gname here>! (Z to continue)", time: 0},
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
    {txt: "good job"},
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
};
var setupUpgrade = function() {
    upgradeChoices = [];
    //Choose three different upgrades from currPossibleUpgrades as the upgrades.
    var tempThing = currPossibleUpgrades.slice();//make tempThing so that we don't actually delete stuff fromcurrpossibleupgrades because you only do that hwen they actually buy it
    for(var i = 0; i < 3; i ++) {
        while(true) {
            if(tempThing.length <= 0) {
                break;
            }
            var id = Math.floor(getRand() * tempThing.length);
            if(!tempThing[i].criteria || tempThing[i].criteria()) {
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
        case "playing":
            setupLevel();
            music.playing.play();
            break;
        case "win":
            currLevel ++;
            winUpgrades = 3;
            setupUpgrade();
            break;
        case "lose":
            console.log("AHA YIOU GOT TO level " + (currLevel+1));
            break;
        case "equip":
            equipScreen.button.txt = "to Lv. " + (currLevel + 1) + "!";
            break;
        case "gamble":
            gamble.gambleTimer = 0;
            gamble.offsetVels = [h100, -h100, h100];
    }
    if(target !== "playing") {
        music.playing.pause();
    }
};
var mainMenu = {
    buttons: [//button constructor (x,y,w,h,txt)
        {b: new Button(canvas.width/2-h100*20, h100 * 50, h100 * 40, h100 * 10, "start >:)"), thing: () => switchState(tutorial? "playing": "gamble")}
    ],
    go: function() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for(var i = 0; i < this.buttons.length; i ++) {
            this.buttons[i].b.go();
            if(this.buttons[i].b.pressed) {
                this.buttons[i].thing();
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
    }
    if(paused) {
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
            case "win":
                //offset of doom
                var t = limit(stateSwitchTimer / 45 - 1, 0, 1);
                if(t < 1) {
                    updateGame(false, 0.5);
                }
                var offsetY = -easings.easeInOutQuad(t) * canvas.height;
                ctx.save();
                ctx.translate(0, offsetY);
                displayGame();
                ctx.translate(0, canvas.height);
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
                if(true) {
                    loseButtons.gambleButton.go();
                }
                else {
                    loseButtons.menuButton.go();
                }
                ctx.globalAlpha = 1;
                
                Particle.runParticles();//do the particling

                if(/*justPressed[" "]*/loseButtons.equipButton.pressed) {//press button
                    if(true) {
                        switchState("gamble");
                    }
                    else {
                        switchState("mainMenu");
                    }
                }
                break;
        }
    }
    if(tutorial && gameState !== "mainMenu") {
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
            if(justPressed['z'] && (!tutorialText[currTutorialMessage].criteria || tutorialText[currTutorialMessage].criteria())) {
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

    ctx.font = "20px pixelFontSmall";
    ctx.fillStyle = "white";
    ctx.textAlign = "left";
    ctx.textBaseline = "hanging";
    ctx.fillText(performanceTracker.fps.toFixed(2), 10, 10);
    

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