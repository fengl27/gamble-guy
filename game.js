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
    if(!player.exploding || player.exploding > 30) {
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
    }
    
    //actual stuff
    for(var i = 0; i < coins.length; i ++) {
        coins[i].display();
    }
    player.display();
    enemies.sort((a, b) => a.pos.y-b.pos.y);
    for(var i = 0; i < enemies.length; i ++) {
        enemies[i].display();
    }

    if(!player.exploding || player.exploding > 30) {
        let margin = 4 * cam.scale;
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
    }

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

    let doActualEnemiesExist = false;

    for(var i = 0; i < enemies.length; i ++) {
        enemies[i].update();
        if(enemies[i].dead) {
            enemies.splice(i, 1);
            i --;
        }
        else if(enemies[i].numCoins > 0) doActualEnemiesExist = true;
    }

    if(!doActualEnemiesExist && !player.exploding && (!tutorial || tutorialText[currTutorialMessage].switchstateplease)) {
        if(!updateGame.transitionTimer) {//KILL everyone
            for(var i = 0; i < enemies.length; i ++) {
                enemies[i].damage(enemies[i].health);
            }
        }
        updateGame.transitionTimer ++;
    }

    //move screen
    var targetPos = player.exploding && !tutorial? player.pos: Vect.mult(player.pos, 0.2);
    var diff = Vect.sub(targetPos, cam.pos);
    cam.pos.add(Vect.mult(diff, 0.15));
    cam.scale += (cam.targetScale - cam.scale) / 20;
    cam.targetScale = (player.exploding && player.exploding < 30? h100*5: h100);//e
    
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

var upgradeScreen = function(lost) {
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
        var hovered = playerStuff.roundsLeft !== 0 && playerStuff.weapons.length && upgradeScreen.canReroll && IsPointInAABB(mouse, potionPos[0], potionPos[1]);
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
            tutorialText[currTutorialMessage].time = 0;
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
        upgradeScreen.payTaxes = 90;
        if(mouse.justReleased) {
            playerStuff.coins -= playerStuff.requiredRent + playerStuff.debt;
            if(!lost) {
                playerStuff.debt = 0;
                playerStuff.roundsLeft = 3;
                playerStuff.requiredRent += playerStuff.requiredRent < 4? 1: 2;
                for(var i = 0; i < 5; i ++) {
                    coins.push(new Coin(9999, 9999));
                }
            }
            else {
                upgradeScreen.loseTimer ++;
            }
        }
        if(!upgradeScreen.loseTimer) {
            let b = upgradeScreen.taxButton;
            b.p.set(mouse.x - b.s.x/2, mouse.y - b.s.y/2);
        }
    }
    if(upgradeScreen.payTaxes) {

        upgradeScreen.taxButton.p.y += (90 - upgradeScreen.payTaxes + upgradeScreen.loseTimer) * h100/10;
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
            if(tutorial) {
                currTutorialMessage ++;
                tutorialText[currTutorialMessage].time = 0;
            }
            switchState("gamble");
        }
    }

    if(upgradeScreen.loseTimer) {
        upgradeScreen.loseTimer ++;
        if(upgradeScreen.loseTimer > 60) {
            drawLossScreen(upgradeScreen.loseTimer - 60);
        }
    }
};
upgradeScreen.loseTimer = 0;
var drawLossScreen = function(stateSwitchTimer){
    var t = limit(stateSwitchTimer / 45, 0, 1);
    var opacity = easings.easeInOutQuad(t) / 2;
    ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    //variable shenanigans
    ctx.fillStyle = "rgb(206, 58, 36)";
    ctx.strokeStyle = "rgb(141, 34, 17)";
    ctx.lineWidth = h100;

    ctx.font = 15*h100 + "px pixelFont";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    //text falls out of sky
    var t = Math.min(stateSwitchTimer / 120, 1);
    var r = 0.2 * Math.sin(stateSwitchTimer/20);
    var y = canvas.height / 3 + canvas.height * (easings.easeOutQuad(t)-1);
    ctx.save();
    ctx.translate(canvas.width / 2, y);
    ctx.rotate(r);
    ctx.strokeText("You have failed to pay rent", 0,0);
    ctx.fillText(  "You have failed to pay rent", 0,0);
    ctx.restore();

    //other text just like appears idk
    var t2 = limit(stateSwitchTimer / 60 - 2, 0, 1);//just realized it's supposed to be called clamp
    var opacity = easings.easeInOutQuad(t2);
    ctx.globalAlpha = opacity;
    /*
    ctx.fillStyle = `rgba(150, 150, 150, ${opacity})`;
    ctx.strokeStyle = `rgba(100, 100, 100, ${opacity})`;
    ctx.strokeText("press space to yee", canvas.width / 2, canvas.height * 7/8);
    ctx.fillText(  "press space to yes", canvas.width / 2, canvas.height * 7/8);
    */
    ctx.fillStyle = "white";
    ctx.font = 5 * h100 + "px pixelFontSmall";
    ctx.fillText("You lived through " + playerStuff.totalRentCycles + ` rent cycle${playerStuff.totalRentCycles===1?"":"s"}.`, canvas.width / 2, canvas.height / 2);
    
    loseButtons.menuButton.go();
    
    ctx.globalAlpha = 1;

    if(loseButtons.menuButton.pressed) {//press button
        drawLossScreen.transitionTimer ++;
    }
    
    Particle.runParticles();//do the particling

    
    if(drawLossScreen.transitionTimer) {
        drawLossScreen.transitionTimer ++;
        var w = easings.easeInOutQuad(limit(drawLossScreen.transitionTimer / 15, 0, 1)) * canvas.width / 2;
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, w, canvas.height);
        ctx.fillRect(canvas.width - w, 0, w, canvas.height);
        if(drawLossScreen.transitionTimer > 30) {
            upgradeScreen.loseTimer = 0;
            upgradeScreen.payTaxes = 0;
            switchState("mainMenu");
        }
    }
}
drawLossScreen.transitionTimer = 0;
upgradeScreen.canReroll = true;
upgradeScreen.potionAnim = 0;
upgradeScreen.payTaxes = 0;
upgradeScreen.taxButton = new Button(0, 0, h100 * 50, h100 * 10, "PAY RENT!", "red");
upgradeScreen.transitionTimer = 0;
var pauseScreen = function() {
    ctx.fillStyle = "rgba(48, 48, 48)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = 20 * h100 + "px pixelFont";
    ctx.textAlign = "center";
    ctx.textBaseline = "hanging";
    ctx.fillStyle = "white";
    ctx.fillText("PAUSED!!!!!!!!!!!!!!!", canvas.width/2, canvas.height / 4);

    ctx.font = 5 * h100 + "px pixelFont";
    ctx.fillText("Press P to unpause", canvas.width / 2, canvas.height * 0.38);

    optionsMenu.runOptionsButton();
    pauseScreen.enemyDictButton.go();
    if(pauseScreen.enemyDictButton.pressed) {
        enemyDict = true;
    }
};
pauseScreen.enemyDictButton = new Button(canvas.width / 2 - h100 * 35, h100 * 50, h100 * 70, h100 * 10, "Enemy dictionary");

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

const enemyTypes = ['rock', 'archer', 'sword', 'small'];

var enemyMerges = [//this is the gooberiest way to merge stuff but idk
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
    ctx.fillText("SPIN TO WIN!", w100 * 55 - h100 * 7.5, h100 * 70);

    ctx.lineWidth = h100;
    ctx.fillStyle = "rgb(228, 228, 34)";
    rect(ctx, w100 * 55 + h100 * 30, h100 * 65, h100 * 31, h100 * 9, true, true);
    ctx.fillStyle = "black";
    ctx.font = 11 * h100 + "px pixelFont";
    ctx.fillText(gamble.numRolls + " roll" + (gamble.numRolls !== 1? "s": ""), w100 * 55 + h100 * 46, h100 * 70);
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
    for(var x = 0; x < 3; x ++) {
        if(gamble.gambleTimer > 230 && (gambling[1][results[1]] !== "plus" || x === 1)) {
            let type = x === 1 && gambling[x][results[x]] === "plus"?
                enemyMerges[enemyTypes.indexOf(gambling[0][results[0]])][enemyTypes.indexOf(gambling[2][results[2]])]:
                gambling[x][results[x]];
            let bob = new Enemy(0,0,type);
            let dudeMoney = type === "stack"? 3: bob.numCoins;
            ctx.drawImage(assets.coin, w100 * 30 + h100 + x * w100 * 20, h100 * 58, h100 * 4, h100 * 4);
            ctx.fillStyle = "black";
            ctx.textAlign = "left";
            ctx.textBaseline = "hanging";
            ctx.font = 6*h100 + "px pixelFont";
            ctx.fillText(dudeMoney, w100 * 30 + h100 * 6 + x * w100 * 20, h100 * 58.5);
        }
    }
    let roundCash = 0;
    for(var i = 0; i < roundEnemies.length; i ++) {
        var cash = new Enemy(0,0,roundEnemies[i]).numCoins;
        if(roundEnemies[i] === "stack") {
            roundCash += 3;
        }
        else {
            roundCash += cash;
        }
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
                currTutorialMessage = 0;
                while(tutorialText[currTutorialMessage].txt !== "finish the tutorial ya' doopid") {
                    currTutorialMessage ++;
                }

                tutorialText[53].funnyThing = currTutorialMessage;
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
            gamble.numRolls ++;
        }
    }

    //ui
    ctx.fillStyle = playerStuff.coins >= (playerStuff.requiredRent+playerStuff.debt)? "rgb(75, 160, 18)":
        playerStuff.coins + roundCash >= (playerStuff.requiredRent+playerStuff.debt)? "rgb(212, 212, 22)": "rgb(180, 0, 0)";
    ctx.strokeStyle = "black";
    ctx.lineWidth = h100;

    ctx.font = 8*h100 + "px pixelFont";
    ctx.textAlign = "left";
    ctx.textBaseline = "hanging";
    ctx.drawImage(assets.coin, h100, h100, 6 * h100, 6 * h100);
    var txt = roundCash > 0? playerStuff.coins + " coins + " + roundCash: playerStuff.coins + " coins";
    ctx.strokeText(txt, h100 * 8, h100 * 2);
    ctx.fillText  (txt, h100 * 8, h100 * 2);

    ctx.fillStyle = "white";
    ctx.strokeText("- " + playerStuff.requiredRent + " rent", h100 * 3, h100 * 7);
    ctx.fillText  ("- " + playerStuff.requiredRent + " rent", h100 * 3, h100 * 7);
    if(playerStuff.debt>=1){
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
gamble.numRolls = 0;
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
    {txt: "Here, have a Sword!", thing: () => {player.weapons = [];player.weapons.push(weapons.sword);}},
    {txt: "The Sword spins...\nand KILLS PEOPLE!"},
    {txt: "MWAH HAH HAH HAH!!"},
    {txt: "You'll get more weapons later on."},
    {
        txt: "Try beating this guy up with the Sword! \n It'll spin automatically.",
        criteria: () => {return !enemies.length;},
        thing: () => {
            player.iframes = 20;
            enemies.push(new Enemy(0, 0, "dummy"));
        }
        
    },
    {txt: "Here, have a different weapon - The Bow.", thing: () => {player.weapons = [];player.weapons.push(weapons.bow);}},
    {txt: "The Bow spins...\nbut, like in the opposite direction!"},
    {
        txt: "Hold left click to start charging the bow!!"
    },
    {
        txt: "Look, it's this guy again! \n Left click to start charging an arrow. \n Release to release.",
        criteria: () => {return !enemies.length;},
        thing: () => {
            player.iframes = 20;
            enemies.push(new Enemy(0, 0, "dummy"));
        }
        
    },
    {txt: "Here, have the last weapon, the Mace!", thing: () => {player.weapons = [];player.weapons.push(weapons.throwMace);}},
    {txt: "The Mace exists...\nbut, it's hidden!"},
    {
        txt: "Right click to start charging the Mace. It aims towards your mouse (sorry trackpad people).",
    },
    {
        txt: "I almost forgot, if the mace reaches the end of the rope...",
    },
    {
        txt: "...It pulls you! (Don't forget to grab it!)",
    },
    {
        txt: "This guy's back again (for the third time)! \n Right click to charge the Mace, you'll have to pick it up later.",
        criteria: () => {return !enemies.length;},
        thing: () => {
            player.iframes = 20;
            enemies.push(new Enemy(0, 0, "dummy"));
        }
        
    },
    {
        txt: "Do you know what this game needs?"
    },
    {
        txt: "You guessed it, parry slop."
    },
    {
        txt: "You can summon your shield with the space bar (assuming you have a shield, you're just borrowing my 999 shields for now.)"
    },
    {
        txt: "However, it breaks if you use it too early."
    },
    {
        txt:"Try parrying now! Parry when the arrow is about to hit you. Continue once you're ready!",
        criteria: () => {return tutorialText[currTutorialMessage].time - stateSwitchTimer < -60 && justPressed["enter"]},
        thing: () => {
            player.shields = 999;
            player.weapons = [];
            enemies = [];
            enemies.push(new Enemy(player.pos.x>0?50*16/9:-50*16/9, player.pos.x>0?50:-50, "archer"));
            enemies[0].numCoins = 0;
        }
    },
    {
        txt:"Oh, the other guy is back now.",
        criteria: () => {return !enemies.length;},
        thing: () => {
            player.iframes = 20;
            for(var i = 0; i < enemies.length; i ++) {
                enemies[i].dead = true;
            }
            player.weapons = [weapons.sword, weapons.bow, weapons.throwMace]
            enemies.push(new Enemy(0, 0, "dummy"));
        }
    },
    {
        txt: "He looks angry.",
        criteria: () => {return !enemies.length;},
        thing: () => {
            enemies = [];
            player.iframes = 20;
            player.weapons = [weapons.sword, weapons.bow, weapons.throwMace]
            enemies.push(new Enemy(player.pos.x>0?50*16/9:-50*16/9, player.pos.x>0?50:-50, "sword"));
            enemies[0].numCoins = 6;
        }
        
    },
    {txt: "Wow, he dropped money that time!"},
    {txt: "Speaking of money, where'd all your other money go? Aren't you the king?"},
    {txt: "Ohh... right, gambling addiction. Okay, moving on-"},
    {txt: "Here is my collection! You can pick one weapon to start with. I'll give you more stuff the next time we meet.",thing:() =>{switchState("upgrade");tutorialText[currTutorialMessage].time = 0; player.weapons = []}, criteria: () => {return gameState === "gamble"}},
    {txt: "It's time to fuel your gambling addiction!"},
    {txt: "It's time to fuel your gambling addiction!"},
    {txt: "Click the lever to gamble! It costs 2 coins, though..."},
    {txt: "The enemies the slot machine lands on are the enemies in the next round."},
    {txt: "If the center one lands on a + sign, the two other enemies will merge together!"},
    {txt: "You can gamble as many times as you want (as long as you have enough money)."},
    {txt: "This will make the rounds harder, but you will get more $$$$$$$$"},
    {txt: "Just make sure to get enough money to pay your rent!"},
    {txt: "By the way, press P to pause. There's an enemy dictionary and options menu from there!"},
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
        //music.gambling.pause();
        //music.gaster.play();
        music.gambling.audio.pause();
        music.gaster.audio.play();
    }},
    {txt: "ERROR 403", thing: () => {
        music.gambling.audio.play();
        //music.gaster.pause();
        music.gaster.audio.pause();//dead pause
        tutorial = false;
    }},



    {txt: "Dude... \n you died to the tutorial guy"},
    {txt: "Lets review again!", criteria: () => {return !enemies.length;}, thing: () => {
        player.iframes = 20;
        if(player.weapons.length === 3){
            currTutorialMessage = 22;
        }
        else if(player.weapons.length===0){
            currTutorialMessage = 21;
        }
        else if(player.weapons[0]===weapons.sword){
            currTutorialMessage = 2;
        }
        else if(player.weapons[0]===weapons.bow){
            currTutorialMessage = 7;
        }
        else if(player.weapons[0]===weapons.throwMace){
            currTutorialMessage = 11;
        }
        player.weapons = [];
        tutorialText[currTutorialMessage].time = stateSwitchTimer;
        tutorialText[currTutorialMessage].thing();
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
        currTutorialMessage = /*tutorialText[53].funnyThing > ? 35: tutorialText[53].funnyThing*/35;
        tutorialText[currTutorialMessage].time = stateSwitchTimer;
        tutorialText[currTutorialMessage].thing();
    }} 
];
var drawTutorial = function() {
    if(drawTutorial.disappearAnim < 90 || ((gameState !== "mainMenu" && !updateGame.transitionTimer && tutorial) || (upgradeScreen.payTaxes && upgradeScreen.loseTimer < 120))) {
        if(tutorial || (upgradeScreen.payTaxes && !upgradeScreen.loseTimer)) {
            drawTutorial.disappearAnim = 0;
        }
        else {
            drawTutorial.disappearAnim ++;
        }

        ctx.strokeStyle = "black";
        ctx.lineWidth = h100;
        var t = gameState === "playing"? limit(stateSwitchTimer / 30, 0, 1): 1;
        var width = easings.easeInOutQuad(t) * (canvas.width / 2 - 4 * h100);
        width *= (1 - easings.easeInOutQuad(limit(drawTutorial.disappearAnim / 30-2, 0, 1)));//disappear anim
        var yPos = (easings.easeOutBack(t) - 1) * canvas.height;
        var lastThing = tutorial? stateSwitchTimer - tutorialText[currTutorialMessage].time: stateSwitchTimer;
        lastThing = isNaN(lastThing)? 200: lastThing;
        yPos += h100 * 73 + Math.sin(limit(lastThing, 0, 5) / 5 * Math.PI) * h100 * 3;

        if(stateSwitchTimer > 30 || gameState !== "playing") {
            t = gameState === "playing"? limit((stateSwitchTimer - 10)/60, 0, 1): 1;
            var gooberY = h100 * 46 + (1-easings.easeInOutQuad(t)) * h100 * 54;
            gooberY += easings.easeInQuart(limit(drawTutorial.disappearAnim / 30 - 1, 0, 1)) * h100 * 54;//disappear
            ctx.save();
            ctx.beginPath();
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

        ctx.save();
        ctx.beginPath();
        ctx.rect(h100 * 2, yPos, width, canvas.height / 4);
        ctx.clip();
        
        if(stateSwitchTimer > 30 || gameState !== "playing") {
            ctx.fillStyle = "black";
            var currLine = "";
            var lineIdx = 0;
            let winMessages = [
                "Hello, I like money.",//this one actually appears last
                "So we meet again. \n Pay your rent and you can have another one of my things!",
                "Rent. Now.",
                "Where's my money, lowly peon?",
                "Gimmie money  $$$$$$",
                "It appears you owe me an amount of funds.",
                "Gimmie my " + (playerStuff.requiredRent+playerStuff.debt) + " dollars! NOW!",
                "$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$",
                "I'm letting you off the hook this time... just kidding. PAY RENT",
                "MONEY OR DIE!!!!",
                "It would be greatly appreciated for thou to hand over a value of gold.",
                "I'm T-posing to assert dominance, you just can't see it right now.",
                "Money time",
                "How have you survived so long? Oh well, increasing your rent again.",
            ];
            let winMessage = winMessages[playerStuff.totalRentCycles % winMessages.length];
            var words = (tutorial? tutorialText[currTutorialMessage].txt: playerStuff.roundsLeft === 0? playerStuff.coins < 0? "You don't have your rent? Shame. Get out!": winMessage: upgradeScreen.payTaxes? "Thanks bye~": "I'LL BE BACK.").split(" ");

            words.push("\n");//to make sure it draws the last line
            ctx.font = 5 * h100 + "px pixelFontSmall";
            ctx.textAlign = "left";
            ctx.textBaseline = "hanging";
            for(var i = 0; i < words.length; i ++) {
                if(words[i] === "\n" || ctx.measureText(currLine + words[i]).width > canvas.width/2-8*h100) {
                    ctx.fillText(currLine, h100 * 4, yPos + h100 * 2 + h100 * 5 * lineIdx);
                    lineIdx ++;
                    currLine = "";
                }
                if(words[i] !== "\n") {
                    currLine += words[i] + " ";
                }
            }
            if(tutorialText[currTutorialMessage].criteria? tutorialText[currTutorialMessage].criteria(): justPressed["enter"]) {
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

        ctx.restore();
    }
};
drawTutorial.disappearAnim = 120;

var optionsMenu = {
    isInOptions: false,
    currScreen: "main",
    run: function() {
        for(var i = 0; i < pauseSettingsEl.children.length; i ++) {
            var shouldShow = this.isInOptions && pauseSettingsEl.children[i].id === "pauseSettings-" + this.currScreen;
            if(shouldShow !== (pauseSettingsEl.children[i].style.visibility === "visible")) {
                pauseSettingsEl.children[i].style.visibility = shouldShow? "visible": "hidden";
            }
        }
        if(!this.isInOptions) return;
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
                //hide all the stuff
                for(var i = 0; i < pauseSettingsEl.children.length; i ++) {
                    pauseSettingsEl.children[i].style.visibility = "hidden";
                }
            }
            else {
                this.currScreen = "main";
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


var drawEnemyDict = function() {
    ctx.save();
    ctx.imageSmoothingEnabled = true;//for now
    /*
    ctx.fillStyle = "rgb(255,250,230)";
    ctx.fillRect(0,0,canvas.width,canvas.height);
    */
    ctx.translate(w100*5,w100*5*9/16);
    ctx.scale(0.9, 0.9);
    ctx.fillStyle = drawEnemyDict.funnyGradient;

    function tempDrawImg(img,x, y, w, h) {
        ctx.save();
        ctx.fillStyle = "rgb(255,250,230)";
        ctx.fillRect(x,y-canvas.height/2,w,h+canvas.height);
        ctx.restore();
        ctx.drawImage(img,x, y, w, h);
    }

    if(drawEnemyDict.pageAnim) {
        var page1 = assets["enemyDict-"+drawEnemyDict.currPage];
        var page2 = assets["enemyDict-"+(drawEnemyDict.currPage + 1)];

        //draw page 1 left half
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, -canvas.height/2, canvas.width / 2, canvas.height*2);
        ctx.clip();
        tempDrawImg(page1, 0, 0, canvas.width, canvas.height);
        ctx.restore();

        //draw page 2 right half
        ctx.save();
        ctx.beginPath();
        ctx.rect(canvas.width / 2, -canvas.height/2, canvas.width / 2, canvas.height*2);
        ctx.clip();
        tempDrawImg(page2, 0, 0, canvas.width, canvas.height);
        ctx.restore();
        
        //shadow
        ctx.fillRect(0, -canvas.height/2, canvas.width, canvas.height*2);

        //draw moving page
        var moveAmt = easings.easeInOutQuad(drawEnemyDict.pageAnim / 13);
        if(drawEnemyDict.flipDir === -1) moveAmt = 1-moveAmt;
        if(moveAmt < 0.5) {
            //draw right side of page 1 on right side but scaled horizontally
            ctx.save();
            ctx.translate(canvas.width / 2, 0);
            ctx.scale((0.5-moveAmt) * 2, 1);
            ctx.beginPath();
            ctx.rect(0, -canvas.height/2, canvas.width / 2, canvas.height*2);
            ctx.clip();
            
            tempDrawImg(page1, -canvas.width / 2, 0, canvas.width, canvas.height);
            ctx.translate(-canvas.width/2, 0);

            ctx.fillRect(canvas.width/2, -canvas.height/2, canvas.width/2, canvas.height*2);
            ctx.restore();
        }
        else {
            //draw left side of page 2 on left side but scaled horizontally
            ctx.save();
            ctx.translate(canvas.width / 2, 0);
            ctx.scale((moveAmt-0.5) * 2, 1);
            ctx.beginPath();
            ctx.rect(-canvas.width/2, -canvas.height/2, canvas.width / 2, canvas.height*2);
            ctx.clip();
            tempDrawImg(page2, -canvas.width / 2, 0, canvas.width, canvas.height);
            
            ctx.translate(-canvas.width/2, 0);
            ctx.fillRect(0, -canvas.height/2, canvas.width/2, canvas.height*2);
            ctx.restore();
        }

        ctx.lineWidth = h100;
        ctx.strokeStyle = "black";
        ctx.beginPath();
        ctx.moveTo((0.5-moveAmt)*canvas.width+canvas.width/2, 0);
        ctx.lineTo((0.5-moveAmt)*canvas.width+canvas.width/2, canvas.height);
        ctx.stroke();

        //add to timer
        drawEnemyDict.pageAnim ++;
        if(drawEnemyDict.pageAnim >= 13) {
            drawEnemyDict.pageAnim = 0;//finish anim
            if(drawEnemyDict.flipDir === 1) {//if ya goin' right
                drawEnemyDict.currPage ++;
            }
        }
    }
    else {
        tempDrawImg(assets["enemyDict-"+drawEnemyDict.currPage], 0, 0, canvas.width, canvas.height);

        ctx.fillRect(0, -canvas.height/2, canvas.width, canvas.height*2);
    }

    ctx.restore();

    ctx.drawImage(assets.enemyDictBook, 0, 0, canvas.width, canvas.height);

    drawEnemyDict.leaveButton.go();
    if(drawEnemyDict.leaveButton.pressed) {
        drawEnemyDict.pageAnim = 0;
        enemyDict = false;
    }
    else if(!drawEnemyDict.pageAnim) {
        //detect flipping
        if((getInput(playerStuff.controls.Right) || mouse.justPressed && mouse.x > canvas.width * 2/3) && drawEnemyDict.currPage < enemyDictLength - 1) {
            drawEnemyDict.pageAnim = 1;
            drawEnemyDict.flipDir = 1;
        }
        else if((getInput(playerStuff.controls.Left) || mouse.justPressed && mouse.x < canvas.width/3) && drawEnemyDict.currPage > 0) {
            drawEnemyDict.pageAnim = 1;
            drawEnemyDict.currPage --;
            drawEnemyDict.flipDir = -1;
        }
    }
};
drawEnemyDict.leaveButton = new Button(w100 * 5, h100 * 87, h100 * 20, h100 * 7, "Leave", "rgb(186, 186, 1)");
drawEnemyDict.currPage = 0;
drawEnemyDict.pageAnim = 0;
drawEnemyDict.flipDir = 0;
drawEnemyDict.funnyGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
drawEnemyDict.funnyGradient.addColorStop(0,  "rgba(0,0,0, 0)");
drawEnemyDict.funnyGradient.addColorStop(0.45,  "rgba(0,0,0, 0)");
drawEnemyDict.funnyGradient.addColorStop(0.49,  "rgba(0,0,0, 0.3)");
drawEnemyDict.funnyGradient.addColorStop(0.5,     "rgba(0,0,0, 0.8)");
drawEnemyDict.funnyGradient.addColorStop(0.51,  "rgba(0,0,0, 0.3)");
drawEnemyDict.funnyGradient.addColorStop(0.71,  "rgba(0,0,0, 0)");
drawEnemyDict.funnyGradient.addColorStop(1,     "rgba(0,0,0, 0)");