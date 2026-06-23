var playerStuff = {
    weapons: [weapons.sword],
    controls: {
        Up: "w",
        Down: "s",
        Left: "a",
        Right: "d",
        Bow: "mouseLeft",
        Mace: "mouseRight"
    },
    changeControl: function(control, newVal) {
        this.controls[control] = newVal;
    },
    coins: tutorial? 0: 2,
    requiredRent: 1,
    roundsLeft: 1
}
var bob = pauseSettingsEl.querySelector("#pauseSettings-keybinds");
for(let i in playerStuff.controls) {
    let span = document.createElement("span");
    span.innerHTML = i + `:<br><input type = 'text' onchange = 'playerStuff.changeControl(this.name,this.value)' name = '${i}' value = '${playerStuff.controls[i]}'>`;
    bob.appendChild(span);
}
console.log(bob);
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
        this.iframes = 0;
        this.speedMult = 1;
        this.exploding = 0;
        this.explodeThing = null;
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
                cam.scale * 8, (this.exploding||this.iframes%20>10)? NaN: 0
            );
        }

        if(this.explodeThing && this.exploding < 130) {
            ctx.save();
            ctx.globalAlpha = 1-easings.easeInOutQuad((this.exploding % 10) / 10);
            ctx.translate(pos.x, pos.y);
            ctx.rotate(this.explodeThing.rot);
            ctx.scale(cam.scale, cam.scale);
            ctx.drawImage(this.explodeThing.sprite, -80, -80, 160, 160);
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
        }
        else {
            this.walkAnim = 0;
        }
        if(this.stun > 0) {
            this.stun --;
            this.vel.mult(0.9);
        }
        else {
            this.vel.mult(0.5);
            this.vel.add(Vect.mult(input, 0.3 * this.speedMult));
        }
        if(this.iframes>0){
            this.iframes--;
        }
        this.pos.add(this.vel);

        this.pos.x = limit(this.pos.x, -l2.x + this.size, l2.x - this.size);
        this.pos.y = limit(this.pos.y, -l2.y - this.size, l2.y - this.size);

        for(var i = 0; i < enemies.length; i ++) {
            if(enemies[i].collisions && sqrDist(this.pos.x, this.pos.y, enemies[i].pos.x, enemies[i].pos.y) < (this.size + enemies[i].size) * (this.size + enemies[i].size)) {
                //collision
                //ya' die
                this.damage();
            }
        }


        this.speedMult = 1;//aah

        //weepon spooping
        /*
        if(justPressed[this.controls.Switch] && this.weapons.length) {
            this.selectedWeapon = (this.selectedWeapon + 1) % this.weapons.length;
        }
        */
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
        music.playing.pause();
        soundEffects.finalKill.play();
        for(var i = 0; i < enemies.length; i ++) {
            enemies[i].dead = true;
        }
        roundEnemies = []
        if(tutorial) {
            currTutorialMessage = 33;
            tutorialText[currTutorialMessage].time = stateSwitchTimer;
        }
        else {
            this.exploding = 1;
        }
    }
    resetWeapons(){
        for(var i =0;i<playerStuff.length;i++){
            playerStuff[i].reset();
        }
    }
};
var player;