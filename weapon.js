const weapons = {
    sword: {
        selected: false,
        dir: Math.random() * Math.PI * 2,
        dirVel: 0,
        swordSize: 10,
        update: function(selected) {    
            this.selected = selected;
            this.dirVel += ((this.selected? 0.15: 0.05) - this.dirVel) / 10;
            this.dir += this.dirVel;

            let cPoss = [
                new Vect(player.pos.x + Math.cos(this.dir) * this.swordSize, player.pos.y + Math.sin(this.dir) * this.swordSize),
                new Vect(player.pos.x + Math.cos(this.dir) * this.swordSize / 2, player.pos.y + Math.sin(this.dir) * this.swordSize / 2),
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
            var pos = cam.toScreen(player.pos);
            ctx.save();
            ctx.translate(pos.x, pos.y);
            ctx.rotate(this.dir + Math.PI / 2);///it points up so im in pain

            var opacity = limit(this.swordTimer - 20, 0, 20) / 20;
            ctx.globalAlpha = 1-easings.easeOutQuad(opacity);

            let args = [assets.weapons, Player.spriteSize * 2, 0, Player.spriteSize, Player.spriteSize,
                    -this.swordSize / 2 * cam.scale, -cam.scale * 3 - this.swordSize * cam.scale,
                    this.swordSize * cam.scale, this.swordSize * cam.scale
            ];
            if(this.selected) {
                ctx.drawImage(...args);
            }
            else {
                drawGrayedImage(...args);
            }

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
    }
};