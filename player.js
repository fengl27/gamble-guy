class Player {
    static spriteSize = 18
    static walkAnimSpeed = 8 //5 frames per walk cycle
    constructor() {
        this.pos = new Vect(0, 0);
        this.vel = new Vect(0, 0);
        this.controls = {
            Up: "w",
            Down: "s",
            Left: "a",
            Right: "d"
        };
        this.weapons = [];
        this.walkAnim = 0;
        this.dir = new Vect();
        this.size = 2.25;//kinda like a radius
    }

    display() {
        var pos = cam.toScreen(this.pos);

        var walkCycle = Math.floor(this.walkAnim / Player.walkAnimSpeed) % 4;

        var tilesheetPos = getTilesheetPos(walkCycle, this.dir);
        ctx.drawImage(
            assets.player,
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

    update() {
        var input = new Vect(
            !!keys[this.controls.Right] - !!keys[this.controls.Left],
            !!keys[this.controls.Down ] - !!keys[this.controls.Up  ]
        );
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
        this.vel.mult(0.5);
        this.vel.add(Vect.mult(input, 0.3));
        this.pos.add(this.vel);

        this.pos.x = limit(this.pos.x, -l2.x + this.size, l2.x - this.size);
        this.pos.y = limit(this.pos.y, -l2.y - this.size, l2.y - this.size);

        for(var i = 0; i < enemies.length; i ++) {
            if(sqrDist(this.pos.x, this.pos.y, enemies[i].pos.x, enemies[i].pos.y) < (this.size + enemies[i].size) * (this.size + enemies[i].size)) {
                //collision
                //ya' die
                this.damage();
            }
        }
    }
    damage() {
        soundEffects.finalKill.play();
        screenshake.shake(15);
        for(var i = 0; i < enemies.length; i ++) {
            enemies[i].dead = true;
        }
    }
};
var player;