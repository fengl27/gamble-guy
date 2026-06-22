class Button {
    constructor(x,y,w,h,txt,col) {
        this.p = new Vect(x, y);
        this.s = new Vect(w, h);
        this.txt = txt;
        this.hovered = false;
        this.baseCol = col/* || "rgb(150, 150, 150)"*/ || "#4A90E2";
    }

    go() {
        ctx.strokeStyle = "black";
        ctx.lineWidth = h100 * 2;
        var hovered = mouse.x > this.p.x &&
                mouse.x < this.p.x+this.s.x &&
                mouse.y > this.p.y &&
                mouse.y < this.p.y+this.s.y;

        if(this.hovered !== hovered) {
            this.hovered = hovered;
            soundEffects.buttonHover.play();
        }
        ctx.fillStyle = this.baseCol;
        //specifically stroke first
        ctx.strokeRect(this.p.x, this.p.y, this.s.x, this.s.y);
        ctx.fillRect  (this.p.x, this.p.y, this.s.x, this.s.y);

        var shadow = "rgba(0,0,0,0.2)";
        var highlight = "rgba(255,255,255,0.2)";
        var borderWidth = h100;
        ctx.fillStyle = hovered? shadow: highlight;
        ctx.beginPath();
        ctx.rect(this.p.x, this.p.y, this.s.x, borderWidth);
        ctx.rect(this.p.x, this.p.y, borderWidth, this.s.y);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = hovered? highlight: shadow;
        ctx.beginPath();
        ctx.rect(this.p.x+this.s.x-borderWidth, this.p.y + borderWidth, borderWidth, this.s.y-borderWidth);
        ctx.rect(this.p.x + borderWidth, this.p.y+this.s.y-borderWidth, this.s.x-borderWidth, borderWidth);
        ctx.closePath();
        ctx.fill();

        /*
        //draw a rectangle over it
        ctx.fillStyle = `rgba(0,0,0,${hovered? mouse.pressed? 0.2: 0.1: 0})`;
        ctx.fillRect(this.p.x, this.p.y, this.s.x, this.s.y);
        */
        
        //text
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = this.s.y + "px pixelFont";
        var offset = hovered * borderWidth / 2;

        ctx.fillStyle = "black";
        ctx.fillText(this.txt, this.p.x+this.s.x/2+offset + h100/5, this.p.y+this.s.y*0.55+offset + h100/3);
        ctx.fillStyle = "white";
        ctx.fillText(this.txt, this.p.x+this.s.x/2+offset, this.p.y+this.s.y*0.55+offset);
    }

    get pressed() {
        if(mouse.justPressed && mouse.x > this.p.x &&
                mouse.x < this.p.x+this.s.x &&
                mouse.y > this.p.y &&
                mouse.y < this.p.y+this.s.y
        ) {
            soundEffects.buttonClick.play();
            return true;
        }
        return false;
    }
}