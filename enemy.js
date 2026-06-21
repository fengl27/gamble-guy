
class Enemy {
    static drawImage(img, sx, sy, sw, sh, x, y, w, h, iframes) {
        if(iframes % 20 < 10) {
            ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
        }
        else {
            drawImgWithColor(img, "white", sx, sy, sw, sh, x, y, w, h);
        }
    }
    
    /*
    if(this.deathAnim) {
        this.iframes = NaN;//white
        if(this.deathAnim >= settings.deathDelay - 9) {
            let frame = Math.floor((this.deathAnim - settings.deathDelay + 9) / 3);
            ctx.drawImage(
                assets.death,
                frame * Player.spriteSize, 0,
                Player.spriteSize, Player.spriteSize,
                pos.x - cam.scale * 4,
                pos.y - cam.scale * 4,
                cam.scale * 8,
                cam.scale * 8
            );
            return;
        }
    }

    if(this.deathAnim) {
        if(this.deathAnim === 1) {
            this.vel.mult(0.5);
        }
        this.size = NaN;//don't collide
        this.vel.mult(0.8);
        this.pos.add(this.vel);
        
        //<3 walls my beloved
        this.pos.x = limit(this.pos.x, -l2.x + 2, l2.x - 2);
        this.pos.y = limit(this.pos.y, -l2.y - 2, l2.y - 2);
        
        this.deathAnim ++;
        if(this.deathAnim === settings.deathDelay - 5) {
            soundEffects.kill.play();
        }
        if(this.deathAnim > settings.deathDelay) {
            this.dead = true;
        }
        return;
    }

    damage: function() {
        this.vel.sub(Vect.mult(this.toPlayer, 10));
    }
    */

    
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
        },
        damage: function() {
            if(!this.deathTimer) {
                this.deathTimer ++;
                this.pos.sub(Vect.mult(this.vel, 3 / this.vel.mag()));
                this.vel.mult(-0.2);
                soundEffects.bounce.play();
            }
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

            if(this.deathAnim) {
                this.iframes = NaN;//white
                if(this.deathAnim >= settings.deathDelay - 9) {
                    let frame = Math.floor((this.deathAnim - settings.deathDelay + 9) / 3);
                    ctx.drawImage(
                        assets.death,
                        frame * Player.spriteSize, 0,
                        Player.spriteSize, Player.spriteSize,
                        pos.x - cam.scale * 4,
                        pos.y - cam.scale * 4,
                        cam.scale * 8,
                        cam.scale * 8
                    );
                    return;
                }
            }

            if(this.shooting) {
                var roundedDir = new Vect(Math.round(this.toPlayer.x),Math.round(this.toPlayer.y));
                var tilesheetPos = roundedDir.x === 1? 3: roundedDir.x === -1? 1: roundedDir.y === 1? 0: 2;
                Enemy.drawImage(
                    assets.archerShoot,
                    tilesheetPos * Player.spriteSize, 0,
                    Player.spriteSize,
                    Player.spriteSize,
                    pos.x - cam.scale * 4,
                    pos.y - cam.scale * 4,
                    cam.scale * 8,
                    cam.scale * 8, this.iframes
                );
            }
            else {
                var walkCycle = Math.floor(this.walkAnim / this.walkAnimSpeed) % 4;

                var tilesheetPos = getTilesheetPos(walkCycle, new Vect(Math.round(this.toPlayer.x),Math.round(this.toPlayer.y)));
                
                Enemy.drawImage(
                    assets[this.asset],
                    tilesheetPos.x * Player.spriteSize,
                    tilesheetPos.y * Player.spriteSize,
                    Player.spriteSize,
                    Player.spriteSize,
                    pos.x - cam.scale * 4,
                    pos.y - cam.scale * 4,
                    cam.scale * 8,
                    cam.scale * 8, this.iframes
                );
            }
        },
        update: function(toPlayer, dst) {
            if(this.deathAnim) {
                if(this.deathAnim === 1) {
                    this.vel.mult(0.5);
                }
                this.size = NaN;//don't collide
                this.vel.mult(0.8);
                this.pos.add(this.vel);
                
                //<3 walls my beloved
                this.pos.x = limit(this.pos.x, -l2.x + 2, l2.x - 2);
                this.pos.y = limit(this.pos.y, -l2.y - 2, l2.y - 2);
                
                this.deathAnim ++;
                if(this.deathAnim === settings.deathDelay - 5) {
                    soundEffects.kill.play();
                }
                if(this.deathAnim > settings.deathDelay) {
                    this.dead = true;
                }
                return;
            }
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
            this.health = 2;
            this.aimDir = new Vect();
        },
        damage: function() {
            this.vel.sub(Vect.mult(this.toPlayer, 10));
        }
    }
    static rock = {
        display: function() {
            var pos = cam.toScreen(this.pos);

            if(this.deathAnim) {
                this.iframes = NaN;//white
                if(this.deathAnim >= settings.deathDelay - 9) {
                    let frame = Math.floor((this.deathAnim - settings.deathDelay + 9) / 3);
                    ctx.drawImage(
                        assets.death,
                        frame * Player.spriteSize, 0,
                        Player.spriteSize, Player.spriteSize,
                        pos.x - cam.scale * 4,
                        pos.y - cam.scale * 4,
                        cam.scale * 8,
                        cam.scale * 8
                    );
                    return;
                }
            }
            
            //yes tilesheets for rocks :)
            var tilesheetPos = Math.floor(this.walkAnim / this.walkAnimSpeed) % 4;
            Enemy.drawImage(
                assets[this.asset],
                tilesheetPos * Player.spriteSize, 0,
                Player.spriteSize, Player.spriteSize,
                pos.x - cam.scale * 4,
                pos.y - cam.scale * 4,
                cam.scale * 8,
                cam.scale * 8, this.iframes
            );
            /*
            ctx.fillStyle = "red";
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, cam.scale * this.size, 0, Math.PI * 2);
            ctx.fill();
            */

            var particle = function(x, y, o) {
                Particle.squareParticle(x, y, o, "46, 46, 46");
            }
            Particle.AABBParticles(1, particle, new Vect(this.pos.x - 2, this.pos.y - 2), new Vect(4, 4), h100 / 20);
        },
        update: function() {
            if(this.deathAnim) {
                if(this.deathAnim === 1) {
                    this.vel.mult(0.4);//reaaly slow down on this one
                }
                this.size = NaN;//don't collide
                this.vel.mult(0.85);
                this.pos.add(this.vel);
                
                //<3 walls my beloved
                this.pos.x = limit(this.pos.x, -l2.x + 3, l2.x - 3);
                this.pos.y = limit(this.pos.y, -l2.y + 3, l2.y - 3);
                
                this.deathAnim ++;
                if(this.deathAnim === settings.deathDelay - 12) {
                    soundEffects.rockDeath.play();
                }
                if(this.deathAnim > settings.deathDelay) {
                    this.dead = true;
                }
                return;
            }

            this.vel.mult(0.9 / this.vel.mag())
            this.pos.add(this.vel);
            if(Math.abs(this.pos.x) > l2.x - this.size) {
                //horizontal collision
                this.vel.x *= -1;
                this.pos.x = Math.sign(this.pos.x) * (l2.x - this.size);
                soundEffects.bounce.play();
            }
            if(Math.abs(this.pos.y) > l2.y - this.size) {
                this.vel.y *= -1;
                this.pos.y = Math.sign(this.pos.y) * (l2.y - this.size);
                soundEffects.bounce.play();
            }
            this.walkAnim ++;
        },
        init: function() {
            this.mass = 2;
            this.health = 3;
            this.size = 2;
            let theta = Math.random() * Math.PI * 2;
            this.vel.set(Math.cos(theta), Math.sin(theta));
            this.walkAnimSpeed = 10;
        },
        damage: function() {
            this.vel.sub(Vect.mult(this.toPlayer, 10));
        }
    }
    
    static golemite = {  
        drawDanger: function() {
            if(this.dashCharge && this.dashCharge % 10 < 8) {
                var pos = cam.toScreen(this.pos);
                //red rectangle (THE BATTLE CATS!!!)
                ctx.fillStyle = "rgba(255, 0, 0, 0.15)";//real transparent red (not clickbait)
                ctx.save();
                ctx.translate(pos.x, pos.y + cam.scale * 2);
                ctx.rotate(Math.atan2(this.dashDir.y, this.dashDir.x));
                ctx.fillRect(-cam.scale * 2.5, -cam.scale * 2.5, cam.scale * 70, 5 * cam.scale);
                ctx.restore();
            }
        },
        display: function() {
            let pos = cam.toScreen(this.pos);

            if(this.deathAnim) {
                this.iframes = NaN;//white
                if(this.deathAnim >= settings.deathDelay - 9) {
                    let frame = Math.floor((this.deathAnim - settings.deathDelay + 9) / 3);
                    Enemy.drawImage(
                        assets.death,
                        frame * Player.spriteSize, 0,
                        Player.spriteSize, Player.spriteSize,
                        pos.x - cam.scale * 4,
                        pos.y - cam.scale * 4,
                        cam.scale * 8,
                        cam.scale * 8, this.iframes
                    );
                    return;
                }
            }

            if(this.dashTimer) {
                var walkCycle = Math.floor(this.walkAnim / this.walkAnimSpeed) % 4;
                var tilesheetPos = getTilesheetPos(walkCycle, new Vect(Math.round(this.toPlayer.x),Math.round(this.toPlayer.y)));
                
                //ctx.fillStyle = "red";
                //ctx.fillRect(pos.x - cam.scale * 2, pos.y - cam.scale * 2, cam.scale * 4, cam.scale * 4);
                Enemy.drawImage(
                    assets.golemite,
                    tilesheetPos.x * Player.spriteSize, tilesheetPos.y * Player.spriteSize,
                    Player.spriteSize,
                    Player.spriteSize,
                    pos.x - cam.scale * 4,
                    pos.y - cam.scale * 4,
                    cam.scale * 8,
                    cam.scale * 8, this.iframes
                );
            }
            else {

                //var walkCycle = Math.floor(this.walkAnim / this.walkAnimSpeed) % 4;
                var walkCycle = 0;


                var tilesheetPos = getTilesheetPos(walkCycle, new Vect(Math.round(this.toPlayer.x),Math.round(this.toPlayer.y)));
                
                //ctx.fillStyle = "red";
                //ctx.fillRect(pos.x - cam.scale * 2, pos.y - cam.scale * 2, cam.scale * 4, cam.scale * 4);
                Enemy.drawImage(
                    assets.golemite,
                    tilesheetPos.x * Player.spriteSize,
                    tilesheetPos.y * Player.spriteSize,
                    Player.spriteSize,
                    Player.spriteSize,
                    pos.x - cam.scale * 4,
                    pos.y - cam.scale * 4,
                    cam.scale * 8,
                    cam.scale * 8, this.iframes
                );
                /*
                if(this.dashTimer || this.driftTimer) {
                    let thing = new Vect(Math.round(this.dashDir.x), Math.round(this.dashDir.y));
                    let tilesheetPos = thing.x? thing.x + 2: thing.y === 1? 0: 2;
                    for(var i = 0; i < this.dashTrail.length; i ++) {
                        let pos = cam.toScreen(this.dashTrail[i][0]);

                        let stuffTime = stateSwitchTimer - this.dashTrail[i][1];
                        ctx.globalAlpha = Math.exp(-stuffTime / 10) * 0.5;
                        ctx.drawImage(
                            assets.golemite,
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
                */
            }
        },
        update: function(toPlayer, dst) {
            if(this.deathAnim) {
                if(this.deathAnim === 1) {
                    this.vel.mult(0.5);
                }
                this.size = NaN;//don't collide
                this.vel.mult(0.8);
                this.pos.add(this.vel);
                
                //<3 walls my beloved
                this.pos.x = limit(this.pos.x, -l2.x + 2, l2.x - 2);
                this.pos.y = limit(this.pos.y, -l2.y - 2, l2.y - 2);
                
                this.deathAnim ++;
                if(this.deathAnim === settings.deathDelay - 5) {
                    soundEffects.kill.play();
                }
                if(this.deathAnim > settings.deathDelay) {
                    this.dead = true;
                }
                return;
            }
            if(this.dashTimer) {
                this.pos.add(this.vel);
                this.vel.mult(0.95);
            }
            else if(this.dashCharge) {
                //do funny
                this.pos.add(this.vel);
            }
            else {
                this.vel.mult(0.8);
                if(dst < 40 && this.driftTimer <= 0) {
                    this.dashTrail = [];
                    this.dashCharge ++;

                    //cool maths
                    var predictedPos = Vect.add(player.pos, Vect.mult(player.vel, 15));
                    this.dashDir.set(Vect.normalize(Vect.sub(predictedPos, this.pos)));
                }
                this.pos.add(this.vel);
            }

            //wall colllide
            this.pos.x = limit(this.pos.x, -l2.x + this.size, l2.x - this.size);
            this.pos.y = limit(this.pos.y, -l2.y - this.size, l2.y - this.size);

            ///anim
            if(this.dashTimer) {
                this.walkAnim ++;
            }
            else {
                this.walkAnim = 0;
            }

            //timers
            if(this.dashCharge) {
                this.dashCharge ++;
                if(this.dashCharge > 25) {
                    this.dashCharge = 0;
                    this.dashTimer ++;

                    this.vel.set(Vect.mult(this.dashDir, 4));

                    soundEffects.smallDash.play();
                }
            }
            else if(this.dashTimer) {
                this.dashTimer ++;
                if(this.dashTimer > 25) {
                    this.dashTimer = 0;
                    this.driftTimer = 120;
                    this.vel.mult(0.6);
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
            
            this.health = 1;
            this.size = 1.5;
            this.walkAnimSpeed = 15;

            this.dashCharge = 0;
            this.dashTimer = 0;//when you actually dash;
            this.driftTimer = 0;
            this.dashDir = new Vect();

            this.dashTrail = [];
        },
        damage: function() {
            this.vel.sub(Vect.mult(this.toPlayer, 2));
        }
    }
    static boulder = {
        display: function() {
            var pos = cam.toScreen(this.pos);

            if(this.deathAnim) {
                this.iframes = NaN;//white
                if(this.deathAnim >= settings.deathDelay - 9) {
                    let frame = Math.floor((this.deathAnim - settings.deathDelay + 9) / 3);
                    ctx.drawImage(
                        assets.death,
                        frame * Player.spriteSize, 0,
                        Player.spriteSize, Player.spriteSize,
                        pos.x - cam.scale * 4,
                        pos.y - cam.scale * 4,
                        cam.scale * 8,
                        cam.scale * 8
                    );
                    return;
                }
            }
            
            //yes tilesheets for rocks :)
            var tilesheetPos = Math.floor(this.walkAnim / this.walkAnimSpeed) % 4;
            Enemy.drawImage(
                assets.rockDamaged,
                tilesheetPos * Player.spriteSize, 0,
                Player.spriteSize, Player.spriteSize,
                pos.x - cam.scale * 4,
                pos.y - cam.scale * 4,
                cam.scale * 8,
                cam.scale * 8, this.iframes
            );
            /*
            ctx.fillStyle = "red";
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, cam.scale * this.size, 0, Math.PI * 2);
            ctx.fill();
            */

            var particle = function(x, y, o) {
                Particle.squareParticle(x, y, o, "46, 46, 46");
            }
            Particle.AABBParticles(1, particle, new Vect(this.pos.x - 2, this.pos.y - 2), new Vect(4, 4), h100 / 20);
        },
        
        update: function() {
            if(this.deathAnim) {
                if(this.deathAnim === 1) {
                    this.vel.mult(0.5);
                }
                this.size = NaN;//don't collide
                this.vel.mult(0.8);
                this.pos.add(this.vel);
                
                //<3 walls my beloved
                this.pos.x = limit(this.pos.x, -l2.x + 2, l2.x - 2);
                this.pos.y = limit(this.pos.y, -l2.y - 2, l2.y - 2);
                
                this.deathAnim ++;
                if(this.deathAnim === settings.deathDelay - 5) {
                    soundEffects.kill.play();
                }
                if(this.deathAnim > settings.deathDelay) {
                    this.dead = true;
                }
                return;
            }
            
            this.vel.mult(0.9 / this.vel.mag())
            this.pos.add(this.vel);
            if(Math.abs(this.pos.x) > l2.x - this.size) {
                //horizontal collision
                this.vel.x *= -1;
                this.pos.x = Math.sign(this.pos.x) * (l2.x - this.size);
                soundEffects.bounce.play();
                if(this.spawning ===false ){
                    this.spawnDelay = 10;
                    this.spawning = true;
                    this.spawnPos.set(this.pos);
                }
            }
            if(Math.abs(this.pos.y) > l2.y - this.size) {
                this.vel.y *= -1;
                this.pos.y = Math.sign(this.pos.y) * (l2.y - this.size);
                soundEffects.bounce.play();
                if(this.spawning ===false ){
                    this.spawnDelay = 10;
                    this.spawning = true;
                    this.spawnPos.set(this.pos);
                }
            }
            if(this.spawnDelay===0&&this.spawning === true){
                let bob = new Enemy(this.spawnPos.x, this.spawnPos.y, "golemite");
                enemies.push(bob);
                this.spawning = false;
            }
            this.walkAnim ++;
            this.spawnDelay = Math.max(0, this.spawnDelay-1);
        },
        init: function() {
            this.health = 5;
            this.size = 2;
            let theta = Math.random() * Math.PI * 2;
            this.vel.set(Math.cos(theta), Math.sin(theta));
            this.walkAnimSpeed = 10;
            this.spawnDelay = 10;
            this.spawning = false;
            this.spawnPos = new Vect();
        },
        damage: function() {
            this.vel.sub(Vect.mult(this.toPlayer, 10));
        }
    }
    
    static roller = {
        drawDanger: function() {
            if(this.shooting && Math.sin(this.shootTimer*this.shootTimer/144) > 0) {
                var pos = cam.toScreen(this.pos);
                //red rectangle (THE BATTLE CATS!!!)
                ctx.fillStyle = "rgba(255, 0, 0, 0.15)";//real transparent red
                var aimDir = Vect.sub(this.aimPos, this.pos);
                ctx.save();
                ctx.translate(pos.x, pos.y);
                ctx.rotate(Math.atan2(aimDir.y, aimDir.x));
                ctx.fillRect(-cam.scale * 1.5, -cam.scale * 1.5, cam.scale * 200, 3 * cam.scale);
                ctx.restore();
            }
        },
        display: function() {
            var pos = cam.toScreen(this.pos);

            if(this.deathAnim) {
                this.iframes = NaN;//white
                if(this.deathAnim >= settings.deathDelay - 9) {
                    let frame = Math.floor((this.deathAnim - settings.deathDelay + 9) / 3);
                    ctx.drawImage(
                        assets.death,
                        frame * Player.spriteSize, 0,
                        Player.spriteSize, Player.spriteSize,
                        pos.x - cam.scale * 4,
                        pos.y - cam.scale * 4,
                        cam.scale * 8,
                        cam.scale * 8
                    );
                    return;
                }
            }
            
            //yes tilesheets for rocks :)
            var tilesheetPos = Math.floor(this.walkAnim / this.walkAnimSpeed) % 4;
            ctx.drawImage(
                assets.rock,
                tilesheetPos * Player.spriteSize, 0,
                Player.spriteSize, Player.spriteSize,
                pos.x - cam.scale * 4,
                pos.y - cam.scale * 4,
                cam.scale * 8,
                cam.scale * 8
            );
            var walkCycle = Math.floor(this.walkAnim / this.walkAnimSpeed) % 4;
            var roundedDir = new Vect(Math.round(this.toPlayer.x),Math.round(this.toPlayer.y));
            tilesheetPos = getTilesheetPos(walkCycle, new Vect(Math.round(roundedDir.x), Math.round(roundedDir.y)));
            ctx.drawImage(
                assets.archerShootMoving,
                tilesheetPos.x * Player.spriteSize,
                tilesheetPos.y * Player.spriteSize,
                Player.spriteSize,
                Player.spriteSize,
                pos.x - cam.scale * 4,
                pos.y - cam.scale * 10,
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
                Particle.squareParticle(x, y, o, "46, 46, 46");
            }
            Particle.AABBParticles(1, particle, new Vect(this.pos.x - 2, this.pos.y - 2), new Vect(4, 4), h100 / 20);
        },
        update: function() {
            if(this.deathAnim) {
                if(this.deathAnim === 1) {
                    this.vel.mult(0.5);
                }
                this.size = NaN;//don't collide
                this.vel.mult(0.8);
                this.pos.add(this.vel);
                
                //<3 walls my beloved
                this.pos.x = limit(this.pos.x, -l2.x + 2, l2.x - 2);
                this.pos.y = limit(this.pos.y, -l2.y - 2, l2.y - 2);
                
                this.deathAnim ++;
                if(this.deathAnim === settings.deathDelay - 5) {
                    soundEffects.kill.play();
                }
                if(this.deathAnim > settings.deathDelay) {
                    this.dead = true;
                }
                return;
            }

            this.vel.mult(0.9 / this.vel.mag())
            this.pos.add(this.vel);
            if(Math.abs(this.pos.x) > l2.x - this.size) {
                //horizontal collision
                this.vel.x *= -1;
                this.pos.x = Math.sign(this.pos.x) * (l2.x - this.size);
                soundEffects.bounce.play();
            }
            if(Math.abs(this.pos.y) > l2.y - this.size) {
                this.vel.y *= -1;
                this.pos.y = Math.sign(this.pos.y) * (l2.y - this.size);
                soundEffects.bounce.play();
            }
            if(this.shootReload <= 0 && !this.shooting) {
                this.shooting = true;
                var predictedPos = Vect.add(player.pos, Vect.mult(player.vel, settings.archerWindupTime + dist(player.pos.x,player.pos.y,this.pos.x,this.pos.y) / 3 - Math.random() * 20));
                this.aimPos.set(predictedPos);
                soundEffects.arrowLoad.play();
            }
            if(this.shooting) {
                this.shootTimer ++;
                if(this.shootTimer > settings.archerWindupTime) {
                    //school shooting
                    this.shooting = false;
                    this.shootTimer = 0;
                    this.shootReload = settings.archerReloadTime;
                    soundEffects.arrowLaunch.play();

                    let bob = new Enemy(this.pos.x, this.pos.y, "arrow");
                    bob.vel.set(Vect.mult(Vect.normalize(Vect.sub(this.aimPos, this.pos)), 2));
                    enemies.push(bob);
                }
            }
            else {
                this.shootReload --;
            }
            this.walkAnim ++;
        },
        init: function() {
            
            this.health = 2;
            this.size = 2;
            let theta = Math.random() * Math.PI * 2;
            this.vel.set(Math.cos(theta), Math.sin(theta));
            this.walkAnimSpeed = 10;
            this.health = 2;
            
            this.shooting = false;
            this.shootReload = 0;
            this.shootTimer = 0;
            this.aimPos = new Vect();
        },
        damage: function() {
            this.vel.sub(Vect.mult(this.toPlayer, 7));
        }
    }

    
    static deflector = {
        display: function() {
            var pos = cam.toScreen(this.rockPos);
            
            var drawRock = true;
            if(this.deathAnim) {
                this.iframes = NaN;//white
                if(this.deathAnim >= settings.deathDelay - 9) {
                    let frame = Math.floor((this.deathAnim - settings.deathDelay + 9) / 3);
                    ctx.drawImage(
                        assets.death,
                        frame * Player.spriteSize, 0,
                        Player.spriteSize, Player.spriteSize,
                        pos.x - cam.scale * 4,
                        pos.y - cam.scale * 4,
                        cam.scale * 8,
                        cam.scale * 8
                    );
                    drawRock = false;
                }
            }
            if(drawRock) {
                //yes tilesheets for rocks :)
                var tilesheetPos = Math.floor(this.walkAnim / this.walkAnimSpeed) % 4;
                Enemy.drawImage(
                    assets.rock,
                    tilesheetPos * Player.spriteSize, 0,
                    Player.spriteSize, Player.spriteSize,
                    pos.x - cam.scale * 4,
                    pos.y - cam.scale * 4,
                    cam.scale * 8,
                    cam.scale * 8, this.deathAnim? NaN : 0
                );
            }
            if(this.deflectingTimer>60) {
                var walkCycle = 0;
                pos = cam.toScreen(this.pos);

                if(this.deathAnim) {
                    this.iframes = NaN;//white
                    if(this.deathAnim >= settings.deathDelay - 9) {
                        let thingy = this.deathAnim? this.deathAnim - settings.deathDelay + 9: this.deflectingTimer;
                        let frame = Math.floor(thingy / 3);
                        ctx.drawImage(
                            assets.death,
                            frame * Player.spriteSize, 0,
                            Player.spriteSize, Player.spriteSize,
                            pos.x - cam.scale * 4,
                            pos.y - cam.scale * 4,
                            cam.scale * 8,
                            cam.scale * 8
                        );
                        return;
                    }
                }
                else if(this.deflectingTimer > 171 || this.deflectingTimer < 69) {
                    console.log(this.deflectingTimer);
                    let frame = this.deflectingTimer < 69? 2-Math.floor((this.deflectingTimer-60) / 3): 2 - Math.floor((180 - this.deflectingTimer) / 3);
                    ctx.drawImage(
                        assets.death,
                        frame * Player.spriteSize, 0,
                        Player.spriteSize, Player.spriteSize,
                        pos.x - cam.scale * 4,
                        pos.y - cam.scale * 4,
                        cam.scale * 8,
                        cam.scale * 8
                    );
                    return;
                }

                tilesheetPos = getTilesheetPos(walkCycle, new Vect(Math.round(this.deflectorDisplayDir.x),Math.round(this.deflectorDisplayDir.y)));
                
                //ctx.fillStyle = "red";
                //ctx.fillRect(pos.x - cam.scale * 2, pos.y - cam.scale * 2, cam.scale * 4, cam.scale * 4);
                Enemy.drawImage(
                    assets.sword,
                    tilesheetPos.x * Player.spriteSize,
                    tilesheetPos.y * Player.spriteSize,
                    Player.spriteSize,
                    Player.spriteSize,
                    pos.x - cam.scale * 4,
                    pos.y - cam.scale * 4,
                    cam.scale * 8,
                    cam.scale * 8, this.iframes
                );
                if(this.deflectingTimer === 150) {
                    soundEffects.sword.play();
                }
                if(this.deflectingTimer > 150&& this.deflectingTimer<160) {
                    ctx.save();
                    ctx.translate(pos.x, pos.y);
                    ctx.rotate((this.deflectingTimer-150)*Math.PI/10 + Math.atan2(this.pos.y - this.rockPos.y, this.pos.x - this.rockPos.x)+Math.PI);///it points up so im in pain

                    var opacity = 0;
                    ctx.globalAlpha = 1-easings.easeOutQuad(opacity);

                    ctx.drawImage(assets.weapons, Player.spriteSize * 2, 0, Player.spriteSize, Player.spriteSize,
                        -this.swordSize / 2 * cam.scale, -cam.scale * 3 - this.swordSize * cam.scale,
                        this.swordSize * cam.scale, this.swordSize * cam.scale
                    )

                    ctx.restore();
                }
            }


            var particle = function(x, y, o) {
                Particle.squareParticle(x, y, o, "46, 46, 46");
            }
            Particle.AABBParticles(1, particle, new Vect(this.rockPos.x - 2, this.rockPos.y - 2), new Vect(4, 4), h100 / 20);
        },
        update: function() {
            if(this.deathAnim) {
                this.size = NaN;
                this.vel.mult(0.8);
                this.rockPos.add(this.vel);
                this.deathAnim ++;
                if(this.deathAnim === settings.deathDelay - 5) {
                    soundEffects.kill.play();
                }
                if(this.deathAnim > settings.deathDelay) {
                    this.dead = true;
                }
                return;
            }
            if(sqrDist(this.rockPos.x, this.rockPos.y, player.pos.x, player.pos.y) < (player.size + this.size) * (player.size + this.size)) {
                player.damage();
            }
            if(Vect.dot(this.toPlayer,Vect.normalize(this.vel))<0&&this.deflectingTimer===0){
                this.deflectingTimer=180;
                this.pos=Vect.get(this.rockPos);
                var framesTraveled = 0;
                var simVel = Vect.get(this.vel);
                /*
                let limit = 50;
                
                while(--limit > 0 && framesTraveled<60){
                    var limitors = [//walls
                        [(Math.sign(simVel.x) * (l2.x-this.size)-this.pos.x)/simVel.x,0],
                        [(Math.sign(simVel.y) * (l2.y-this.size)-this.pos.y)/simVel.y,1],
                    ]
                    limitors.sort((a,b)=>a[0]-b[0]);
                    
                    var mag = Math.min(Math.ceil(Math.abs(limitors[0][0])),60)
                    this.pos.add(Vect.mult(simVel,mag));
                    framesTraveled+=mag;
                    //console.log(this.pos);
                    if(limitors[0][1]===0){
                        simVel.x*=-1;
                        this.pos.x = Math.sign(this.pos.x) * (l2.x - this.size);
                    }else{
                        simVel.y*=-1;
                        this.pos.y = Math.sign(this.pos.y) * (l2.y - this.size);
                    }
                }
                */
                for(var i = 0; i < 30; i ++) {
                    this.pos.add(simVel);
                    if(Math.abs(this.pos.x) > l2.x - this.size) {
                        simVel.x*=-1;
                        this.pos.x = Math.sign(this.pos.x) * (l2.x - this.size);
                    }
                    if(Math.abs(this.pos.y) > l2.y - this.size) {
                        simVel.y*=-1;
                        this.pos.y = Math.sign(this.pos.y) * (l2.y - this.size);
                    }
                }

                if(limit <= 0) {
                    //console.log("it bronk");
                }
                this.deflectorDir=Vect.normalize(Vect.sub(player.pos, this.pos));
                this.deflectorDisplayDir = Vect.normalize(
                            Vect.lerp(
                                this.deflectorDir,
                                Vect.mult(
                                    Vect.normalize(simVel),-1
                                ),
                                0.5
                            )
                        );
                this.pos.sub(
                    Vect.mult(
                        this.deflectorDisplayDir,
                        10
                    )
                );
                
            }else if(this.deflectingTimer>0){
                this.deflectingTimer--;
                //console.log(this.pos);
                if(this.deflectingTimer===150){
                    this.vel=Vect.mult(this.deflectorDir,this.vel.mag());
                }
                else if(this.deflectingTimer === 60) {
                    this.pos.set(999999, 99999);//don't hit me pleeeease
                }
            }
            this.vel.mult(1.8 / this.vel.mag())
            this.rockPos.add(this.vel);
            if(Math.abs(this.rockPos.x) > l2.x - this.size) {
                //horizontal collision
                this.vel.x *= -1;
                this.rockPos.x = Math.sign(this.rockPos.x) * (l2.x - this.size);
                soundEffects.bounce.play();
            }
            if(Math.abs(this.rockPos.y) > l2.y - this.size) {
                this.vel.y *= -1;
                this.rockPos.y = Math.sign(this.rockPos.y) * (l2.y - this.size);
                soundEffects.bounce.play();
            }
            this.walkAnim ++;
        },
        init: function() {
            this.health = 3;
            this.size = 2;
            this.mass = 0;
            this.collisions = false;//don't kill player
            this.swordSize = 10;

            this.deflectingTimer = 0;
            this.rockPos = Vect.get(this.pos);
            this.deflectorDir = new Vect();
            this.deflectorDisplayDir = new Vect();
            let theta = Math.random() * Math.PI * 2;
            this.vel.set(Math.cos(theta), Math.sin(theta));
            this.walkAnimSpeed = 10;
        },
        damage: function() {
            this.deflectingTimer = 69;
        }
    }
    
    static controller = {
        display: function() {
            var pos = cam.toScreen(this.pos);

            if(this.deathAnim) {
                this.iframes = NaN;//white
                if(this.deathAnim >= settings.deathDelay - 9) {
                    let frame = Math.floor((this.deathAnim - settings.deathDelay + 9) / 3);
                    ctx.drawImage(
                        assets.death,
                        frame * Player.spriteSize, 0,
                        Player.spriteSize, Player.spriteSize,
                        pos.x - cam.scale * 4,
                        pos.y - cam.scale * 4,
                        cam.scale * 8,
                        cam.scale * 8
                    );
                    return;
                }
            }
            
            //yes tilesheets for rocks :)
            var walkCycle = Math.floor(this.walkAnim / this.walkAnimSpeed) % 4;

            var tilesheetPos = getTilesheetPos(walkCycle, new Vect(Math.round(this.toPlayer.x),Math.round(this.toPlayer.y)));
            Enemy.drawImage(
                assets[this.asset],
                tilesheetPos.x * Player.spriteSize, tilesheetPos.y * Player.spriteSize,
                Player.spriteSize, Player.spriteSize,
                pos.x - cam.scale * 4,
                pos.y - cam.scale * 6,
                cam.scale * 8,
                cam.scale * 8, this.iframes
            );
            /*
            ctx.fillStyle = "red";
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, cam.scale * this.size, 0, Math.PI * 2);
            ctx.fill();
            */

            var particle = function(x, y, o) {
                Particle.squareParticle(x, y, o, "46, 46, 46");
            }
            Particle.AABBParticles(1, particle, new Vect(this.pos.x - 2, this.pos.y - 2), new Vect(4, 4), h100 / 20);
        },
        update: function() {
            if(this.deathAnim) {
                if(this.deathAnim === 1) {
                    this.vel.mult(0.5);
                }
                this.size = NaN;//don't collide
                this.vel.mult(0.8);
                this.pos.add(this.vel);
                
                //<3 walls my beloved
                this.pos.x = limit(this.pos.x, -l2.x + 2, l2.x - 2);
                this.pos.y = limit(this.pos.y, -l2.y - 2, l2.y - 2);
                
                this.deathAnim ++;
                if(this.deathAnim === settings.deathDelay - 5) {
                    soundEffects.kill.play();
                }
                if(this.deathAnim > settings.deathDelay) {
                    this.dead = true;
                }
                return;
            }
            
            var predictedPos = Vect.add(player.pos, Vect.mult(player.vel, 15));
            this.vel.add(Vect.mult(Vect.normalize(Vect.sub(predictedPos, this.pos)), 0.05));

            this.vel.mult(0.98)
            this.pos.add(this.vel);
            if(Math.abs(this.pos.x) > l2.x - this.size) {
                //horizontal collision
                this.vel.x *= -1;
                this.pos.x = Math.sign(this.pos.x) * (l2.x - this.size);
                soundEffects.bounce.play();
            }
            if(Math.abs(this.pos.y) > l2.y - this.size) {
                this.vel.y *= -1;
                this.pos.y = Math.sign(this.pos.y) * (l2.y - this.size);
                soundEffects.bounce.play();
            }
            this.walkAnim ++;
        },
        init: function() {
            this.size = 2;
            let theta = Math.random() * Math.PI * 2;
            this.vel.set(Math.cos(theta), Math.sin(theta));
            this.walkAnimSpeed = 5;
            this.health = 3;
        },
        damage: function() {
            this.vel.sub(Vect.mult(this.toPlayer, 3));
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

            if(this.deathAnim) {
                this.iframes = NaN;//white
                if(this.deathAnim >= settings.deathDelay - 9) {
                    let frame = Math.floor((this.deathAnim - settings.deathDelay + 9) / 3);
                    ctx.drawImage(
                        assets.death,
                        frame * Player.spriteSize, 0,
                        Player.spriteSize, Player.spriteSize,
                        pos.x - cam.scale * 4,
                        pos.y - cam.scale * 4,
                        cam.scale * 8,
                        cam.scale * 8
                    );
                    return;
                }
            }

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
                Enemy.drawImage(
                    assets[this.asset],
                    tilesheetPos.x * Player.spriteSize,
                    tilesheetPos.y * Player.spriteSize,
                    Player.spriteSize,
                    Player.spriteSize,
                    pos.x - cam.scale * 4,
                    pos.y - cam.scale * 4,
                    cam.scale * 8,
                    cam.scale * 8, this.iframes
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
            if(this.deathAnim) {
                if(this.deathAnim === 1) {
                    this.vel.mult(0.5);
                }
                this.size = NaN;//don't collide
                this.vel.mult(0.8);
                this.pos.add(this.vel);
                
                //<3 walls my beloved
                this.pos.x = limit(this.pos.x, -l2.x + 2, l2.x - 2);
                this.pos.y = limit(this.pos.y, -l2.y - 2, l2.y - 2);
                
                this.deathAnim ++;
                if(this.deathAnim === settings.deathDelay - 5) {
                    soundEffects.kill.play();
                }
                if(this.deathAnim > settings.deathDelay) {
                    this.dead = true;
                }
                return;
            }
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
        },
        damage: function() {
            this.vel.sub(Vect.mult(this.toPlayer, 10));
        }
    }
    
    static stack = {
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

            if(this.deathAnim) {
                this.iframes = NaN;//white
                if(this.deathAnim >= settings.deathDelay - 9) {
                    let frame = Math.floor((this.deathAnim - settings.deathDelay + 9) / 3);
                    ctx.drawImage(
                        assets.death,
                        frame * Player.spriteSize, 0,
                        Player.spriteSize, Player.spriteSize,
                        pos.x - cam.scale * 4,
                        pos.y - cam.scale * 4,
                        cam.scale * 8,
                        cam.scale * 8
                    );
                    return;
                }
            }

            if(this.dashCharge) {
                let thing = new Vect(Math.round(this.dashDir.x), Math.round(this.dashDir.y));
                let tilesheetPos = thing.x? thing.x + 2: thing.y === 1? 0: 2;

                ctx.drawImage(
                    assets.twoMini,
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
                Enemy.drawImage(
                    assets.twoMini,
                    tilesheetPos.x * Player.spriteSize,
                    tilesheetPos.y * Player.spriteSize,
                    Player.spriteSize,
                    Player.spriteSize,
                    pos.x - cam.scale * 4,
                    pos.y - cam.scale * 4,
                    cam.scale * 8,
                    cam.scale * 8, this.iframes
                );

                if(this.dashTimer || this.driftTimer) {
                    let thing = new Vect(Math.round(this.dashDir.x), Math.round(this.dashDir.y));
                    let tilesheetPos = thing.x? thing.x + 2: thing.y === 1? 0: 2;
                    for(var i = 0; i < this.dashTrail.length; i ++) {
                        let pos = cam.toScreen(this.dashTrail[i][0]);

                        let stuffTime = stateSwitchTimer - this.dashTrail[i][1];
                        ctx.globalAlpha = Math.exp(-stuffTime / 10) * 0.5;
                        ctx.drawImage(
                            assets.twoMini,
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
            if(this.deathAnim) {
                if(this.deathAnim === 1) {
                    this.vel.mult(0.5);
                }
                this.size = NaN;//don't collide
                this.vel.mult(0.8);
                this.pos.add(this.vel);
                
                //<3 walls my beloved
                this.pos.x = limit(this.pos.x, -l2.x + 2, l2.x - 2);
                this.pos.y = limit(this.pos.y, -l2.y - 2, l2.y - 2);
                
                this.deathAnim ++;
                if(this.deathAnim === settings.deathDelay - 5) {
                    soundEffects.kill.play();
                }
                if(this.deathAnim > settings.deathDelay) {
                    this.dead = true;
                }
                return;
            }
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
                let moveAmt = 0.25;
                if(this.driftTimer > 0) {
                    moveAmt *= 0.2;
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
            this.health = 3;
            this.size = 1.5;
            this.walkAnimSpeed = 7;

            this.dashCharge = 0;
            this.dashTimer = 0;//when you actually dash;
            this.driftTimer = 0;
            this.dashDir = new Vect();

            this.dashTrail = [];
        },
        damage: function() {
            this.vel.sub(Vect.mult(this.toPlayer, 3));
            if(this.health <= 0) {
                let bob = new Enemy(this.pos.x, this.pos.y, "small");
                let joe = new Enemy(this.pos.x, this.pos.y, "small");
                bob.iframes = 60;
                joe.iframes = 60;
                enemies.push(bob);
                enemies.push(joe);
                player.vel.add(Vect.mult(this.toPlayer, 2));
                player.stun = 10;
            }
        }
    }
    
    static barbarian = {
        drawDanger: function() {
            if(this.dashCharge && this.dashCharge % 10 < 8) {
                var pos = cam.toScreen(this.pos);
                //red rectangle (THE BATTLE CATS!!!)
                ctx.fillStyle = "rgba(255, 0, 0, 0.15)";//real transparent red (not clickbait)
                ctx.save();
                ctx.translate(pos.x, pos.y + cam.scale * 2);
                ctx.rotate(Math.atan2(this.dashDir.y, this.dashDir.x));
                ctx.fillRect(-cam.scale * 2.5, -cam.scale * 2.5, cam.scale * 35, 5 * cam.scale);
                ctx.restore();
            }
        },
        display: function() {
            let pos = cam.toScreen(this.pos);

            if(this.dashCharge) {
                let thing = new Vect(Math.round(this.dashDir.x), Math.round(this.dashDir.y));
                let tilesheetPos = thing.x? thing.x + 2: thing.y === 1? 0: 2;

                ctx.drawImage(
                    assets.barbarian,
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
                    assets.barbarian,
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
                else if(dst < 10) {
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
                if(this.dashCharge > 15) {
                    this.dashCharge = 0;
                    this.dashTimer ++;
                    this.vel.set(Vect.mult(this.dashDir, 3));

                    soundEffects.smallDash.play();
                }
            }
            else if(this.dashTimer) {
                this.dashTimer ++;
                if(this.dashTimer > 10) {
                    this.dashTimer = 0;
                    this.driftTimer = 0;
                    this.vel.mult(0.6);
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
    static sword = {
        drawDanger: function() {
        },
        display: function() {
            let pos = cam.toScreen(this.pos);
        
            if(this.deathAnim) {
                this.iframes = NaN;//white
                if(this.deathAnim >= settings.deathDelay - 9) {
                    let frame = Math.floor((this.deathAnim - settings.deathDelay + 9) / 3);
                    ctx.drawImage(
                        assets.death,
                        frame * Player.spriteSize, 0,
                        Player.spriteSize, Player.spriteSize,
                        pos.x - cam.scale * 4,
                        pos.y - cam.scale * 4,
                        cam.scale * 8,
                        cam.scale * 8
                    );
                    return;
                }
            }

            var walkCycle = Math.floor(this.walkAnim / this.walkAnimSpeed) % 4;

            var tilesheetPos = getTilesheetPos(walkCycle, new Vect(Math.round(this.toPlayer.x),Math.round(this.toPlayer.y)));
            
            //ctx.fillStyle = "red";
            //ctx.fillRect(pos.x - cam.scale * 2, pos.y - cam.scale * 2, cam.scale * 4, cam.scale * 4);
            Enemy.drawImage(
                assets[this.swording? "swordless": this.asset],
                tilesheetPos.x * Player.spriteSize,
                tilesheetPos.y * Player.spriteSize,
                Player.spriteSize,
                Player.spriteSize,
                pos.x - cam.scale * 4,
                pos.y - cam.scale * 4,
                cam.scale * 8,
                cam.scale * 8, this.iframes
            );

            if(this.swording && !this.deathTimer) {
                ctx.save();
                ctx.translate(pos.x, pos.y);
                ctx.rotate(this.swordDir + Math.PI / 2);///it points up so im in pain

                var opacity = limit(this.swordTimer - 20, 0, 20) / 20;
                ctx.globalAlpha = 1-easings.easeOutQuad(opacity);

                ctx.drawImage(assets.weapons, Player.spriteSize * 2, 0, Player.spriteSize, Player.spriteSize,
                     -this.swordSize / 2 * cam.scale, -cam.scale * 3 - this.swordSize * cam.scale,
                    this.swordSize * cam.scale, this.swordSize * cam.scale
                )

                ctx.restore();
                /*
                ctx.fillStyle = "red";
                if(this.swordTimer < 15) {
                    ctx.beginPath();
                    ctx.arc(pos.x + Math.cos(this.swordDir) * this.swordSize * cam.scale, pos.y + Math.sin(this.swordDir) * this.swordSize * cam.scale, cam.scale * 3, 0, Math.PI * 2);
                    ctx.fill();
                }
                */
            }
        },

        update: function(toPlayer, dst) {
            if(this.deathAnim) {
                if(this.deathAnim === 1) {
                    this.vel.mult(0.5);
                }
                this.size = NaN;//don't collide
                this.vel.mult(0.8);
                this.pos.add(this.vel);
                
                //<3 walls my beloved
                this.pos.x = limit(this.pos.x, -l2.x + 2, l2.x - 2);
                this.pos.y = limit(this.pos.y, -l2.y - 2, l2.y - 2);
                
                this.deathAnim ++;
                if(this.deathAnim === settings.deathDelay - 5) {
                    soundEffects.kill.play();
                }
                if(this.deathAnim > settings.deathDelay) {
                    this.dead = true;
                }
                return;
            }

            this.vel.mult(0.5);
            let moveAmt = 0.2 * (this.swording? 0.1: 1);
            this.vel.add(Vect.mult(toPlayer, moveAmt));
            this.pos.add(this.vel);

            //wall colllide
            this.pos.x = limit(this.pos.x, -l2.x + this.size, l2.x - this.size);
            this.pos.y = limit(this.pos.y, -l2.y - this.size, l2.y - this.size);

            ///anim
            if(!this.swording) {
                this.walkAnim ++;
            }
            else {
                this.walkAnim = 0;
            }

            if(this.swordReload > 0) {
                this.swordReload --;
            }
            else if(dst < 15 && !this.swording) {
                this.swording = true;
                this.swordTargetDir = Math.atan2(player.pos.y - this.pos.y, player.pos.x - this.pos.x);
                this.swordDir = this.swordTargetDir - Math.PI / 4;
                this.swordVel = -0.5;
                this.swordWindup = 1;
            }
            else if(this.swordWindup) {
                this.swordWindup ++;
                this.swordVel += 0.05;
                this.swordDir += this.swordVel;
                if(this.swordWindup >= 20) {
                    this.swordWindup = 0;
                    this.swordTimer = 1;
                    this.swordVel = 0.7;
                }
            }
            else if(this.swordTimer) {
                this.swordTimer ++;
                this.swordDir += this.swordVel;
                if(this.swordDir > this.swordTargetDir + Math.PI) {
                    this.swordVel *= 0.8;
                }
                if(this.swordTimer > 40) {
                    this.swording = false;
                    this.swordTimer = 0;
                    this.swordReload = 20;
                }
                else if(this.swordTimer < 15) {
                    var p = new Vect(
                        this.pos.x + Math.cos(this.swordDir) * this.swordSize,
                        this.pos.y + Math.sin(this.swordDir) * this.swordSize
                    );
                    /*
                    ctx.beginPath();
                    ctx.arc(pos.x + Math.cos(this.swordDir) * this.swordSize * cam.scale, pos.y + Math.sin(this.swordDir) * this.swordSize * cam.scale, cam.scale * 3, 0, Math.PI * 2);
                    ctx.fill();
                    */
                    if(sqrDist(p.x, p.y, player.pos.x, player.pos.y) < (player.size + 2) * (player.size + 2)) {
                        //die
                        player.damage();
                    }
                }
            }
        },
        init: function() {
            this.health = 3;
            this.size = 2.25;
            this.walkAnimSpeed = 10;
            this.swording = false;
            this.swordWindup = 0;
            this.swordTimer = 0;
            this.swordDir = 0;
            this.swordTargetDir = 0;
            this.swordVel = 0;
            this.swordSize = 10;
            this.swordReload = 0;
        },
        damage: function() {
            this.vel.sub(Vect.mult(this.toPlayer, 10));
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
        this.health = 1;
        this.collisions = true;
        this.mass = 1;//0 means don't collide (i'm not doing actual mass physics it's just whoever's heavier doesn't get moved)

        this.dead = false;
        this.deathAnim = 0;
        this.type.init.call(this);

        this.iframes = 0;
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
        this.iframes = Math.max(this.iframes - 1, 0);
    }

    damage(amt) {
        this.health -= amt;
        this.iframes = 40;
        if(this.type.damage) {
            this.type.damage.call(this);
        }
        if(this.health <= 0) {
            this.deathAnim = 1;
            console.log("i dead");
        }
    }
};
var enemies = [];
var roundEnemies = [];
