"use strict";
var Object = require('../lib/object.js');
var Vector = require('../lib/vector.js');
var mapArr = require('../lib/map.js');
var Ball = require('../lib/ball');
var c = require('../lib/config.json');

//var towerMap = require('../lib/towerMap.js');

var groundFriction = c.groundFriction;
var airFriction = c.airFriction;
var iceFriction = c.iceFriction;
var gravity = new Vector(0, c.gravity);

class Player extends Object {
  constructor(setVector, mass) {
    super();
    this.location = setVector.copy();
    this.velocity = new Vector(0, 0);
    this.acceleration = new Vector(0, 0);
    this.mass = mass;
    this.flying = true;
    this.elasticity;
    this.jumpHeight = c.jumpHeight;
    this.speed = c.speed;
    this.vLocation = this.location.copy(); // vLocation is only uesed for draw real info is just location
    this.nowImageIndex;
    this.balls = [];
    this.press = {
      65: false,
      87: false,
      68: false
    };
    this.lastKeyPress="";
    this.throwPower = c.throwPower;
    this.throwDemage = c.throwDemage;
    this.hp = c.hp;
    this.socketId;
    this.score = 0;
    this.nickName = "";
    this.live = true;
    this.maxBallCount = c.maxBallCount;
    this.nowBallCount = 0;
    this.maxHp = c.maxHp;
    this.recoveryHpAblilty = c.recoveryHpAblilty;
    this.level = 1;
    this.nextLevelScore = c.nextLevelScore;
    this.ballHp = c.ballHp;
    this.jumpDemage = c.jumpDemage;
    this.skillPoint = 0;
    this.recoveryHp();
    this.team;
    this.walking = false;
    this.walkingIndex = 0;
  }

  update() {
    if (this.flying) {
      this.acceleration.x += this.getFriction(airFriction, this.velocity).x;
    }
    this.applyForth(gravity);
    this.velocity.add(this.acceleration);
    this.location.add(this.velocity);
    this.acceleration.mult(0);
    if(!this.press[68] && !this.press[65]){
      this.walking = false;
    }
  }

  checkHp() {
    if (this.hp <= 0) {
      this.live = false;
    }
  }

  checkScore() {
    //레벨업 공식 = n레벨 경험치 = n-1 경험치 *1.5
    //2레벨 경험치 = 100
    if (this.score >= this.nextLevelScore) {
      this.level++;
      this.skillPoint++;
      this.nextLevelScore = Math.round(this.nextLevelScore * c.levelUpRate);

      return true;
    }
    return false;
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

  checkImage() {  //65 left a, 84 top w, 68 right d
    if(this.team == "A"){
      if (!(this.flying) && !(this.walking)) {
        if ((this.velocity.x >= 0) && this.lastKeyPress == "right") {
          this.nowImageIndex = 8;
        } else if ((this.velocity.x < 0) && this.lastKeyPress == "left") {
          this.nowImageIndex = 17;
        }
      }

      if (this.flying) { //flying state
        if ((this.velocity.x >= 0) && this.lastKeyPress == "right") {
          this.nowImageIndex = 5;
        } else if ((this.velocity.x < 0) && this.lastKeyPress == "left") {
          this.nowImageIndex = 14;
        }
      }
    } else if(this.team == "B"){
      if (!(this.flying) && !(this.walking)) {

        if ((this.velocity.x >= 0) && this.lastKeyPress == "right") {
          this.nowImageIndex = 4;
        } else if ((this.velocity.x < 0) && this.lastKeyPress == "left") {
          this.nowImageIndex = 13;
        }
      }

      if (this.flying) { //flying state
        if ((this.velocity.x >= 0) && this.lastKeyPress == "right") {
          this.nowImageIndex = 1;
        } else if ((this.velocity.x < 0) && this.lastKeyPress == "left") {
          this.nowImageIndex = 10;
        }
      }
    }
  }

  walkingAnimation(){
    if(this.walking){
      this.walkingIndex++;
      if(this.walkingIndex >= 2){
        this.walkingIndex = -1;
      }

      console.log("index = "+this.walkingIndex+1);

      if(this.team == "A"){
        if(this.lastKeyPress == "right"){
          this.nowImageIndex = c.ARightWalkAnimation[this.walkingIndex+1];
        } else if (this.lastKeyPress == "left") {
          this.nowImageIndex = c.ALedtWalkAnimation[this.walkingIndex+1];
        }
      } else if(this.team == "B"){
        if(this.lastKeyPress == "right"){
          this.nowImageIndex = c.BRightWalkAnimation[this.walkingIndex+1];
        } else if (this.lastKeyPress == "left") {
          this.nowImageIndex = c.BLedtWalkAnimation[this.walkingIndex+1];
        }
      }
    }
  }


  checkEdge() {
    if (this.location.y - this.mass < 3) {
      this.location.y = this.location.y;
      this.velocity.y = 0.1;
    }

    try {
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
    } catch (e) {

    }

    try {
      var nowPosition = mapArr[Math.floor((this.location.y - this.mass) / 32)][Math.floor(this.location.x / 32)];
      if (!(nowPosition == 0)) { // y impact check top
        this.location.y = this.location.y + 1;
        this.velocity.y = 0;
      }
    } catch (e) {

    }

    try {
      var nowPositionX = mapArr[Math.floor(this.location.y / 32)][Math.floor((this.location.x + this.mass) / 32)];
      if (!(nowPositionX == 0)) { // x impact sheck right
        this.location.x = this.location.x - 1;
        this.velocity.x = 0;
        // let reverseVector = this.velocity.copy();
        // reverseVector.mult(-);
        // console.log("velocity = "+this.velocity.x+", "+this.velocity.y);
        // console.log("reverseVector = "+reverseVector.x+", "+reverseVector.y);
        //this.applyForth(reverseVector);
      //  this.velocity.x += reverseVector.x;
      } else{
      }
    } catch (e) {

    }

    try {
      var nowPositionX = mapArr[Math.floor(this.location.y / 32)][Math.floor((this.location.x - this.mass) / 32)];
      if (!(nowPositionX == 0)) { // x impact check left
        this.location.x = this.location.x + 1;
        this.velocity.x = 0;
      }
    } catch (e) {

    }

  }

  run(ballArr) {
    this.pressUpdate(); // 키보드 press
    this.update();
    this.vLocationUpdate();
    this.checkEdge(this.location.x, this.location.y);
    this.checkImage();
    this.checkHp();
    this.checkScore();
  }

  // check jump attack
  checkOtherPlayer(player) {
    if (this.velocity.y >= 0 && (this.location.y + this.mass * 2 < player.location.y + 10 && this.location.y + this.mass * 2 >= player.location.y) &&
      (this.location.x + this.mass > player.location.x && this.location.x + this.mass < player.location.x + player.mass * 2)
    ) {
      //&& this.location.y+this.mass*2-1 <= player.location.y
      if (this.team != player.team) {
        player.hp -= this.jumpDemage;
        this.score += 10;
      }
      this.velocity.mult(-1);
    }

    if(player.socketId != this.socketId && Vector.subStatic(this.location, player.location).mag() < player.mass){
      //player.applyForth(this.velocity);
      if(player.location.x < this.location.x){
        player.location.x = this.location.x - player.mass;
      } else if(player.location.x > this.location.x){
        player.location.x = this.location.x + player.mass;
      }
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
    if (this.press[87]) {
      if (!(this.flying)) {
        this.applyForth(new Vector(0, -(this.jumpHeight)));
      }
      this.flying = true;
    }

    if (this.press[65]) {
      var left = new Vector(-(this.speed), 0);
      this.applyForth(left);
      this.lastKeyPress = "left";
      this.walking = true;
    }

    if (this.press[68]) {
      var right = new Vector(this.speed, 0);
      this.applyForth(right);
      this.lastKeyPress = "right";
      this.walking = true;
    }
  }

  throwBall(pointX, pointY) {
    var newBall = new Ball(this.location.x, this.location.y, this.throwPower, this.throwDemage, this.ballHp, new Vector(pointX, pointY), this.socketId, this.team);
    this.balls.push(newBall);
    return newBall;
  }

  recoveryHp() {
    setInterval(() => {
      if (this.hp < this.maxHp) {
        if (this.maxHp - this.hp < this.recoveryHpAblilty) {
          this.hp += this.maxHp - this.hp;
        } else {
          this.hp += this.recoveryHpAblilty;
        }
      }

    }, 2000)
  }

}

module.exports = Player;
