var Object = require('../lib/object.js');
var Vector = require('../lib/vector.js');
var mapArr = require('../lib/map.js');
var Ball = require('../lib/ball');


var groundFriction = 0.1;
var airFriction = 0.08;
var iceFriction = 0.001;
var gravity = new Vector(0, 2);

class Player extends Object {
    constructor(setVector, mass) {
        super();
        this.location = setVector.copy();
        this.velocity = new Vector(0, 0);
        this.acceleration = new Vector(0, 0);
        this.mass = mass;
        this.flying = true;
        this.elasticity;
        this.jumpHeight = 150;
        this.speed = 10;
        this.vLocation = this.location.copy(); // vLocation is only uesed for draw real info is just location
        this.nowImageIndex = 0;
        this.balls = [];
        this.press = {
            65: false,
            87: false,
            68: false
        };
        this.throwPower = 500;
        this.throwDemage = 30;
        this.id;
        this.hp = 100;
        this.socketId;
        this.score = 0;
        this.nickname;
    }

    update() {
        if (this.flying) {
            this.acceleration.x += this.getFriction(airFriction, this.velocity).x;
        }
        this.applyForth(gravity);
        this.velocity.add(this.acceleration);
        this.location.add(this.velocity);
        this.acceleration.mult(0);
    }

    vLocationUpdate() {
        // vLocation left rught max sync
        if (this.location.x - 670 < 0) {
            this.vLocation.x = this.location.x;
        } else if (this.location.x + 670 > 3200) {
            this.vLocation.x = this.location.x - 1860;
        } else {
            this.vLocation.x = 670; // middle of canvas
        }

    }

    checkImage() {
        var state = "stop";
        if (!(this.flying) && (state == "stop")) {
            if (this.velocity.x >= 0) {
                this.nowImageIndex = 8;
            } else if (this.velocity.x < 0) {
                this.nowImageIndex = 17;
            }
        }

        if (this.flying) { //flying state
            if (this.velocity.x >= 0) {
                this.nowImageIndex = 0;
            } else if (this.velocity.x < 0) {
                this.nowImageIndex = 9;
            }
        }
    }

    checkEdge() {
        if (this.location.y - this.mass < 3) {
            this.location.y = this.location.y;
            this.velocity.y = 0.1;
        }

        var nowPosition = mapArr[Math.floor((this.location.y + this.mass) / this.mass)][Math.floor(this.location.x / this.mass)];
        if (!(nowPosition == 0)) { // y impact check bottom
            this.location.y = Math.floor(this.location.y / this.mass) * this.mass;
            this.velocity.y = -(this.velocity.y / 5); // 탄성 상수를 통해 정도를 조절가능
            if (nowPosition <= 14) { // 얼음 조각들은 모두 id 14를 넘지 않음
                this.acceleration.x += this.getFriction(iceFriction, this.velocity).x; //add friction only X
            } else {
                this.acceleration.x += this.getFriction(groundFriction, this.velocity).x; //add friction only X
            }
            this.flying = false; // 땅에 닿았으므로 날고있지 않음
        } else {
            this.flying = true;
        }

        nowPosition = mapArr[Math.floor((this.location.y - this.mass) / 32)][Math.floor(this.location.x / 32)];
        if (!(nowPosition == 0)) { // y impact check top
            this.location.y = this.location.y + 1;
            this.velocity.y = 0;
        }

        var nowPositionX = mapArr[Math.floor(this.location.y / 32)][Math.floor((this.location.x + this.mass) / 32)];
        if (!(nowPositionX == 0)) { // x impact sheck right
            this.location.x = this.location.x - 1;
            this.velocity.x = 0;
        }

        nowPositionX = mapArr[Math.floor(this.location.y / 32)][Math.floor((this.location.x - this.mass) / 32)];
        if (!(nowPositionX == 0)) { // x impact check left
            this.location.x = this.location.x + 1;
            this.velocity.x = 0;
        }

    }

    run(ballArr) {
        this.pressUpdate(); // 키보드 press
        this.update();
        this.vLocationUpdate();
        this.checkEdge(this.location.x, this.location.y);
        this.checkImage();
        //this.checkBalls(ballArr);
        //  this.ballCheck();
        //this.draw();
    }

    checkBalls(ballArr) {
        for (var loop = 0; loop < ballArr.length; loop++) {
            if (Vector.subStatic(this.location, ballArr[loop].location).mag() < this.mass + ballArr[loop].mass) {
                console.log("subStatic = " + Vector.subStatic(this.location, ballArr[loop].location).mag());
                console.log("this.mass type = " + typeof this.mass);
                console.log("ball.mass type = " + typeof ballArr[loop].mass);
                var radius = this.mass + ballArr[loop].mass;
                console.log("radius = " + radius);
                console.log("boom");
                ballArr[loop].live = false;
            }
        }
    }

    pressUpdate() { //65 left a, 84 top w, 68 right d
        if (this.press[65]) {
            var left = new Vector(-(this.speed), 0);
            this.applyForth(left);
        }

        if (this.press[87]) {
            if (!(this.flying)) {
                this.applyForth(new Vector(0, -(this.jumpHeight)));
            }
            this.flying = true;
        }

        if (this.press[68]) {
            var right = new Vector(this.speed, 0);
            this.applyForth(right);
        }
    }

    throwBall(pointX, pointY) {
        var newBall = new Ball(this.location.x, this.location.y, this.throwPower, new Vector(pointX, pointY), this.id, this.socketId);
        this.balls.push(newBall);
        return newBall;
    }
}

module.exports = Player;
