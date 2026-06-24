var displayGame = function() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if(gameState !== "playing") {
        //crashout
        return;//this fixes the one frame of jumpscare between transitions i was having
    }
    ctx.save();
    if(updateGame.transitionTimer) {
        ctx.translate(easings.easeInQuart(limit((updateGame.transitionTimer - 30) / 20, 0, 1)) * canvas.width, 0);
    }
    //brick/wood bg
    var tl = cam.toScreen(Vect.mult(l2, -1));
    var br = cam.toScreen(l2);

    ctx.save();
    ctx.beginPath();
    ctx.rect(tl.x, tl.y, br.x-tl.x, br.y-tl.y);
    ctx.clip();

    let grassSize = cam.scale * 20;
    var xid = yid = 0;
    for(var x = tl.x; xid < 10; x += grassSize) {
        yid = 0;
        for(var y = tl.y; yid < 8; y += grassSize) {
            ctx.drawImage(assets[tutorial? getRand(xid + yid * 100) < 0.1? "sadWood": "wood": "bricks"], x, y, grassSize+1, grassSize+1);
            
            //ctx.fillStyle = `rgb(${255*getRand(xid+yid*100)}, 255, 255)`;
            //ctx.fillRect(x,y,grassSize,grassSize);
            yid ++;
        }
        xid ++;
    }

    //red danger stuff
    for(var i = 0; i < enemies.length; i ++) {
        if(enemies[i].type.drawDanger) {
            enemies[i].type.drawDanger.call(enemies[i]);
        }
    }

    ctx.restore();

    //walls



    ctx.fillStyle = "rgb(66, 66, 66)";
    ctx.fillRect(0, 0, tl.x, canvas.height);
    ctx.fillRect(0, 0, canvas.width, tl.y);
    ctx.fillRect(br.x, 0, canvas.width, canvas.height);

    let margin = 4 * cam.scale;
    ctx.fillStyle = "rgb(0, 0, 0)";
    ctx.fillRect(0, 0, tl.x - margin, canvas.height);
    ctx.fillRect(0, 0, canvas.width, tl.y - margin);
    ctx.fillRect(br.x + margin, 0, canvas.width, canvas.height);
    Particle.runParticles();
    
    //actual stuff
    for(var i = 0; i < coins.length; i ++) {
        coins[i].display();
    }
    player.display();
    enemies.sort((a, b) => a.pos.y-b.pos.y);
    for(var i = 0; i < enemies.length; i ++) {
        enemies[i].display();
    }


    //more walls (bottom wall)
    ctx.fillStyle = "rgb(66, 66, 66)";
    ctx.fillRect(tl.x, br.y, settings.levelSize.x * cam.scale, canvas.height);
    ctx.fillStyle = "rgb(0, 0, 0)";
    ctx.fillRect(0, br.y + margin, canvas.width, canvas.height);

    //ui
    ctx.fillStyle = "white";
    ctx.strokeStyle = "black";
    ctx.lineWidth = h100;

    ctx.font = 8*h100 + "px pixelFont";
    ctx.textAlign = "left";
    ctx.textBaseline = "hanging";
    ctx.drawImage(assets.coin, h100, h100, 6 * h100, 6 * h100);
    ctx.strokeText(playerStuff.coins, h100 * 8, h100 * 2);
    ctx.fillText(playerStuff.coins, h100 * 8, h100 * 2);

    //kablooey
    if(player.exploding > 150) {
        ctx.fillStyle = `rgba(0, 0, 0, ${(player.exploding - 150) / 25})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.restore();
};
var updateGame = function() {
    /*
    if(stateSwitchTimer % 120 === 0) {
        enemies.push(new Enemy(-16/9*50, 0, enemyTypes[Math.floor(Math.random()*3)]));
    }
    */

    for(var i = 0; i < coins.length; i ++) {
        coins[i].update(updateGame.transitionTimer > 0);
        if(coins[i].dead) {
            coins.splice(i, 1);
            i --;
        }
    }
    player.update();
    for(var i = 0; i < enemies.length; i ++) {
        enemies[i].update();
        if(enemies[i].dead) {
            enemies.splice(i, 1);
            i --;
        }
    }

    if(enemies.length === 0 && !player.exploding && (!tutorial || tutorialText[currTutorialMessage].switchstateplease)) {
        updateGame.transitionTimer ++;
    }

    //move screen
    var targetPos = player.exploding && !tutorial? player.pos: Vect.mult(player.pos, 0.2);
    var diff = Vect.sub(targetPos, cam.pos);
    cam.pos.add(Vect.mult(diff, 0.15));
    cam.scale += ((player.exploding && player.exploding < 30? h100*5: h100) - cam.scale) / 20;
    
    if(updateGame.transitionTimer > 50) {
        updateGame.transitionTimer = 0;
        playerStuff.coins += coins.length;
        coins = [];
        if(tutorial){
            switchState("upgrade");
            music.gambling.play();
            return;
        }else {
            switchState("gamble");
        }

    }
};
updateGame.transitionTimer = 0;
var game = function() {

    updateGame();
    displayGame();
};

var upgradeScreen = function() {
    if(upgradeChoices.length === 0) {
        switchState("gamble");//no luck
    }
    
    ctx.fillStyle = "rgb(70,70,70)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(assets.shopBackground, 0, 0, canvas.width, canvas.height);

    if(!tutorial) {
        if(upgradeScreen.potionAnim < 39 || upgradeScreen.canReroll) {
            upgradeScreen.potionAnim ++;
        }
        var potionPos = [
            new Vect(h100*100, h100 * 45), 
            new Vect(h100 * 20, h100 * 20)
        ];
        //shadow??
        ctx.fillStyle = "rgba(48, 48, 48, 0.1)";
        ctx.fillRect(potionPos[0].x + potionPos[1].x * 0.2, potionPos[0].y + potionPos[1].y, potionPos[1].x * 0.6, h100 * 2);

        var frame = Math.floor(upgradeScreen.potionAnim / 5) % 8;
        var hovered = playerStuff.roundsLeft !== 0 && upgradeScreen.canReroll && IsPointInAABB(mouse, potionPos[0], potionPos[1]);
        if(hovered) {

            ctx.fillStyle = "white";
            ctx.strokeStyle = "black";
            ctx.lineWidth = h100;
            ctx.font = 5*h100 + "px pixelFont";
            ctx.textAlign = "center";
            ctx.textBaseline = "hanging";
            ctx.strokeText("Reroll", potionPos[0].x + potionPos[1].x/2, potionPos[0].y + potionPos[1].y*1.05);
            ctx.fillText  ("Reroll", potionPos[0].x + potionPos[1].x/2, potionPos[0].y + potionPos[1].y*1.05);
            ctx.filter = "brightness(120%)";
        }
        ctx.drawImage(
            assets[upgradeScreen.canReroll? "potion": "potionDrain"],
            Player.spriteSize * frame + 0.05, 0, Player.spriteSize - 0.1, Player.spriteSize,
            potionPos[0].x,potionPos[0].y,potionPos[1].x,potionPos[1].y
        );
        ctx.filter = "none";
        if(mouse.justReleased && hovered) {
            soundEffects.bubble.play();
            //reroll
            upgradeScreen.potionAnim = 0;
            upgradeScreen.canReroll = false;
            setupUpgrade(false, true);
        }
    }



    //draw upgardesed

    ctx.strokeStyle = "rgb(255, 255, 255)";
    ctx.lineWidth = h100 / 2;
    ctx.textAlign = "left";
    ctx.textBaseline = "hanging";
    
    var thingWidth = 10 * w100;
    var thingOffsetY = 15*h100;
    var thingHeight = thingWidth;

    //Draw upgrade rectangles
    var hoveredThing = -1;
    for(var i = 0; i < upgradeChoices.length; i ++) {
        spacing = 25*h100;
        var x = (i - (upgradeChoices.length - 1) / 2) * spacing + canvas.width/2 + h100*3 - thingWidth/2;
        var pos = new Vect(x, thingOffsetY);
        var size = new Vect(thingWidth, thingHeight);
        //The rect part
        var hovered = playerStuff.roundsLeft && IsPointInAABB(
            mouse,
            pos,
            size
        );
        
        if(hovered) {
            hoveredThing = i;
            ctx.fillStyle = "rgb(76, 76, 76)";
        }
        else {
            ctx.fillStyle = "rgb(100,100,100)";
        }
        /*
        rect(
            ctx, pos.x, pos.y, size.x, size.y,
            true,
            true
        );
        */
        ctx.drawImage(
            upgradeChoices[i].symbol[0],
            upgradeChoices[i].symbol[1] * Player.spriteSize,
            upgradeChoices[i].symbol[2] * Player.spriteSize,
            Player.spriteSize, Player.spriteSize,
            pos.x + h100 * 2, pos.y + h100 * 2, size.x - h100 * 4, size.y - h100 * 4
        );
        
        ctx.drawImage(
            assets.displayCase,
            pos.x, pos.y - h100 * 5,
            size.x*1.25 - h100 * 4, size.y*1.25*34/26 - h100 * 4
        );
        //Buy detection
        if(mouse.justReleased && hovered && !upgradeScreen.transitionTimer) {
            //Purchase
            if(tutorial){
                currTutorialMessage++;
            }
            upgradeChoices[i].effect();
            soundEffects.buy.play();
            
            currPossibleUpgrades = currPossibleUpgrades.concat(upgradeChoices[i].branchThing);
            var currId = currPossibleUpgrades.indexOf(upgradeChoices[i]);
            currPossibleUpgrades[currId].amount --;
            if(currPossibleUpgrades[currId].amount <= 0) {//delete now now now now now now now now
                currPossibleUpgrades.splice(currId, 1);
            }
            upgradeScreen.transitionTimer ++;
            //switchState('gamble');
            //break;
        }
    }
    if(hoveredThing !== -1) {
        ctx.fillStyle = "rgb(100, 100, 100)";
        var margin = h100 * 2;
        var pos = new Vect(h100 * 2, h100 * 50);
        var size = new Vect(canvas.width - h100 * 4, h100 * 48);
        var upgrade = upgradeChoices[hoveredThing];
        if(tutorial){
            tutorialText[currTutorialMessage].txt = upgrade.name + " \n \n " + upgrade.description;
        }
        else {
            rect(ctx, pos.x, pos.y, size.x, size.y, true, true);

            //Struggle drawing text
            ctx.fillStyle = "rgb(255, 255, 255)";
            ctx.font = 10*h100 + "px pixelFont";
            ctx.fillText(upgrade.name, pos.x + margin, pos.y + margin);
            ctx.font = 4*h100 + "px pixelFontSmall";

            //descrpitgion
            var words = upgrade.description.split(" ");
            words.push("\n");//so that it displays the last line
            var currLine = "";
            var lineIdx = 0;
            for(var j = 0; j < words.length; j ++) {
                if(words[j] === "\n" || ctx.measureText(currLine + words[j]).width > size.x - 2 * margin) {
                    ctx.fillText(currLine, pos.x + margin, pos.y + margin + 7 * h100 + 5 * h100 * lineIdx);
                    currLine = "";
                    lineIdx ++;
                }
                if(words[j] !== "\n") {
                    currLine += words[j] + " ";
                }
            }
        }
    }
    //draw title thingy
    

    ctx.textAlign = "center";
    ctx.font = 10*h100 + "px pixelFont";

    ctx.fillStyle = "black";
    ctx.fillText  ("Choose an upgrade!", canvas.width / 2 + h100/5, h100 * 2 + h100/3);
    ctx.fillStyle = "white";
    ctx.fillText  ("Choose an upgrade!", canvas.width / 2, h100 * 2);
    
    //money
    ctx.strokeStyle = "black";
    ctx.lineWidth = h100;
    ctx.fillStyle = playerStuff.roundsLeft === 0 && stateSwitchTimer % 20 < 10? "rgb(180, 0, 0)": "white";
    ctx.font = 8*h100 + "px pixelFont";
    ctx.textAlign = "left";
    ctx.textBaseline = "hanging";
    ctx.drawImage(assets.coin, h100, h100, 6 * h100, 6 * h100);
    ctx.strokeText(playerStuff.coins, h100 * 8, h100 * 2);
    ctx.fillText(playerStuff.coins, h100 * 8, h100 * 2);

    if(playerStuff.roundsLeft === 0) {
        upgradeScreen.payTaxes = 120;
        if(mouse.justPressed) {
            playerStuff.coins -= playerStuff.requiredRent + playerStuff.debt;
            playerStuff.debt = 0;
            playerStuff.roundsLeft = 3;
            playerStuff.requiredRent = Math.min(50, Math.ceil(playerStuff.requiredRent * 1.5));
            for(var i = 0; i < 5; i ++) {
                coins.push(new Coin(9999, 9999));
            }
        }
        let b = upgradeScreen.taxButton;
        b.p.set(mouse.x - b.s.x/2, mouse.y - b.s.y/2);
    }
    if(upgradeScreen.payTaxes) {

        upgradeScreen.taxButton.p.y += (120 - upgradeScreen.payTaxes) * h100/10;
        upgradeScreen.taxButton.go();
        upgradeScreen.payTaxes --;

        for(var i = 0; i < coins.length; i ++) {
            coins[i].update(false);
        }
        if(upgradeScreen.payTaxes <= 0) {
            coins = [];
        }
    }

    if(upgradeScreen.transitionTimer) {
        upgradeScreen.transitionTimer ++;
        let width = canvas.width - (canvas.width + canvas.height) * easings.easeInOutQuad(Math.min(1, upgradeScreen.transitionTimer/15));
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.moveTo(canvas.width, 0);
        ctx.lineTo(width, 0);
        ctx.lineTo(width + canvas.height, canvas.height);
        ctx.lineTo(canvas.width, canvas.height);
        ctx.fill();
        if(upgradeScreen.transitionTimer > 30) {
            upgradeScreen.transitionTimer = 0;
            upgradeScreen.canReroll = true;
            switchState("gamble");
        }
    }
};
upgradeScreen.canReroll = true;
upgradeScreen.potionAnim = 0;
upgradeScreen.payTaxes = 0;
upgradeScreen.taxButton = new Button(0, 0, h100 * 50, h100 * 10, "PAY RENT!", "red");
upgradeScreen.transitionTimer = 0;
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
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2 * h100;
    rect(ctx, w100 * 25, -canvas.height/2, w100 * 70 - h100 * 3, canvas.height*2, true, true);
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

    
    //draw arm
    var frame = gamble.gambleTimer && gamble.gambleTimer < 255? gamble.gambleTimer > 250? 5: gamble.gambleTimer < 8? 2: gamble.gambleTimer < 16? 3: 4: stateSwitchTimer % 30 < 15? 1: 0;
    ctx.drawImage(assets.arm, frame * 18 + 0.04, 0, 18 - 0.08, 40,
        w100 * 25 - h100 * 36.5,
        canvas.height / 4,
        h100 * 36,
        h100 * 80
    );

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
                tutorialText[45].funnyThing = currTutorialMessage;
                currTutorialMessage = 36;
                tutorialText[currTutorialMessage].time = stateSwitchTimer;
            }
            else {
                gamble.transitionTimer ++;
            }
        }
    }

    if(mouse.justPressed && (!gamble.gambleTimer || gamble.gambleTimer > 250) && IsPointInAABB(
            mouse,
            {x: w100 * 25 - h100 * 36.5, y: canvas.height / 4},
            {x: h100 * 36, y: h100 * 40}
    )) {
        if(playerStuff.coins >=2){
            playerStuff.coins -= 2;
        }else{
            playerStuff.debt += 2-playerStuff.coins;
            playerStuff.coins = 0;
        }
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

    //ui
    ctx.fillStyle = playerStuff.coins >= (playerStuff.requiredRent+playerStuff.debt)? "rgb(75, 160, 18)": "rgb(180, 0, 0)";
    ctx.strokeStyle = "black";
    ctx.lineWidth = h100;

    ctx.font = 8*h100 + "px pixelFont";
    ctx.textAlign = "left";
    ctx.textBaseline = "hanging";
    ctx.drawImage(assets.coin, h100, h100, 6 * h100, 6 * h100);
    ctx.strokeText(playerStuff.coins + " coins", h100 * 8, h100 * 2);
    ctx.fillText(playerStuff.coins   + " coins", h100 * 8, h100 * 2);

    ctx.fillStyle = "white";
    ctx.strokeText("- " + playerStuff.requiredRent + " rent", h100 * 3, h100 * 7);
    ctx.fillText  ("- " + playerStuff.requiredRent + " rent", h100 * 3, h100 * 7);
    if(playerStuff.debt>1){
        ctx.fillStyle = "white";
        ctx.strokeText("- " + playerStuff.debt + " debt", h100 * 3, h100 * 12);
        ctx.fillText  ("- " + playerStuff.debt + " debt", h100 * 3, h100 * 12);
    }

    ctx.fillStyle = playerStuff.roundsLeft < 2? "rgb(180, 0, 0)": "white";
    ctx.textBaseline = "bottom";
    var thing = 5 + Math.sin(stateSwitchTimer / 20) * 1.5;
    ctx.font = (8 + (playerStuff.roundsLeft === 1) * thing)*h100 + "px pixelFont";
    var txt = playerStuff.roundsLeft === 0? "RENT TODAY!!": `RENT IN ${playerStuff.roundsLeft + " DAY" + (playerStuff.roundsLeft===1? "!!!!!!!!!!!!!": "S!!")}`;
    ctx.strokeText(txt, h100 * 2, h100 * 102);
    ctx.fillText  (txt, h100 * 2, h100 * 102);


    //funny transition
    if(stateSwitchTimer < 15) {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height * (1-easings.easeOutQuad(stateSwitchTimer / 15)));
    }

    if(gamble.transitionTimer) {
        gamble.transitionTimer ++;
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width * easings.easeInQuart(Math.min(gamble.transitionTimer/15,1)), canvas.height);
        if(gamble.transitionTimer > 30) {
            gamble.transitionTimer = 0;
            switchState("playing");
        }
    }
};
gamble.transitionTimer = 0;
gamble.gambleTimer = 0;
gamble.spacing = h100 * 70;
gamble.offsets = [h100 * 20, h100 * 20, h100 * 20];
gamble.offsetVels = [0, 0, 0];
gamble.button = new Button(40 * w100 - 1.5 * h100, 80 * h100, 40 * w100, 10 * h100, "Next level!", "rgb(218, 193, 7)");
//gamble.offsetVels = [40 * h100, 40 * h100, 40 * h100];


var currTutorialMessage = 0;
var tutorialText = [
    {txt: "Welcome to LORD SAVE THE SLOP MACHINE! (Press enter to continue)", time: 0},
    {txt: "You can move around with WASD"},
    {txt: "Here, have a sword!", thing: () => {player.weapons = [];player.weapons.push(weapons.sword);}},
    {txt: "The sword spins...\nand KILLS PEOPLE!"},
    {txt: "MWAH HAH HAH HAH!!"},
    {txt: "You'll get more weapons later on"},
    {
        txt: "Try beating this guy up with the sword! (You can continue once you beat him up)",
        criteria: () => {return !enemies.length;},
        thing: () => {
            player.iframes = 20;
            enemies.push(new Enemy(0, 0, "dummy"));
        }
        
    },
    {txt: "Here, have the aformentioned other weapons!", thing: () => {player.weapons = [];player.weapons.push(weapons.bow);}},
    {txt: "The bow spins...\nbut, like in the opposite direction!"},
    {
        txt: "Hold left click to start charging the bow!!"
    },
    {
        txt: "Look, it's this guy again! (Run into the enemy to reset if you need to look at previous instructions.)",
        criteria: () => {return !enemies.length;},
        thing: () => {
            player.iframes = 20;
            enemies.push(new Enemy(0, 0, "dummy"));
        }
        
    },
    {txt: "Here, have another funny weapon!", thing: () => {player.weapons = [];player.weapons.push(weapons.throwMace);}},
    {txt: "The mace exists...\nbut, it's hidden!"},
    {
        txt: "Right click to start charging the mace!!",
    },
    {
        txt: "I almost forgot, if the mace reaches the end of the rope...",
    },
    {
        txt: "...It pulls you! (Don't forget to grab it!)",
    },
    {
        txt: "Look, it's this guy again! (The mace exists, just press the button!)",
        criteria: () => {return !enemies.length;},
        thing: () => {
            player.iframes = 20;
            enemies.push(new Enemy(0, 0, "dummy"));
        }
        
    },
    {
        txt: "He's angry now...",
        criteria: () => {return !enemies.length;},
        thing: () => {
            player.weapons.push(weapons.sword);
            player.weapons.push(weapons.bow);
            enemies.push(new Enemy(player.pos.x>0?50*16/9:-50*16/9, player.pos.x>0?50:-50, "sword"));
            enemies[0].numCoins = 6;
        }
        
    },
    {txt: "Wow, he dropped money that time!"},
    {txt: "Speaking of money, where'd all your other money go? Aren't you the king?"},
    {txt: "Ohh... right, gambling addiction. Okay, moving on-"},
    {txt: "Here is my collection! You can pick one weapon to start with. I'll give you more stuff the next time we meet.",switchstateplease: true,thing:() =>{switchState("upgrade");player.weapons = []}, criteria: () => {return gameState === "gamble"}},
    {txt: "It's time to fuel your gambling addiction!", switchstateplease: true, criteria: () => {return gameState === "gamble"}},
    {txt: "Click the lever to gamble! It costs 2 coins, though..."},
    {txt: "The enemies the slot machine lands on are the enemies in the next round."},
    {txt: "If the center one lands on a + sign, the two other enemies will merge together!"},
    {txt: "You can gamble as many times as you want (as long as you have enough money)."},
    {txt: "This will make the rounds harder, but you will get more $$$$$$$$"},
    {txt: "Just make sure to get enough money to pay your rent!"},
    {txt: "Now, go out and gamble your life away! (literally)", thing: () => {
        if(Math.random() < 0.01) {
            currTutorialMessage += 2;
            tutorialText[currTutorialMessage].time = stateSwitchTimer;
        }
    }},
    {txt: "ERROR 404", thing: () => {
        tutorial = false;
    }},



    {txt: "There's a 1% chance of this text appearing"},
    {txt: "A Bb F Bb A Bb F Bb A Bb F Bb A Bb F Bb G# A", thing: () => {
        music.gambling.pause();
        music.gaster.play();
    }},
    {txt: "ERROR 403", thing: () => {
        music.gambling.unpause();
        music.gaster.pause();
        tutorial = false;
    }},



    {txt: "Dude... \n you died to the tutorial guy"},
    {txt: "Lets review again!", criteria: () => {return !enemies.length;}, thing: () => {
        player.iframes = 20;
        player.weapons = [weapons.sword];
        enemies.push(new Enemy(0, 0, "dummy"));
        music.playing.unpause();
    }},
    {txt: "ERROR 213", thing: () => {
        currTutorialMessage = 7;
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
        currTutorialMessage = tutorialText[43].funnyThing > 15? 9: tutorialText[43].funnyThing;
        tutorialText[currTutorialMessage].time = stateSwitchTimer;
        tutorialText[currTutorialMessage].thing();
    }} 
];
var drawTutorial = function() {
    if((gameState !== "mainMenu" && !updateGame.transitionTimer && tutorial) || upgradeScreen.payTaxes) {
        ctx.strokeStyle = "black";
        ctx.lineWidth = h100;
        var t = gameState === "playing"? limit(stateSwitchTimer / 30, 0, 1): 1;
        var width = easings.easeInOutQuad(t) * (canvas.width / 2 - 4 * h100);
        var yPos = (easings.easeOutBack(t) - 1) * canvas.height;
        var lastThing = tutorial? stateSwitchTimer - tutorialText[currTutorialMessage].time: stateSwitchTimer;
        yPos += h100 * 73 + Math.sin(limit(lastThing, 0, 5) / 5 * Math.PI) * h100 * 3;

        if(stateSwitchTimer > 30) {
            t = gameState === "playing"? limit((stateSwitchTimer - 10)/60, 0, 1): 1;
            var gooberY = h100 * 46 + (1-easings.easeInOutQuad(t)) * h100 * 54;
            ctx.save();
            ctx.rect(h100 * 5, h100 * 41, h100 * 40, h100 * 40);
            ctx.clip();
            ctx.fillStyle = "rgb(243, 243, 178)";
            rect(
                ctx, h100 * 10, gooberY, h100 * 30, h100 * 30, true, true
            );
            ctx.drawImage(assets.tutorialNpc, lastThing < 15? 0: 53, 0, 53, 53,
                h100 * 10, gooberY, h100 * 30, h100 * 30
            );
            ctx.restore();
        }
        ctx.fillStyle = "rgb(200, 200, 200)";

        rect(ctx, h100 * 2, yPos, width, canvas.height / 4, true, true);

        
        
        if(stateSwitchTimer > 30) {
            ctx.fillStyle = "black";
            var currLine = "";
            var lineIdx = 0;
            var words = (tutorial? tutorialText[currTutorialMessage].txt: playerStuff.roundsLeft === 0? "So we meet again. \n Pay your rent and you can have another one of my things!": "Thanks bye~").split(" ");

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
                if(words[i] !== "\n") {
                    currLine += words[i] + " ";
                }
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
    currScreen: "main",
    run: function() {
        ctx.fillStyle = "rgb(95, 95, 95)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = 20 * h100 + "px pixelFont";
        ctx.textAlign = "center";
        ctx.textBaseline = "hanging";
        ctx.fillStyle = "white";
        ctx.fillText("OPTIONS!!!", canvas.width/2, canvas.height / 4);

        switch(this.currScreen) {
            case "main":
                this.toKeybindsButton.go();
                if(this.toKeybindsButton.pressed) {
                    this.currScreen = "keybinds";
                }
                break;
        }

        this.leaveOptionsButton.go();
        if(this.leaveOptionsButton.pressed) {
            if(this.currScreen === "main") {
                this.isInOptions = false;
            }
            else {
                this.currScreen = "main";
            }
        }

        for(var i = 0; i < pauseSettingsEl.children.length; i ++) {
            var shouldShow = this.isInOptions && pauseSettingsEl.children[i].id === "pauseSettings-" + this.currScreen;
            if(shouldShow !== (pauseSettingsEl.children[i].style.visibility === "visible")) {
                pauseSettingsEl.children[i].style.visibility = shouldShow? "visible": "hidden";
            }
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
    toKeybindsButton: new Button(
        canvas.width/2-h100*20, h100 * 85,
        h100 * 40, h100 * 10,
        "Keybinds"
    ),
    runOptionsButton: function() {
        this.optionsButton.go();
        if(this.optionsButton.pressed) {
            this.isInOptions = true;
            this.currScreen = "main";
        }
    }
};