var playerStuff = {
    weapons: [],
    controls: {
        Up: "w",
        Down: "s",
        Left: "a",
        Right: "d",
        Dash: "shift",
        Bow: "mouseLeft",
        Mace: "mouseRight",
        Shield: "space",
    },
    changeControl: function(control, newVal) {
        this.controls[control] = newVal;
    },
    coins: 6,
    totalRentCycles: -1,
    requiredRent: 1,
    roundsLeft: 3,
    debt: 0,
    stats: {
        canDash: false,
        speed: 1,
        shields: 0,
        shieldLength:30,
        parryLength:10,
        parryDamageRadius:3,
        shieldIframes:60,
        shieldCooldown: 60
    }
}
var defaultPlayerStuff = JSON.parse(JSON.stringify(playerStuff));
if(tutorial) {
    playerStuff.coins = 0;
    playerStuff.roundsLeft = 4;
}
var bob = pauseSettingsEl.querySelector("#pauseSettings-keybinds");
for(let i in playerStuff.controls) {
    let span = document.createElement("span");
    span.innerHTML = i + `:<br><input type = 'text' onchange = 'playerStuff.changeControl(this.name,this.value)' name = '${i}' value = '${playerStuff.controls[i]}'>`;
    bob.appendChild(span);
}
class Player {
    static spriteSize = 18
    static walkAnimSpeed = 8 //5 frames per walk cycle
    constructor() {
        this.pos = new Vect(0, 0);
        this.vel = new Vect(0, 0);
        this.controls = playerStuff.controls;
        this.projectiles = [];
        this.weapons = tutorial? []: playerStuff.weapons;
        this.walkAnim = 0;
        this.dir = new Vect();
        this.size = 2.25;//kinda like a radius
        this.stun = 0;
        this.shields = playerStuff.stats.shields;
        this.shieldTimer = 0;
        this.brokenShieldTimer = 0;
        this.shieldCooldown = 0;
        this.iframes = 60;
        this.speedMult = 1;
        this.exploding = 0;
        this.explodeThing = null;
        
        this.dashTimer = 0;
        this.dashReload = 0;
    }

    display() {
        var pos = cam.toScreen(this.pos);
        
        if(!this.exploding) {
            for(var i = 0; i < this.weapons.length; i ++) {
                this.weapons[i].display();
            }

            for(var i = 0; i < this.projectiles.length; i ++) {
                this.projectiles[i].display();
            }
        }

        if(this.exploding < 30) {
            var walkCycle = Math.floor(this.walkAnim / Player.walkAnimSpeed) % 4;

            var tilesheetPos = getTilesheetPos(walkCycle, this.dir);
            Enemy.drawImage(
                assets.player,
                tilesheetPos.x * Player.spriteSize,
                tilesheetPos.y * Player.spriteSize,
                Player.spriteSize,
                Player.spriteSize,
                pos.x - cam.scale * 4,
                pos.y - cam.scale * 4,
                cam.scale * 8,
                cam.scale * 8, (this.exploding||this.iframes%20>10||this.dashTimer)? NaN: 0
            );
            if(this.shieldTimer && !this.exploding){
                if(playerStuff.stats.shieldLength - this.shieldTimer < playerStuff.stats.parryLength) {
                    ctx.filter = "brightness(250%)";
                }
                ctx.drawImage(
                    assets.shield,
                    0,0,
                    Player.spriteSize,
                    Player.spriteSize,
                    pos.x - cam.scale * 4,
                    pos.y - cam.scale * 4,
                    cam.scale * 8,
                    cam.scale * 8,
                );
                ctx.filter = "none";
            }else if(this.brokenShieldTimer){
                var t = 1 - this.brokenShieldTimer / playerStuff.stats.shieldCooldown;
                ctx.filter = `opacity(${(1-easings.easeInOutQuad(t))*100}%)`;
                ctx.drawImage(
                    assets.shield,
                    Player.spriteSize,0,
                    Player.spriteSize,
                    Player.spriteSize,
                    pos.x - cam.scale * 4,
                    pos.y - cam.scale * 4,
                    cam.scale * 8,
                    cam.scale * 8
                );
                ctx.filter = "none";
            }
        }

        if(this.explodeThing && this.exploding < 130) {
            ctx.save();
            ctx.globalAlpha = 1-easings.easeInOutQuad((this.exploding % 10) / 10);
            ctx.translate(pos.x, pos.y);
            ctx.rotate(this.explodeThing.rot);
            ctx.scale(cam.scale, cam.scale);
            ctx.drawImage(this.explodeThing.sprite, -120, -120, 240, 240);
            ctx.restore();
        }
    }

    update() {
        var input = new Vect(
            getInput(this.controls.Right) - getInput(this.controls.Left),
            getInput(this.controls.Down ) - getInput(this.controls.Up  )
        );
        if(this.exploding) {
            this.exploding ++;
            if(this.exploding >= 30 && this.exploding % 10 === 0 && this.exploding <= 120) {
                soundEffects.finalKill.play();
                this.explodeThing = {
                    sprite: assets["explode" + Math.floor(Math.random()*3+1)],
                    rot: Math.random() * Math.PI * 2
                };
            }
            
            if(this.exploding > 185) {
                switchState("gamble");
            }
            
            input.mult(0);
        }
        if(input.x || input.y) {
            this.dir.set(input);
            //you're moving so increase walkanim
            this.walkAnim ++;
            if(input.x && input.y) {
                //normalization but faster because we know all the posibilties
                input.div(1.4142);
            }
            if(getInput(this.controls.Dash, true) && playerStuff.stats.canDash && !this.dashReload) {
                this.dashTimer ++;
                this.vel.set(Vect.mult(input, 2));
            }
        }
        else {
            this.walkAnim = 0;
        }
        if(this.dashTimer) {
            this.dashTimer ++;
            this.vel.mult(0.95);
            if(this.dashTimer > 20) {
                this.vel.mult(0.2);
                this.dashTimer = 0;
                this.dashReload = 40;
            }
        }
        else if(this.stun > 0) {
            this.stun --;
            this.vel.mult(0.9);
        }
        else {
            this.vel.mult(0.5);
            this.vel.add(Vect.mult(input, 0.3 * this.speedMult * playerStuff.stats.speed));
        }
        this.pos.add(this.vel);

        this.pos.x = limit(this.pos.x, -l2.x + this.size, l2.x - this.size);
        this.pos.y = limit(this.pos.y, -l2.y - this.size, l2.y - this.size);

        for(var i = 0; i < enemies.length; i ++) {
            if(enemies[i].collisions && !enemies[i].iframes && sqrDist(this.pos.x, this.pos.y, enemies[i].pos.x, enemies[i].pos.y) < (this.size + enemies[i].size) * (this.size + enemies[i].size)) {
                //collision
                //ya' die
                this.damage();
            }
        }

        if(this.iframes>0){
            this.iframes--;//if rames
        }
        if(this.shieldTimer>0){
            this.shieldTimer--;
            if(this.shieldTimer <= 0) {
                //nothing happened
                this.shieldCooldown = playerStuff.stats.shieldCooldown / 2;
            }
        }else if(getInput(player.controls.Shield,true)&&this.shields>=1&&this.shieldCooldown===0){
            this.shieldTimer = playerStuff.stats.shieldLength;
            soundEffects.shieldUse.play();
        }
        if(this.brokenShieldTimer>0){
            this.brokenShieldTimer--;
        }
        if(this.shieldCooldown>0){
            this.shieldCooldown--;
        }
        this.dashReload = Math.max(0, this.dashReload - 1);


        this.speedMult = 1;//aah

        //weapon uupdating
        for(var i = 0; i < this.weapons.length; i ++) {
            this.weapons[i].update();
        }

        for(var i = 0; i < this.projectiles.length; i ++) {
            this.projectiles[i].update();
            if(this.projectiles[i].dead) {
                this.projectiles.splice(i, 1);
            }
        }
    }
    damage() {
        if(this.iframes){
            return;
        }

        if(this.shieldTimer!==0){
            if(playerStuff.stats.shieldLength-this.shieldTimer<playerStuff.stats.parryLength){
                //parry
                for(var i = 0; i < enemies.length; i ++) {
                    if(sqrDist(enemies[i].pos.x,enemies[i].pos.y,this.pos.x,this.pos.y)<(playerStuff.stats.parryDamageRadius+enemies[i].size)*(playerStuff.stats.parryDamageRadius+enemies[i].size)){
                        enemies[i].damage(1);
                    }
                }
                this.shieldTimer = 0;
                this.iframes+=playerStuff.stats.shieldIframes;
                this.shieldCooldown = playerStuff.stats.shieldCooldown;
                soundEffects.parry.play();
                return;
            }
            //sheld brek
            soundEffects.shieldBreak.play();
            this.shields--;
            this.iframes+=playerStuff.stats.shieldIframes;
            this.shieldTimer = 0;
            this.brokenShieldTimer = playerStuff.stats.shieldCooldown;
            this.shieldCooldown = playerStuff.stats.shieldCooldown;
            return;
        }
        coins = [];
        music.playing.pause();
        soundEffects.finalKill.play();
        for(var i = 0; i < enemies.length; i ++) {
            enemies[i].dead = true;
        }
        roundEnemies = []
        if(tutorial) {
            currTutorialMessage = 41;
            tutorialText[currTutorialMessage].time = stateSwitchTimer;
        }
        else {
            this.exploding = 1;
        }
    }
    resetWeapons(){
        for(var i =0;i<playerStuff.weapons.length;i++){
            playerStuff.weapons[i].reset();
        }
    }
};
var player;