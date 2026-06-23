class Coin {
    constructor(x, y) {
        this.pos = new Vect(x,y);
        this.vel = new Vect(Math.random() * 2 - 1, Math.random() * 2 - 1);
        this.rot = 0;
        this.yOffset = 0;
        this.yVel = -2 - Math.random() * 1;
        this.spawnTimer = 0;
    }

    display() {
        let pos = cam.toScreen(this.pos);
        ctx.save();
        ctx.translate(pos.x, pos.y + this.yOffset * cam.scale);
        ctx.rotate(this.rot);
        ctx.drawImage(assets.coin, -cam.scale*1.5, -cam.scale*1.5, cam.scale * 3, cam.scale * 3);
        ctx.restore();
    }

    update() {
        this.spawnTimer ++;
        this.rot += this.vel.x / 4;

        this.vel.mult(0.8);
        let diff = Vect.sub(player.pos, this.pos);
        if(diff.sqrMag() < 100 && this.spawnTimer > 30) {
            if(diff.sqrMag() < 16) {
                this.dead = true;
                soundEffects.coinPickup.play();
                playerStuff.coins ++;
            }
            diff.div(10);
            this.vel.add(diff);
        }

        this.pos.add(this.vel);

        this.yVel += 0.2;
        this.yOffset += this.yVel;
        if(this.yOffset > 0) {
            if(this.yVel > 0.5) {
                soundEffects.coinBounce.play();
            }
            this.yVel *= -0.5;
            this.yOffset = 0;
        }
    }
}
var coins = [];