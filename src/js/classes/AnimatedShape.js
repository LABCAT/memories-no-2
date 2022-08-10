export default class AnimatedShape {

    animationTypes = [
      'pull-left',  
      'pull-right',  
      'pull-down',  
      'pull-up',  
    ];

    constructor(p5, x, y, size, shapeType, colour) {
        this.p = p5;
        this.x = x;
        this.y = y;
        this.size = size;
        this.shapeType = shapeType;
        this.colour = colour;
        this.speed = 100;

        if(this.animationType === 'pull-left') {
            this.destX = this.x;
            this.x = this.p.width;
        }

        if(this.animationType === 'pull-right') {
            this.destX = this.x;
            this.x = 0;
        }

        if(this.animationType === 'pull-down') {
            this.destY = this.y;
            this.y = 0;
        }

        if(this.animationType === 'pull-up') {
            this.destY = this.y;
            this.y = this.p.height;
        }
    }

    update() {
        if(this.animationType === 'pull-left' && this.x < this.destX) {
            if((this.x - this.speed) < this.destX) {
                this.x = this.destX;
            }
            else {
                this.x = this.x - this.speed;    
            }
        }

        if(this.animationType === 'pull-right' && this.x > this.destX) {
            if((this.x + this.speed) > this.destX) {
                this.x = this.destX;
            }
            else {
                this.x = this.x + this.speed;
            }
        }

        
        if(this.animationType === 'pull-down' && this.y < this.destY) {
            if((this.y + this.speed) > this.destY) {
                this.y = this.destY;
            }
            else {
                this.y = this.y + this.speed;
            }
        }

        if(this.animationType === 'pull-up' && this.y > this.destY) {
            if((this.y - this.speed) < this.destY) {
                this.y = this.destY;
            }
            else {
                this.y = this.y - this.speed;
            }
        }
    }

    draw() {
        this.p.stroke(this.colour[0], this.colour[1], this.colour[2]);
        this.p[this.shapeType](this.x, this.y, this.size, this.size);
    }
}