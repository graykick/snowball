"use strict";
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
        this.throwPower = 300;
        this.throwDemage = 10;
        this.id;
        this.hp = 100;
        this.socketId;
        this.score = 0;
        this.nickName = "";
        this.live = true;
        this.maxBallCount = 4;
        this.nowBallCount = 0;
        this.maxHp = 100;
        this.recoveryHpAblilty = 5;
        this.level = 1;
        this.nextLevelScore = 100;
        this.ballHp = 20;
        this.jumpDemage = 50;
        this.skillPoint = 0;
        this.recoveryHp();
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

  run(ballArr) {
    this.pressUpdate(); // 키보드 press
    this.update();
    this.vLocationUpdate();
    this.checkEdge(this.location.x, this.location.y);
    this.checkImage();
    this.checkHp();

  }

  checkHp(){
    if(this.hp <= 0){
      this.live = false;
    }
  }


  checkScore(){
    //레벨업 공식 = n레벨 경험치 = n-1 경험치 *1.5
    //2레벨 경험치 = 100
    if(this.score >= this.nextLevelScore){
      this.level++;
      this.skillPoint++;
      console.log("skill up "+this.skillPoint);
      this.nextLevelScore = Math.round(this.nextLevelScore*1.5);

      return true;
    }
    return

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
      this.vLocation.y = this.location.y;
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

        try{
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
        } catch(e){

        }

        try{
          var nowPosition = mapArr[Math.floor((this.location.y - this.mass) / 32)][Math.floor(this.location.x / 32)];
          if (!(nowPosition == 0)) { // y impact check top
            this.location.y = this.location.y + 1;
            this.velocity.y = 0;
          }
        } catch(e){

        }

        try{
          var nowPositionX = mapArr[Math.floor(this.location.y / 32)][Math.floor((this.location.x + this.mass) / 32)];
          if (!(nowPositionX == 0)) { // x impact sheck right
            this.location.x = this.location.x - 1;
            this.velocity.x = 0;
          }
        } catch(e){

        }

        try{
          var nowPositionX = mapArr[Math.floor(this.location.y / 32)][Math.floor((this.location.x - this.mass) / 32)];
          if (!(nowPositionX == 0)) { // x impact check left
            this.location.x = this.location.x + 1;
            this.velocity.x = 0;
          }
        } catch(e){

        }

    }

    run(ballArr) {
        this.pressUpdate(); // 키보드 press
        this.update();
        this.vLocationUpdate();
        this.checkEdge(this.location.x, this.location.y);
        this.checkImage();
        if(this.hp <= 0){
          console.log("someon die");
          this.live = false;
        }
    }

    checkBalls(ballArr) {
        for (var loop = 0; loop < ballArr.length; loop++) {
            if (Vector.subStatic(this.location, ballArr[loop].location).mag() < this.mass + ballArr[loop].mass) {

                var radius = this.mass + ballArr[loop].mass;

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
        var newBall = new Ball(this.location.x, this.location.y, this.throwPower, this.throwDemage, this.ballHp, new Vector(pointX, pointY), this.id, this.socketId);
        this.balls.push(newBall);
        return newBall;
    }

     recoveryHp(){
       setInterval(() => {
         if(this.hp < this.maxHp){
           if(this.maxHp-this.hp < this.recoveryHpAblilty){
             this.hp += this.maxHp-this.hp;
           } else {
             this.hp += this.recoveryHpAblilty;
           }
         }

       },2000)
     }

}

module.exports = Player;
