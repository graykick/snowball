var Object = require('../lib/object.js');
var Vector = require('../lib/vector.js');
var mapArr = require('../lib/map.js');

var gravity = new Vector(0, 2);

class Ball extends Object{

    constructor(x, y, power, mouse){
        super();
        this.acceleration = new Vector(0,0);
        this.velocity = new Vector(0,0);
        this.location = new Vector(x,y);
        this.mouse = mouse;
        this.power = power;
        this.mass = 15;
        this.dir =  Vector.subStatic(this.mouse, this.location);
        this.dir.nomalize();
        this.dir.mult(this.power);
        this.live = true;
    }

    update(){
        this.applyForth(gravity);
        this.acceleration = this.dir;
        this.velocity.add(this.acceleration);
        this.velocity.limit(3);
        this.location.add(this.velocity);
        this.live = true;
    }

    draw(){
        ctx.save();
        ctx.beginPath();
        /*ctx.arc(this.location.x,this.location.y, this.mass, 0, Math.PI*2, true);
        ctx.fillStyle = "black";
        ctx.fill();*/
        ctx.restore();
    }

    checkEdge() {
        if(this.location.y-this.mass<3){
            this.location.y = this.location.y;
            this.velocity.y = 0.1;
        }

        var nowPosition = mapArr[Math.floor((this.location.y + this.mass) / 32)][Math.floor(this.location.x / 32)];
        console.log(this.live+"   in ball state");
        if (!(nowPosition == 0)) { // y impact check bottom
            console.log("1");
            this.live = false;
        }

        nowPosition = mapArr[Math.floor((this.location.y - this.mass) / 32)][Math.floor(this.location.x / 32)];
        if (!(nowPosition == 0)) { // y impact check top
            console.log("2");
            this.live = false;
        }

        var nowPositionX = mapArr[Math.floor(this.location.y / 32)][Math.floor((this.location.x + this.mass) / 32)];
        if (!(nowPositionX == 0)) { // x impact sheck right
            console.log("3");
            this.live = false;
        }

        nowPositionX = mapArr[Math.floor(this.location.y / 32)][Math.floor((this.location.x - this.mass) / 32)];
        if(!(nowPositionX == 0 )){ // x impact check left
            console.log("4");
            this.live = false;
        }
    }


    run(){
        this.update();
        this.checkEdge();
//        this.draw();
    }
}

module.exports = Ball;