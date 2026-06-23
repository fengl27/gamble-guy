
const weapons = {
    sword: {
        dir: Math.random() * Math.PI * 2,
        dirVel: 0.15,
        stats:{
            size:10,
            dirVel:0.15
        },
        upgrades:[],
        update: function() {
            var movement = (!getInput(player.controls.Bow) && !getInput(player.controls.Mace))? this.stats.dirVel: 0;
            this.dirVel += (movement - this.dirVel) / 10;
            this.dir += this.dirVel;

            let cPoss = [
                new Vect(player.pos.x + Math.cos(this.dir) * this.stats.size, player.pos.y + Math.sin(this.dir) * this.stats.size),
                new Vect(player.pos.x + Math.cos(this.dir) * this.stats.size / 2, player.pos.y + Math.sin(this.dir) * this.stats.size / 2),
            ];
            for(var j = 0; j < cPoss.length; j ++) {
                let cPos = cPoss[j];
                for(var i = 0; i < enemies.length; i ++) {
                    if(!enemies[i].iframes && !enemies[i].invincible && sqrDist(cPos.x, cPos.y, enemies[i].pos.x, enemies[i].pos.y) < (3 + enemies[i].size)*((3 + enemies[i].size))) {
                        //collide (they die)
                        if(enemies[i].type === Enemy.dagger) {
                            continue;//don't or else it would be kinda op
                        }
                        if(enemies[i].damage(1) !== false) {
                            console.log("damaged " + enemies[i].asset);
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

            let args = [assets.weapons, Player.spriteSize * 2, 0, Player.spriteSize, Player.spriteSize,
                    -this.stats.size / 2 * cam.scale, -cam.scale * 3 - this.stats.size * cam.scale,
                    this.stats.size * cam.scale, this.stats.size * cam.scale
            ];
            ctx.drawImage(...args);

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
            this.dir = Math.random() * Math.PI * 2
        }
    },
    throwMace:{
        pos: new Vect(),
        vel: new Vect(),
        nodePos: new Vect(),
        stats: {
            size:1,
            playerSlow:0.3
        },
        thrown: false,
        charge: 0,
        dir:0,
        upgrades:[],
        update: function() {
            this.dir -= this.charge/18;
            let thrown = getInput(player.controls.Mace);
            if(mouse.pressed&&!this.thrown&&!this.throwing && mouse.button === 2){
                player.speedMult = Math.min(player.speedMult,this.stats.playerSlow);
                this.charge=Math.min(7,this.charge+(this.charge<3?0.1:((7-this.charge)/60+0.01)))
            }
            if(!this.thrown&&thrown||mouse.button!==2){
                this.thrown = true;
                mousePos = cam.toGlobal(mouse);
                offset = Vect.sub(mousePos,player.pos);
                offset = Vect.normalize(offset);
                this.vel.set(Vect.mult(offset,this.charge));
                this.pos.set(player.pos);
                console.log(this.charge);
                this.charge = 0;
            }
            let velMag = this.vel.mag();
            let sqrDistToPlayer = sqrDist(this.pos.x,this.pos.y,player.pos.x,player.pos.y);
            if(this.thrown&&sqrDist(this.pos.x,this.pos.y,player.pos.x,player.pos.y)<(this.stats.size+player.size)*(this.stats.size+player.size)&&velMag<1.1){
                this.thrown = false;
            }
            
            if(Math.abs(this.pos.x) > l2.x - this.stats.size) {
                //horizontal collision
                this.vel.x *= -1;
                this.pos.x = Math.sign(this.pos.x) * (l2.x - this.stats.size);
                soundEffects.bounce.play();
            }
            if(Math.abs(this.pos.y) > l2.y - this.stats.size) {
                this.vel.y *= -1;
                this.pos.y = Math.sign(this.pos.y) * (l2.y - this.stats.size);
                soundEffects.bounce.play();
            }
            if(sqrDistToPlayer>400&&this.thrown){
                var dst = Math.sqrt(sqrDistToPlayer);
                let wantedMag = 20 - dst;
                let force = Vect.mult(Vect.sub(this.pos,player.pos),wantedMag / dst);
                player.vel.sub(Vect.mult(force,0.9));
                this.vel.add(Vect.mult(force,0.1));
            }
            
            if(this.thrown){
                if(sqrDistToPlayer>400){
                    this.nodePos = Vect.lerp(this.pos,player.pos,0.5);
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
                new Vect(player.pos.x + Math.cos(this.dir) * this.charge, player.pos.y + Math.sin(this.dir) * this.charge)
            }
            
            for(var j = 0; j < cPoss.length; j ++) {
                let cPos = cPoss[j];
                for(var i = 0; i < enemies.length; i ++) {
                    if((!enemies[i].iframes||velMag<1.1) && sqrDist(cPos.x, cPos.y, enemies[i].pos.x, enemies[i].pos.y) < (this.stats.size + enemies[i].size)*(this.stats.size + enemies[i].size)) {
                        //collide (they die)
                        if((enemies[i].type === Enemy.arrow && !this.thrown) || enemies[i].type === Enemy.dagger) {
                            continue;//don't or else it would be kinda op
                        }
                        if(velMag>1.1){
                            enemies[i].damage(1);

                        }else{
                            var dst = dist(cPos.x, cPos.y, enemies[i].pos.x, enemies[i].pos.y);
                            let wantedMag = (this.stats.size+enemies[i].size) - dst;
                            enemies[i].vel.sub(Vect.mult(Vect.sub(this.pos,enemies[i].pos),wantedMag / dst));
                        }
                        soundEffects.sword.play();
                    }
                }
            }

        },
        display: function() {
            //basically copied from enemy.js
            var pos = cam.toScreen(this.pos);
            var nodePos = cam.toScreen(this.nodePos);
            var playerPos = cam.toScreen(player.pos);
            var toMouse = Vect.sub(mouse,playerPos  );
            var opacity = limit(this.swordTimer - 20, 0, 20) / 20;
            ctx.globalAlpha = 1-easings.easeOutQuad(opacity);

            let args = [assets.weapons, Player.spriteSize * 2, 0, Player.spriteSize, Player.spriteSize,
                    -this.stats.size * cam.scale+pos.x, -this.stats.size * cam.scale+pos.y,
                    this.stats.size * cam.scale*2, this.stats.size * cam.scale*2
            ];
            if(this.thrown) {
                ctx.drawImage(...args);
            }else if(this.charge!==0){
                let args = [
                    assets.weapons, Player.spriteSize * 2, 0, Player.spriteSize, Player.spriteSize,
                    -this.stats.size * cam.scale, -cam.scale * 3.5 - this.charge * cam.scale,
                    this.stats.size * cam.scale*2, this.stats.size * cam.scale*2
                ];
                
                ctx.save();
                ctx.translate(playerPos.x, playerPos.y);
                ctx.rotate(this.dir + Math.PI / 2);///it points up so im in pain
                ctx.drawImage(
                    assets.weapons, Player.spriteSize * 2, 0, Player.spriteSize, Player.spriteSize,
                    -this.stats.size * cam.scale, -cam.scale * 3.5 - this.charge * cam.scale,
                    this.stats.size * cam.scale*2, this.stats.size * cam.scale*2
                );
                ctx.restore();
                if(this.charge>0){
                    ctx.save();
                    ctx.translate(playerPos.x, playerPos.y);
                    ctx.rotate(Math.atan2(toMouse.y,toMouse.x))
                    if(this.charge>1){
                        ctx.fillStyle = "rgba(0, 255, 125, 0.15)";//real transparent red (not clickbait)
                        ctx.fillRect(-cam.scale * 1.5, -cam.scale * 1.5, cam.scale * ((this.charge-1)*7), 3 * cam.scale);
                    }
                    ctx.fillStyle = "rgba(255, 0, 0, 0.15)";//real transparent red (not clickbait)
                    ctx.fillRect(-cam.scale * 1+ cam.scale* (this.charge-1)*7, -cam.scale * 1, cam.scale * (Math.min(1,this.charge)*20), 2 * cam.scale);

                    ctx.restore();
                }
            }
            if(this.thrown) {
                ctx.strokeStyle = "brown";
                ctx.lineWidth = 5
                ctx.beginPath();
                ctx.moveTo(pos.x,pos.y);
                ctx.quadraticCurveTo(nodePos.x,nodePos.y, playerPos.x, playerPos.y);
                ctx.stroke();
                ctx.strokeStyle = "black";
            }
            /*
            ctx.fillStyle = "red";
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, this.stats.size * cam.scale, 0, Math.PI * 2);
            ctx.fill();
            */
        },
        reset:function() {
            this.charge = 0;
            this.pos = new Vect();
            this.vel = new Vect();
            this.thrown = false;
        }
    },
    /*
    mace: {
        pos: new Vect(),
        vel: new Vect(),
        node: Array(3).fill(0).map((thing, idx) => [new Vect(idx * 5, 0), new Vect()]),
        swordSize: 10,
        update: function() {
            let lastNodePos = Vect.get(this.pos);
            let lastNodeVel = new Vect();
            for(var i = 0;i<this.node.length;i++){
                let offset = Vect.sub(this.node[i][0],lastNodePos)
                let targetMag = 5-offset.mag();
                offset.mult(targetMag/offset.mag());
                this.node[i][1].add(Vect.mult(offset,0.2));
                offset = Vect.sub(this.node[i][0],i===this.node.length-1?player.pos:this.node[i+1][0]);

                targetMag = 5-offset.mag();
                offset.mult(targetMag/offset.mag());
                
                this.node[i][1].mult(0.99);

                let normal = Vect.normalize(Vect.sub(this.node[i][0], lastNodePos));
                let dotProd = Vect.mult(normal, Vect.dot(normal, (Vect.sub(this.node[i][1], lastNodeVel))));
                dotProd.mult(-0.1);
                this.node[i][1].add(dotProd);
                if(i !== 0) this.node[i-1][1].sub(dotProd);

                dotProd = Vect.mult(normal, Vect.dot(normal, this.node[i][1]));
                this.node[i][1].sub(Vect.mult(dotProd, 0.2));
                dotProd = Vect.mult(normal, Vect.dot(normal, lastNodeVel));
                if(i !== 0) this.node[i-1][1].sub(Vect.mult(dotProd, 0.2));

                this.node[i][1].add(Vect.mult(offset,0.8));


                lastNodePos.set(this.node[i][0]);
                lastNodeVel.set(this.node[i][1]);
            }
            for(var i = 0;i<this.node.length;i++){
                this.node[i][0].add(this.node[i][1]);
            }
            let mousePos = cam.toGlobal(new Vect(mouse.x,mouse.y))
            let offset = Vect.sub(this.pos, mousePos);
            let playerOffset = Vect.sub(this.pos, this.node[this.node.length-1][0]);
            let mouseDist = offset.mag();
            let offsetDir = Vect.normalize(offset);
            let targetMag = 15 - playerOffset.mag();
            playerOffset.mult(targetMag / playerOffset.mag());
            
            if(this.selected){
                this.vel.sub(Vect.mult(Vect.mult(Vect.normalize(offset),Math.min(mouseDist,15)),0.2));
            }
            this.vel.add(Vect.mult(playerOffset,0.2));
            this.vel.mult(this.selected?0.5:0.99);

            let normal = Vect.normalize(Vect.sub(this.pos, this.node.at(-1)[0]));
            let dotProd = Vect.mult(normal, Vect.dot(normal, this.vel));
            this.vel.sub(Vect.mult(dotProd, 0.2));

            this.pos.add(this.vel);
            let cPoss = [
                this.pos
            ];
            for(var j = 0; j < cPoss.length; j ++) {
                let cPos = cPoss[j];
                for(var i = 0; i < enemies.length; i ++) {
                    if(!enemies[i].iframes && sqrDist(cPos.x, cPos.y, enemies[i].pos.x, enemies[i].pos.y) < (3 + enemies[i].size)*((3 + enemies[i].size))) {
                        //collide (they die)
                        if((enemies[i].type === Enemy.arrow && !selected) || enemies[i].type === Enemy.dagger) {
                            continue;//don't or else it would be kinda op
                        }
                        enemies[i].damage(1);
                        console.log("damaged " + enemies[i].asset);
                        soundEffects.sword.play();
                    }
                }

            }
        },
        display: function() {
            //basically copied from enemy.js
            var pos = cam.toScreen(this.pos);
            ctx.save();
            ctx.translate(pos.x, pos.y);
            //ctx.rotate(this.dir + Math.PI / 2);///it points up so im in pain

            var opacity = limit(this.swordTimer - 20, 0, 20) / 20;
            ctx.globalAlpha = 1-easings.easeOutQuad(opacity);

            let args = [assets.weapons, Player.spriteSize * 2, 0, Player.spriteSize, Player.spriteSize,
                    -this.stats.size / 2 * cam.scale, -this.stats.size / 2 * cam.scale,
                    this.stats.size * cam.scale, this.stats.size * cam.scale
            ];
            if(this.selected) {
                ctx.drawImage(...args);
            }
            else {
                drawGrayedImage(...args);
            }

            ctx.restore();
            ctx.lineJoin = "round";
            ctx.lineWidth = h100;
            ctx.strokeStyle = "black";
            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y);
            for(var i = 0; i < this.node.length; i ++) {
                let nodePos = cam.toScreen(this.node[i][0]);
                ctx.lineTo(nodePos.x, nodePos.y);
            }
            let pp = cam.toScreen(player.pos);
            ctx.lineTo(pp.x, pp.y);
            ctx.stroke();
        }
    },
    */
    arrow: function(p, v) {
        this.stats = {
            size:5
        };
        this.deathTimer = 0;
        this.pos = p;
        this.vel = v;
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
            playerSlow:0.5,
        },
        upgrades:[],
        update: function() {
            this.dirVel += ((this.chargeTimer? 0: -this.stats.dirAccel) - this.dirVel) / 5;
            this.dir += this.dirVel;

            this.pullbackAmt += this.pullbackVel;
            this.pullbackVel *= 0.8;
            this.pullbackVel -= this.pullbackAmt * 0.3;

            if(getInput(player.controls.Bow) && !this.chargeTimer) {//0 = lb, 1 = wheel, 2 = rb
                this.chargeTimer ++;
                soundEffects.arrowLoad.play();
            }
            else if(this.chargeTimer) {
                if(mouse.pressed && mouse.button === 0) {
                    player.speedMult = Math.min(player.speedMult,this.stats.playerSlow);
                    this.chargeTimer = Math.min(this.chargeTimer + 1, 40);
                    this.pullbackAmt = -easings.easeInOutQuad(this.chargeTimer/40) * 4;
                }
                else {
                    //water bucket RELEASE
                    if(this.chargeTimer > 10) {
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
                                Math.cos(this.dir) * this.chargeTimer / 40 * 3,
                                Math.sin(this.dir) * this.chargeTimer / 40 * 3
                            )
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
            var vibrationAmt = this.chargeTimer / 40 * cam.scale/4;
            if(this.chargeTimer>10){
                ctx.fillStyle = "rgba(255, 0, 0, 0.15)";//real transparent red (not clickbait)
                ctx.fillRect(cam.scale * 2, -cam.scale * 1.5, 150*cam.scale, 3 * cam.scale);
            }
            ctx.translate(lerp(-vibrationAmt, vibrationAmt, Math.random()), lerp(-vibrationAmt, vibrationAmt, Math.random()));
            ctx.scale(1 + easings.easeOutQuad(this.chargeTimer / 40) / 3, 1);

            ctx.globalAlpha = 1;

            let args = [assets.weapons, Player.spriteSize * (this.chargeTimer?1:0), 0, Player.spriteSize, Player.spriteSize,
                    -cam.scale * this.stats.sizeMult/2, -cam.scale * this.stats.sizeMult/2,
                    this.stats.sizeMult * cam.scale, this.stats.sizeMult * cam.scale
            ];
            ctx.drawImage(...args);

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

weapons.arrow.prototype.display = function() {
    var pos = cam.toScreen(this.pos);
    ctx.save();
    ctx.translate(pos.x, pos.y);
    ctx.rotate(Math.atan2(this.vel.y, this.vel.x) + Math.sign(this.deathTimer) * Math.PI);

    let opacity = 1 - this.deathTimer / 10;
    ctx.globalAlpha = opacity;
    ctx.drawImage(assets.arrow, -cam.scale * 5, -cam.scale * 3, cam.scale * 6, cam.scale * 6);
    ctx.restore();
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
if(Math.abs(this.pos.x) > l2.x - this.stats.size || Math.abs(this.pos.y) > l2.y - this.stats.size) {
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
    if(sqrDist(this.pos.x, this.pos.y, enemies[i].pos.x, enemies[i].pos.y) < (this.stats.size + enemies[i].size) * (this.stats.size + enemies[i].size)) {
        //collide
        this.deathTimer ++;
        this.pos.sub(Vect.mult(this.vel, 3 / this.vel.mag()));
        this.vel.mult(-0.2);
        soundEffects.bounce.play();
        enemies[i].damage(1);
        return;
    }
}
}