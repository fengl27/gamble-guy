
const weapons = {
    sword: {
        dir: Math.random() * Math.PI * 2,
        dirVel: 0.15,
        stats:{
            size:10,
            dirVel:0.15,
            damage:1,
            isLaser:false,
            isGreatSword:false,
        },
        upgrades:[],
        update: function() {
            var movement = (!getInput(player.controls.Bow) && !getInput(player.controls.Mace))? this.stats.dirVel: 0.02;
            this.dirVel += (movement - this.dirVel) / 10;
            this.dir += this.dirVel;

            let cPoss = [
                new Vect(player.pos.x + Math.cos(this.dir) * this.stats.size, player.pos.y + Math.sin(this.dir) * this.stats.size),
                new Vect(player.pos.x + Math.cos(this.dir) * this.stats.size / 2, player.pos.y + Math.sin(this.dir) * this.stats.size / 2),
            ];
            for(var j = 0; j < cPoss.length; j ++) {
                let cPos = cPoss[j];
                for(var i = 0; i < enemies.length; i ++) {
                    if(!enemies[i].iframes && !enemies[i].invincible && sqrDist(cPos.x, cPos.y, enemies[i].pos.x, enemies[i].pos.y) < (this.stats.size/3 + enemies[i].size)*((this.stats.size/3 + enemies[i].size))) {
                        //collide (they die)
                        if(enemies[i].type === Enemy.dagger) {
                            continue;//don't or else it would be kinda op
                        }
                        if(enemies[i].damage(this.stats.damage) !== false) {
                            soundEffects.sword.play();
                        }
                    }
                }
            }
        },
        display: function() {
            //basically copied from enemy.js
            var pos = cam.toScreen(player.pos);
            ctx.save();
            ctx.translate(pos.x, pos.y);
            ctx.rotate(this.dir + Math.PI / 2);///it points up so im in pain

            var opacity = limit(this.swordTimer - 20, 0, 20) / 20;
            ctx.globalAlpha = 1-easings.easeOutQuad(opacity);
            let spriteId = this.stats.isGreatSword?(this.stats.isLaser?7:6):(this.stats.isLaser?5:2)
            let args = [assets.weapons, Player.spriteSize * spriteId, 0, Player.spriteSize, Player.spriteSize,
                    -this.stats.size / 2 * cam.scale, -cam.scale * 3 - this.stats.size * cam.scale,
                    this.stats.size * cam.scale, this.stats.size * cam.scale
            ];
            ctx.drawImage(...args);

            ctx.restore();
            /*
            let cPoss = [
                new Vect(player.pos.x + Math.cos(this.dir) * this.stats.size, player.pos.y + Math.sin(this.dir) * this.stats.size),
                new Vect(player.pos.x + Math.cos(this.dir) * this.stats.size / 2, player.pos.y + Math.sin(this.dir) * this.stats.size / 2),
            ];
            
            ctx.fillStyle = "rgba(0, 255, 0, 0.5)";
            for(var i = 0; i < cPoss.length; i ++) {
                var bob = cam.toScreen(cPoss[i]);
                ctx.beginPath();
                ctx.arc(bob.x, bob.y, this.stats.size/3*cam.scale, 0, Math.PI * 2);
                ctx.fill();
            }
                */
            
        },
        reset: function(){
            this.dir = Math.random() * Math.PI * 2
        }
    },
    throwMace:{
        pos: new Vect(),
        vel: new Vect(),
        nodePos: new Vect(),
        stats: {
            chargeSpeed: 1,
            size:3.5,
            playerSlow:0.3,
            damage:2,
            maxCharge:6,
            weightPercentage:0.2,
            pullStrength:0,
            isPillow:false,
            isHammer:false,
        },
        thrown: false,
        charge: 0,
        dir:0,
        upgrades:[],
        update: function() {
            let weightPercentage = limit(this.stats.weightPercentage, 0, 1);
            this.dir -= this.charge/12;
            let thrown = !getInput(player.controls.Mace, false)&&this.charge;
            if(getInput(player.controls.Mace, false)&&!this.thrown){
                player.speedMult = Math.min(player.speedMult,this.stats.playerSlow);
                this.charge=Math.min(this.stats.maxCharge,this.charge+this.stats.chargeSpeed*(this.charge<3?0.1:((this.stats.maxCharge-this.charge)/60+0.01)));
                cam.targetScale += this.charge * h100 / this.stats.maxCharge / 6;
            }
            if(!this.thrown&&thrown){
                this.thrown = true;
                mousePos = cam.toGlobal(mouse);
                offset = Vect.sub(mousePos,player.pos);
                offset = Vect.normalize(offset);
                this.vel.set(Vect.mult(offset,this.charge+1));
                this.pos.set(player.pos);
                this.charge = 0;
                screenshake.shake(5, this.vel.x, this.vel.y);
            }
            if(this.thrown && getInput(player.controls.Mace,false)){
                //pull the mace closer
                offset = Vect.sub(this.pos,player.pos);
                offset.normalize();
                this.vel.sub(Vect.mult(offset,this.stats.pullStrength*(1-this.stats.weightPercentage)));
            }
            let velMag = this.vel.mag();
            let sqrDistToPlayer = sqrDist(this.pos.x,this.pos.y,player.pos.x,player.pos.y);
            if(this.thrown&&sqrDist(this.pos.x,this.pos.y,player.pos.x,player.pos.y)<(this.stats.size+player.size)*(this.stats.size+player.size)&&velMag<1.1){
                this.thrown = false;
            }
            
            if(Math.abs(this.pos.x) > l2.x - 1.5) {
                //horizontal collision
                this.vel.x *= -1;
                screenshake.shake(5, this.vel.x, this.vel.y);
                this.pos.x = Math.sign(this.pos.x) * (l2.x - 1.5)           ;
                soundEffects.bounce.play();
            }
            if(Math.abs(this.pos.y) > l2.y - 1.5) {
                //walls but vertical my not beloved </3
                this.vel.y *= -1;
                screenshake.shake(5, this.vel.x, this.vel.y);
                this.pos.y = Math.sign(this.pos.y) * (l2.y - 1.5);
                soundEffects.bounce.play();
            }
            if(sqrDistToPlayer>400&&this.thrown){
                //pull the player
                var dst = Math.sqrt(sqrDistToPlayer);
                let wantedMag = 20 - dst;
                let force = Vect.mult(Vect.sub(this.pos,player.pos),wantedMag / dst);
                player.vel.sub(Vect.mult(force,1-weightPercentage));
                this.vel.add(Vect.mult(force,weightPercentage));
            }
            
            if(this.thrown){
                if(sqrDistToPlayer>400 || (getInput(player.controls.Mace,false)&&this.stats.pullStrength)){
                    this.nodePos.add(Vect.div(Vect.sub(Vect.lerp(this.pos,player.pos,0.5), this.nodePos), 3));
                }else{
                    for(var i = 0; i < 5; i ++) {
                        var dst = dist(this.nodePos.x,this.nodePos.y,player.pos.x,player.pos.y);

                        let wantedMag = 10 - dst;
                        let force = Vect.mult(Vect.sub(this.nodePos,player.pos),wantedMag / dst);
                        this.nodePos.add(Vect.mult(force, 0.3));

                        dst = dist(this.nodePos.x,this.nodePos.y,this.pos.x,this.pos.y);

                        wantedMag = 10 - dst;
                        force = Vect.mult(Vect.sub(this.nodePos,this.pos),wantedMag / dst);
                        this.nodePos.add(Vect.mult(force, 0.3));
                    }
                }
            }
            this.pos.add(this.vel);
            this.vel.mult(0.95);
            var cPoss = []
            if(this.charge===0){
                cPoss.push(this.pos);
            }else{
                let radius = (this.charge+this.stats.size)*2/3;
                cPoss.push(new Vect(player.pos.x + Math.cos(this.dir)*radius, player.pos.y + Math.sin(this.dir)*radius));
            }
            
            for(var j = 0; j < cPoss.length; j ++) {
                let cPos = cPoss[j];

                for(var i = 0; i < enemies.length; i ++) {
                    if((!enemies[i].iframes||velMag<1.1) && sqrDist(cPos.x, cPos.y, enemies[i].pos.x, enemies[i].pos.y) < (this.stats.size/2 + enemies[i].size)*(this.stats.size/2 + enemies[i].size)) {
                        //collide (they die)
                        if((enemies[i].type === Enemy.arrow && !this.thrown) || enemies[i].type === Enemy.dagger) {
                            continue;//don't or else it would be kinda op
                        }
                        if(velMag>1.1||this.charge>1){
                            screenshake.shake(15, this.vel.x, this.vel.y);
                            enemies[i].damage(this.stats.damage-(this.charge>1?1:0));
                            soundEffects.sword.play();

                        }
                        if(this.charge === 0){
                            var toPlayer = Vect.normalize(Vect.sub(this.pos, player.pos));
                            if(Vect.dot(toPlayer, Vect.normalize(enemies[i].vel)) < 0.5) {
                                var dst = dist(cPos.x, cPos.y, enemies[i].pos.x, enemies[i].pos.y);
                                let wantedMag = (this.stats.size+enemies[i].size) - dst;

                                enemies[i].vel.sub(Vect.mult(Vect.sub(this.pos,enemies[i].pos),wantedMag / dst));
                                enemies[i].vel.add(Vect.mult(this.vel, 6));
                                enemies[i].vel.mult(0.7);//slow down a little
                            }
                        }
                    }
                }
            }

        },
        display: function() {
            let weightPercentage = limit(this.stats.weightPercentage, 0, 1);
            //basically copied from enemy.js
            var pos = cam.toScreen(this.pos);
            var nodePos = cam.toScreen(this.nodePos);
            var playerPos = cam.toScreen(player.pos);
            var toMouse = Vect.sub(mouse,playerPos  );
            var opacity = limit(this.swordTimer - 20, 0, 20) / 20;
            ctx.globalAlpha = 1-easings.easeOutQuad(opacity);
            let spriteId = this.stats.isHammer?(this.stats.isPillow?10:8):(this.stats.isPillow?9:4);

            let args = [assets.weapons, Player.spriteSize * spriteId, 0, Player.spriteSize, Player.spriteSize,
                    -this.stats.size * cam.scale*1.5+pos.x, -this.stats.size*1.5 * cam.scale+pos.y,
                    this.stats.size * cam.scale*3, this.stats.size * cam.scale*3
            ];
            if(!this.thrown && this.charge!==0){
                //big mac

                ctx.save();
                ctx.translate(playerPos.x, playerPos.y);
                ctx.rotate(this.dir + Math.PI / 2);///it points up so im in pain
                
                ctx.drawImage(
                    assets.weapons, Player.spriteSize * spriteId, 0, Player.spriteSize, Player.spriteSize,
                    -this.stats.size * cam.scale*1.5, -cam.scale * 1.5 - this.charge * cam.scale*2/3 -this.stats.size*cam.scale*4/3,
                    this.stats.size * cam.scale*3, this.stats.size * cam.scale*3
                );
                ctx.restore();
                if(this.charge>0){
                    ctx.save();
                    ctx.translate(playerPos.x, playerPos.y);
                    ctx.rotate(Math.atan2(toMouse.y,toMouse.x));

                    let things = [
                        {p: 0, v: 0},
                        {p: 0, v: this.charge+1}
                    ];

                    for(var i = 0; i < 60; i ++) {
                        things[1].p += things[1].v;
                        things[1].v *= 0.95;
                        things[0].v *= 0.5;
                        things[0].p += things[0].v;
                        if(Math.abs(things[1].p - things[0].p) > 20) {
                            var dst = Math.abs(things[1].p - things[0].p);
                            let wantedMag = 20 - dst;
                            things[0].v -= wantedMag * (1-weightPercentage);
                            things[1].v += wantedMag * weightPercentage;
                        }
                    }

                    if(this.charge>1){
                        ctx.fillStyle = "rgba(0, 255, 125, 0.15)";//real transparent red (not clickbait)
                        ctx.fillRect(-cam.scale * 1.5, -cam.scale * 1.5, cam.scale * (things[0].p + 1.5), 3 * cam.scale);
                    }
                    ctx.fillStyle = "rgba(255, 0, 0, 0.15)";//real transparent red (not clickbait)
                    ctx.fillRect(-cam.scale * 1+ cam.scale * (things[0].p + 1.5), -cam.scale * 1,(things[1].p-things[0].p+1.5)*cam.scale, 2 * cam.scale);

                    ctx.restore();
                }
                
                /*
                ctx.fillStyle = "red";
                let cPos = cam.toScreen(new Vect(player.pos.x + Math.cos(this.dir) * (this.charge+this.stats.size), player.pos.y + Math.sin(this.dir) * (this.charge+this.stats.size)));
                ctx.beginPath();
                ctx.arc(cPos.x, cPos.y, this.stats.size * cam.scale, 0, Math.PI * 2);
                ctx.fill();
                */
            }//
            else if(this.thrown) {
                //chain of doom
                ctx.beginPath();
                ctx.moveTo(pos.x, pos.y);
                var lastPoint = Vect.get(pos);
                for(var i = 0; i <= 1; i += 0.01) {
                    let p1 = Vect.lerp(pos, nodePos, i);
                    let p2 = Vect.lerp(nodePos, playerPos, i);
                    let p = Vect.lerp(p1, p2, i);
                    
                    if(sqrDist(p.x, p.y, lastPoint.x, lastPoint.y) > cam.scale * cam.scale * 9 || i + 0.01 > 1) {
                        ctx.save();
                        ctx.translate(lastPoint.x, lastPoint.y);
                        ctx.rotate(Math.atan2(p.y - lastPoint.y, p.x - lastPoint.x));
                        ctx.drawImage(assets.chain, -cam.scale / 2, -cam.scale * 2, cam.scale * 3.5, cam.scale * 4);
                        //ctx.fillRect(-2, -2, cam.scale * 3 + 4, 4);
                        ctx.restore();
                        lastPoint.set(p);
                    }
                }
                //mace of dom
                ctx.drawImage(...args);
                /*
                ctx.fillStyle = "red";
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, this.stats.size * cam.scale, 0, Math.PI * 2);
                ctx.fill();
                */
            }
        },
        reset:function() {
            this.charge = 0;
            this.pos = new Vect();
            this.vel = new Vect();
            this.thrown = false;
        }
    },
    arrow: function(p, v, isMaxCharge) {
        this.deathTimer = 0;
        this.pos = p;
        this.vel = v;
        this.isMaxCharge = isMaxCharge;
    },
    bow: {
        dir: Math.random() * Math.PI * 2,
        dirVel: 0,
        playerDst: 7,
        pullbackAmt: 0,
        pullbackVel: 0,
        chargeTimer: 0,
        chargeMult:1,
        stats:{
            sizeMult: 10,
            dirAccel:0.08,
            chargeMult: 1,
            chargeMax:40,
            chargeMin:10,
            maxChargeDmg:0,
            zoomAmount:0.25,
            playerSlow:0.5,
            aimSpeed:0.3,
            aimChargeSpeedReduction:1/6,
            mouseAiming: false
        },
        upgrades:[],
        update: function() {
            if(this.stats.mouseAiming){
                /*
                let aimVect = new Vect(Math.cos(this.dir),Math.sin(this.dir));
                let rotatedAimVect = new Vect(Math.sin(this.dir),-Math.cos(this.dir));
                let toMouse = Vect.sub(toScreen(mouse),player.pos.x);
                let mouseClockwise = Vect.dot(rotatedAimVect,toMouse)>0;
                this.dirVel += ((this.chargeTimer? 0: (mouseClockwise?1:-1)*this.stats.dirAccel) - this.dirVel) / 5;
                */
                let aimVect = new Vect(Math.cos(this.dir),Math.sin(this.dir));
                let toMouse = Vect.normalize(Vect.sub(cam.toGlobal(mouse),player.pos));
                let aimAmount = this.stats.aimSpeed*(this.chargeTimer? this.stats.aimChargeSpeedReduction: 1);
                this.dir = Math.atan2(toMouse.y * aimAmount + aimVect.y, toMouse.x * aimAmount + aimVect.x);
                this.dirVel = 0;
            }else{
                this.dirVel += ((this.chargeTimer? 0: -this.stats.dirAccel) - this.dirVel) / 5;
            }
            this.dir += this.dirVel;

            this.pullbackAmt += this.pullbackVel;
            this.pullbackVel *= 0.8;
            this.pullbackVel -= this.pullbackAmt * 0.3;

            if(getInput(player.controls.Bow, true) && !this.chargeTimer) {
                this.chargeTimer ++;
                soundEffects.arrowLoad.play();
            }
            else if(this.chargeTimer) {
                if(getInput(player.controls.Bow, false)) {
                    player.speedMult = Math.min(player.speedMult,this.stats.playerSlow);
                    this.chargeTimer = Math.min(this.chargeTimer + this.stats.chargeMult, this.stats.chargeMax);
                    this.pullbackAmt = -easings.easeInOutQuad(this.chargeTimer/this.stats.chargeMax) * 4;
                    cam.targetScale += this.chargeTimer / this.stats.chargeMax * h100 * this.stats.zoomAmount;
                }
                else {
                    //water bucket RELEASE
                    if(this.chargeTimer > this.stats.chargeMin) {
                        soundEffects.arrowLaunch.play();
                        this.pullbackVel = 0.6;
                        player.projectiles.push(new weapons.arrow(
                            Vect.add(
                                player.pos,
                                new Vect(
                                    Math.cos(this.dir) * this.playerDst,
                                    Math.sin(this.dir) * this.playerDst
                                )
                            ),
                            new Vect(
                                Math.cos(this.dir) * this.chargeTimer / this.stats.chargeMax * 3,
                                Math.sin(this.dir) * this.chargeTimer / this.stats.chargeMax * 3
                            ),
                            this.chargeTimer === this.chargeMax
                        ));
                    }
                    this.chargeTimer = 0;
                }
            }
        },
        display: function() {
            //basically copied from enemy.js
            var pos = cam.toScreen(player.pos);
            ctx.save();
            ctx.translate(pos.x, pos.y);
            ctx.rotate(this.dir);///it points right so im relieved of pain
            
            ctx.translate((this.playerDst + this.stats.sizeMult / 2 + this.pullbackAmt) * cam.scale, 0);
            var vibrationAmt = this.chargeTimer / this.stats.chargeMax * cam.scale/4;
            if(this.chargeTimer> this.stats.chargeMin){
                ctx.fillStyle = "rgba(255, 0, 0, 0.15)";//real transparent red (not clickbait)
                ctx.fillRect(cam.scale * 2, -cam.scale * 1.5, 150*cam.scale, 3 * cam.scale);
            }
            ctx.translate(lerp(-vibrationAmt, vibrationAmt, Math.random()), lerp(-vibrationAmt, vibrationAmt, Math.random()));
            ctx.scale(1 + easings.easeOutQuad(this.chargeTimer / this.stats.chargeMax) / 3, 1);

            ctx.globalAlpha = 1;

            let args = [assets.weapons, Player.spriteSize * (this.chargeTimer?1:0), 0, Player.spriteSize, Player.spriteSize,
                    -cam.scale * this.stats.sizeMult/2, -cam.scale * this.stats.sizeMult/2,
                    this.stats.sizeMult * cam.scale, this.stats.sizeMult * cam.scale
            ];
            
            if(this.chargeTimer===this.stats.chargeMax) {
                ctx.filter = "brightness(150%)";
            }
            ctx.drawImage(...args);
            ctx.filter = "none";

            ctx.restore();
            /*
            ctx.fillStyle = "red";
            if(this.swordTimer < 15) {
                ctx.beginPath();
                ctx.arc(pos.x + Math.cos(this.swordDir) * this.stats.size * cam.scale, pos.y + Math.sin(this.swordDir) * this.stats.size * cam.scale, cam.scale * 3, 0, Math.PI * 2);
                ctx.fill();
            }
            */
        },
        reset: function(){
            this.dir = Math.random() * Math.PI * 2,
            this.dirVel = 0;
            this.pullbackAmt = 0;
            this.pullbackVel = 0;
            this.chargeTimer = 0;
        }
    },
};
weapons.arrow.stats = {
    size:5,
    damage:1,
    isSpear:false,
};

weapons.arrow.prototype.display = function() {
    var pos = cam.toScreen(this.pos);
    ctx.save();
    ctx.translate(pos.x, pos.y);
    ctx.rotate(Math.atan2(this.vel.y, this.vel.x) + Math.sign(this.deathTimer) * Math.PI + Math.PI/2*weapons.arrow.stats.isSpear);
    ctx.scale(weapons.arrow.stats.size / 5, weapons.arrow.stats.size / 5);

    let opacity = 1 - this.deathTimer / 10;
    ctx.globalAlpha = opacity;
    if(weapons.arrow.stats.isSpear) {
        ctx.drawImage(
            assets.weapons,
            Player.spriteSize * 3 + 0.05, 0,
            Player.spriteSize * 0.9, Player.spriteSize,
            -cam.scale * 3, -cam.scale * 3,
            cam.scale * 6, cam.scale * 6
        );
    }
    else {
        ctx.drawImage(weapons.arrow.stats.isSpear?assets.spear:assets.arrow, -cam.scale * 5, -cam.scale * 3, cam.scale * 6, cam.scale * 6);
    }
    ctx.restore();
    /*
    ctx.fillStyle = "rgba(255, 0, 0, 0.1)";
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, cam.scale * weapons.arrow.stats.size, 0, Math.PI * 2);
    ctx.fill();
    */
};
weapons.arrow.prototype.update = function() {
    if(this.deathTimer > 0) {
        this.deathTimer ++;
        this.vel.y += 0.05;
        this.pos.add(this.vel);
        if(this.deathTimer > 10) {
            this.dead = true;
        }
        return;
    }
    
    if(Math.abs(this.pos.x) > l2.x - 1 || Math.abs(this.pos.y) > l2.y - 1) {//small hitbox for only walls
        //die
        this.deathTimer ++;
        this.pos.sub(Vect.mult(this.vel, 3 / this.vel.mag()));
        this.vel.mult(-0.2);
        soundEffects.bounce.play();
    }
    else {
        this.pos.add(this.vel);//and that's it
    }

    for(var i = 0; i < enemies.length; i ++) {
        if(sqrDist(this.pos.x, this.pos.y, enemies[i].pos.x, enemies[i].pos.y) < (weapons.arrow.stats.size + enemies[i].size) * (weapons.arrow.stats.size + enemies[i].size)) {
            //collide
            this.deathTimer ++;
            this.pos.sub(Vect.mult(this.vel, 3 / this.vel.mag()));
            this.vel.mult(-0.2);
            soundEffects.bounce.play();
            enemies[i].damage(weapons.arrow.stats.damage + (this.isMaxCharge?weapons.bow.stats.maxChargeDmg:0));
            return;
        }
    }
}