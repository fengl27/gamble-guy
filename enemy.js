
class Enemy {
    static arrow = {
        display: function() {
            var pos = cam.toScreen(this.pos);
            ctx.save();
            ctx.translate(pos.x, pos.y);
            ctx.rotate(Math.atan2(this.vel.y, this.vel.x) + Math.sign(this.deathTimer) * Math.PI);

            let opacity = 1 - this.deathTimer / 10;
            ctx.globalAlpha = opacity;
            ctx.drawImage(assets.arrow, -cam.scale * 5, -cam.scale * 3, cam.scale * 6, cam.scale * 6);
            ctx.restore();
        },
        update: function() {
            if(this.deathTimer > 0) {
                this.deathTimer ++;
                this.vel.y += 0.05;
                this.pos.add(this.vel);
                if(this.deathTimer > 10) {
                    this.dead = true;
                }
                return;
            }
            if(Math.abs(this.pos.x) > l2.x - this.size || Math.abs(this.pos.y) > l2.y - this.size) {
                //die
                this.deathTimer ++;
                this.pos.sub(Vect.mult(this.vel, 3 / this.vel.mag()));
                this.vel.mult(-0.2);
                soundEffects.bounce.play();
            }
            else {
                this.pos.add(this.vel);//and that's it
            }
        },
        init: function() {
            this.mass = 0;//don't collision
            this.size = 1;//smol
            this.deathTimer = 0;
        }
    }
    static archer = {
        drawDanger: function() {
            if(this.shooting && Math.sin(this.shootTimer*this.shootTimer/144) > 0) {
                var pos = cam.toScreen(this.pos);
                //red rectangle (THE BATTLE CATS!!!)
                ctx.fillStyle = "rgba(255, 0, 0, 0.15)";//real transparent red
                ctx.save();
                ctx.translate(pos.x, pos.y);
                ctx.rotate(Math.atan2(this.aimDir.y, this.aimDir.x));
                ctx.fillRect(-cam.scale * 1.5, -cam.scale * 1.5, cam.scale * 200, 3 * cam.scale);
                ctx.restore();
            }
        },
        display: function() {
            var pos = cam.toScreen(this.pos);

            if(this.shooting) {
                var roundedDir = new Vect(Math.round(this.toPlayer.x),Math.round(this.toPlayer.y));
                var tilesheetPos = roundedDir.x === 1? 3: roundedDir.x === -1? 1: roundedDir.y === 1? 0: 2;
                ctx.drawImage(
                    assets.archerShoot,
                    tilesheetPos * Player.spriteSize, 0,
                    Player.spriteSize,
                    Player.spriteSize,
                    pos.x - cam.scale * 4,
                    pos.y - cam.scale * 4,
                    cam.scale * 8,
                    cam.scale * 8
                );
            }
            else {
                var walkCycle = Math.floor(this.walkAnim / this.walkAnimSpeed) % 4;

                var tilesheetPos = getTilesheetPos(walkCycle, new Vect(Math.round(this.toPlayer.x),Math.round(this.toPlayer.y)));
                
                ctx.drawImage(
                    assets[this.asset],
                    tilesheetPos.x * Player.spriteSize,
                    tilesheetPos.y * Player.spriteSize,
                    Player.spriteSize,
                    Player.spriteSize,
                    pos.x - cam.scale * 4,
                    pos.y - cam.scale * 4,
                    cam.scale * 8,
                    cam.scale * 8
                );
            }
        },
        update: function(toPlayer, dst) {
            this.vel.mult(0.5);
            let moveAmt = dst > 50? 0.1: dst > 35? 0: -0.15;
            if(moveAmt === 0 && this.shootReload <= 0 && !this.shooting) {
                this.shooting = true;
                var predictedPos = Vect.add(player.pos, Vect.mult(player.vel, settings.archerWindupTime + dst / 3 - Math.random() * 20));
                this.aimDir.set(Vect.normalize(Vect.sub(predictedPos, this.pos)));
                soundEffects.arrowLoad.play();
            }
            if(this.shooting) moveAmt *= 0.1;
            this.vel.add(Vect.mult(toPlayer, moveAmt));
            this.pos.add(this.vel);

            //wall colllide
            this.pos.x = limit(this.pos.x, -l2.x + this.size, l2.x - this.size);
            this.pos.y = limit(this.pos.y, -l2.y - this.size, l2.y - this.size);

            ///anim
            if(moveAmt) {
                this.walkAnim ++;
            }
            else {
                this.walkAnim = 0;
            }

            //cooldowns
            if(this.shooting) {
                this.shootTimer ++;
                if(this.shootTimer > settings.archerWindupTime) {
                    //school shooting
                    this.shooting = false;
                    this.shootTimer = 0;
                    this.shootReload = settings.archerReloadTime;
                    soundEffects.arrowLaunch.play();

                    let bob = new Enemy(this.pos.x, this.pos.y, "arrow");
                    bob.vel.set(Vect.mult(this.aimDir, 2));
                    enemies.push(bob);
                }
            }
            else {
                this.shootReload --;
            }
        },
        init: function() {
            this.shooting = false;
            this.shootReload = 0;
            this.shootTimer = 0;
            this.size = 2.25;
            this.aimDir = new Vect();
        }
    }
    static rock = {
        display: function() {
            var pos = cam.toScreen(this.pos);

            
            //yes tilesheets for rocks :)
            var tilesheetPos = Math.floor(this.walkAnim / this.walkAnimSpeed) % 4;
            ctx.drawImage(
                assets[this.asset],
                tilesheetPos * Player.spriteSize, 0,
                Player.spriteSize, Player.spriteSize,
                pos.x - cam.scale * 4,
                pos.y - cam.scale * 4,
                cam.scale * 8,
                cam.scale * 8
            );
            /*
            ctx.fillStyle = "red";
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, cam.scale * this.size, 0, Math.PI * 2);
            ctx.fill();
            */

            var particle = function(x, y, o) {
                Particle.squareParticle(x, y, o, "99, 46, 8");
            }
            Particle.AABBParticles(1, particle, new Vect(this.pos.x - 2, this.pos.y - 2), new Vect(4, 4), h100 / 20);
        },
        update: function() {
            this.vel.mult(0.9 / this.vel.mag())
            this.pos.add(this.vel);
            if(Math.abs(this.pos.x) > l2.x - this.size) {
                //horizontal collision
                this.vel.x *= -1;
                this.pos.x = Math.sign(this.pos.x) * (l2.x - this.size);
                soundEffects.rockRoll.play();
            }
            if(Math.abs(this.pos.y) > l2.y - this.size) {
                this.vel.y *= -1;
                this.pos.y = Math.sign(this.pos.y) * (l2.y - this.size);
                soundEffects.rockRoll.play();
            }
            this.walkAnim ++;
        },
        init: function() {
            this.size = 2;
            let theta = Math.random() * Math.PI * 2;
            this.vel.set(Math.cos(theta), Math.sin(theta));
            this.walkAnimSpeed = 10;
        }
    }
    static small = {
        drawDanger: function() {
            if(this.dashCharge && this.dashCharge % 10 < 8) {
                var pos = cam.toScreen(this.pos);
                //red rectangle (THE BATTLE CATS!!!)
                ctx.fillStyle = "rgba(255, 0, 0, 0.15)";//real transparent red (not clickbait)
                ctx.save();
                ctx.translate(pos.x, pos.y + cam.scale * 2);
                ctx.rotate(Math.atan2(this.dashDir.y, this.dashDir.x));
                ctx.fillRect(-cam.scale * 2.5, -cam.scale * 2.5, cam.scale * 50, 5 * cam.scale);
                ctx.restore();
            }
        },
        display: function() {
            let pos = cam.toScreen(this.pos);

            if(this.dashCharge) {
                let thing = new Vect(Math.round(this.dashDir.x), Math.round(this.dashDir.y));
                let tilesheetPos = thing.x? thing.x + 2: thing.y === 1? 0: 2;

                ctx.drawImage(
                    assets.smallDashing,
                    tilesheetPos * Player.spriteSize, 0,
                    Player.spriteSize,
                    Player.spriteSize,
                    pos.x - cam.scale * 4,
                    pos.y - cam.scale * 4,
                    cam.scale * 8,
                    cam.scale * 8
                );
            }
            else {

                var walkCycle = Math.floor(this.walkAnim / this.walkAnimSpeed) % 4;

                var tilesheetPos = getTilesheetPos(walkCycle, new Vect(Math.round(this.toPlayer.x),Math.round(this.toPlayer.y)));
                
                //ctx.fillStyle = "red";
                //ctx.fillRect(pos.x - cam.scale * 2, pos.y - cam.scale * 2, cam.scale * 4, cam.scale * 4);
                ctx.drawImage(
                    assets[this.asset],
                    tilesheetPos.x * Player.spriteSize,
                    tilesheetPos.y * Player.spriteSize,
                    Player.spriteSize,
                    Player.spriteSize,
                    pos.x - cam.scale * 4,
                    pos.y - cam.scale * 4,
                    cam.scale * 8,
                    cam.scale * 8
                );

                if(this.dashTimer || this.driftTimer) {
                    let thing = new Vect(Math.round(this.dashDir.x), Math.round(this.dashDir.y));
                    let tilesheetPos = thing.x? thing.x + 2: thing.y === 1? 0: 2;
                    for(var i = 0; i < this.dashTrail.length; i ++) {
                        let pos = cam.toScreen(this.dashTrail[i][0]);

                        let stuffTime = stateSwitchTimer - this.dashTrail[i][1];
                        ctx.globalAlpha = Math.exp(-stuffTime / 10) * 0.5;
                        ctx.drawImage(
                            assets.smallDashing,
                            tilesheetPos * Player.spriteSize, 0,
                            Player.spriteSize,
                            Player.spriteSize,
                            pos.x - cam.scale * 4,
                            pos.y - cam.scale * 4,
                            cam.scale * 8,
                            cam.scale * 8
                        );
                    }
                    ctx.globalAlpha = 1;
                }
            }
        },
        update: function(toPlayer, dst) {
            if(this.dashTimer) {
                this.pos.add(this.vel);
                this.vel.mult(0.95);
            }
            else if(this.dashCharge) {
                //do funny
                this.vel.add(Vect.mult(this.dashDir, 0.1));
                this.pos.add(this.vel);
            }
            else {
                this.vel.mult(0.8);
                let moveAmt = 0.15;
                if(this.driftTimer > 0) {
                    moveAmt *= 0.1;
                    this.vel.mult(0.95 / 0.8);
                }
                else if(dst < 30) {
                    this.dashTrail = [];
                    this.dashCharge ++;

                    //cool maths
                    var predictedPos = Vect.add(player.pos, Vect.mult(player.vel, 15));
                    this.dashDir.set(Vect.normalize(Vect.sub(predictedPos, this.pos)));

                    this.vel.set(Vect.mult(this.dashDir, -1.5));
                }
                this.vel.add(Vect.mult(toPlayer, moveAmt));
                this.pos.add(this.vel);
            }

            //wall colllide
            this.pos.x = limit(this.pos.x, -l2.x + this.size, l2.x - this.size);
            this.pos.y = limit(this.pos.y, -l2.y - this.size, l2.y - this.size);

            ///anim
            if(!this.dashCharge) {
                this.walkAnim += this.driftTimer > 0? 0.5: 1;
            }
            else {
                this.walkAnim = 0;
            }

            //timers
            if(this.dashCharge) {
                this.dashCharge ++;
                if(this.dashCharge > 20) {
                    this.dashCharge = 0;
                    this.dashTimer ++;
                    this.vel.set(Vect.mult(this.dashDir, 3));

                    soundEffects.smallDash.play();
                }
            }
            else if(this.dashTimer) {
                this.dashTimer ++;
                if(this.dashTimer > 30) {
                    this.dashTimer = 0;
                    this.driftTimer = 40;
                    this.vel.mult(0.7);
                }
                else if(!this.dashTrail.length || sqrDist(this.pos.x, this.pos.y, this.dashTrail.at(-1)[0].x, this.dashTrail.at(-1)[0].y) > 16) {
                    this.dashTrail.push([new Vect(this.pos.x, this.pos.y), stateSwitchTimer]);
                }
            }
            else {
                this.driftTimer --;
            }
        },
        init: function() {
            this.size = 1.5;
            this.walkAnimSpeed = 7;

            this.dashCharge = 0;
            this.dashTimer = 0;//when you actually dash;
            this.driftTimer = 0;
            this.dashDir = new Vect();

            this.dashTrail = [];
        }
    }
    constructor(x,y, type) {
        this.pos = new Vect(x||0,y||0);
        this.vel = new Vect(0, 0);
        this.controls = {
            Up: "w",
            Down: "s",
            Left: "a",
            Right: "d"
        };
        this.weapons = [];
        this.walkAnim = 0;
        this.toPlayer = new Vect(1,0);
        this.walkAnimSpeed = 20;
        this.asset = type || "archer";
        this.type = Enemy[type || "archer"];
        this.size = 0;
        this.mass = 1;//0 means don't collide (i'm not doing actual mass physics it's just whoever's heavier doesn't get moved)
        this.dead = false;
        this.type.init.call(this);
    }

    display() {
        this.type.display.call(this);
    }

    update() {
        var toPlayer = new Vect(
            player.pos.x - this.pos.x,
            player.pos.y - this.pos.y
        );
        var m = toPlayer.mag();
        toPlayer.div(m);
        this.toPlayer.set(toPlayer);
        this.type.update.call(this, toPlayer, m);

        if(this.mass) {
            //there's not too many enemies so O(n^2) it is :)
            for(var i = 0; i < enemies.length; i ++) {
                let sqrDst = sqrDist(this.pos.x, this.pos.y, enemies[i].pos.x, enemies[i].pos.y);
                if(enemies[i].mass && sqrDst !== 0 && sqrDst < (this.size + enemies[i].size) * (this.size + enemies[i].size)) {
                    //collision
                    let dst = Math.sqrt(sqrDst);// :0
                    let collisionAmt = (this.size + enemies[i].size) - dst;
                    let diff = Vect.sub(enemies[i].pos, this.pos);
                    diff.normalize();
                    let normal = new Vect(diff.x, diff.y);
                    diff.mult(collisionAmt);//how much both need to move in total

                    //spaghetti (laziness)
                    if(this.mass > enemies[i].mass) {
                        enemies[i].pos.add(diff);
                        //enemies[i].vel.sub(Vect.mult(normal, (normal.x*enemies[i].vel.x+normal.y*enemies[i].vel.y) * 2));
                    }
                    else if(this.mass < enemies[i].mass) {
                        this.pos.sub(diff);
                        //this.vel.add(Vect.mult(normal, (normal.x*this.vel.x+normal.y*this.vel.y) * 2));
                    }
                    else {
                        diff.div(2);
                        this.pos.sub(diff);
                        enemies[i].pos.add(diff);
                        
                        //enemies[i].vel.sub(Vect.mult(normal, (normal.x*enemies[i].vel.x+normal.y*enemies[i].vel.y) * 2));
                        //this.vel.sub(Vect.mult(normal, (normal.x*this.vel.x+normal.y*this.vel.y) * 2));
                    }
                }
            }
        }
        /*
        this.vel.mult(0.5);
        this.vel.add(Vect.mult(toPlayer, 0.1));
        this.pos.add(this.vel);
        this.walkAnim ++;
        */
    }
};
var enemies = [];
var roundEnemies = [];