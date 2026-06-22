var particles = [];
class Particle {
    static squareParticle = function(x, y, o, c) {
        ctx.lineWidth = h100 / 3;
        ctx.fillStyle = `rgba(${c}, ${o})`;
        ctx.strokeStyle = `rgba(48, 48, 48, ${o})`;
        ctx.beginPath();
        ctx.rect(x - h100, y - h100, h100*2, h100*2);
        ctx.fill();
        ctx.stroke();
    }

    static spawnParticles = function(num, disp, x, y, v) {
        for(var i = 0; i < num; i ++) {
            particles.push(new Particle(disp, x, y, v));
        }
    }

    static AABBParticles = function(num, disp, pos, size, v) {
        for(var i = 0; i < num; i ++) {
            particles.push(new Particle(disp, pos.x + Math.random() * size.x, pos.y + Math.random() * size.y, v));
        }
    }

    static runParticles = function() {
        for(var i = particles.length - 1; i >= 0; i --) {
            if(particles[i].go()) {
                particles.splice(i, 1);
            }
        }
    }

    constructor(disp, x, y, v) {
        this.vel = new Vect(Math.random() * v - v/2, Math.random() * v - v/2);
        this.pos = new Vect(x, y);
        this.disp = disp;
        this.timeToLive = 20 + Math.random() * 20;
        this.fadeTime = 10;
    }
    
    go() {
        this.pos.add(this.vel);
        this.vel.y *= 0.95;
        this.vel.x *= 0.95;

        this.timeToLive --;
        var opacity = Math.min(1, this.timeToLive / this.fadeTime);
        let p = cam.toScreen(this.pos);
        this.disp(p.x, p.y, opacity);

        if(this.timeToLive <= 0) {
            return true;
        }
    }
}
class CircleParticle {
    constructor(x, y) {
        this.pos = new Vect(x, y);
        this.timeToLive = 20;
        this.vel = h100 * 3;
        this.size = 0;
        //console.log("HI I EXIsdfasdfaST");
    }
    
    go() {
        //console.log("HI I EXIST");
        this.size += this.vel;
        this.vel *= 0.8;

        this.timeToLive --;
        if(this.timeToLive < 0) {
            return true;
        }

        var opacity = this.timeToLive / 50;
        ctx.lineWidth = 1.5 * h100;
        ctx.strokeStyle = "rgba(200, 200, 200, " + opacity + ")";
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.size, 0, Math.PI * 2);
        ctx.stroke();
    }
}