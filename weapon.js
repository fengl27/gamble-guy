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
    },
    
    mace: {
        selected: false,
        pos: new Vect(),
        vel: new Vect(),
        node: Array(3).fill(0).map((thing, idx) => [new Vect(idx * 5, 0), new Vect()]),
        swordSize: 10,
        update: function(selected) {    
            this.selected = selected;
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
                this.vel.sub(Vect.mult(offset,0.05));
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
                    -this.swordSize / 2 * cam.scale, -this.swordSize / 2 * cam.scale,
                    this.swordSize * cam.scale, this.swordSize * cam.scale
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