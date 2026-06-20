var screenshake = {
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    shake(mag, dx, dy) {
        mag *= settings.screenshakeMult;
        var dir = arguments.length !== 1? Math.atan2(dy, dx): Math.random() * Math.PI * 2;
        this.vx += Math.cos(dir) * mag;
        this.vy += Math.sin(dir) * mag;
    },
    update: function() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.8;
        this.vy *= 0.8;
        this.vx -= this.x / 3;
        this.vy -= this.y / 3;
    }
};