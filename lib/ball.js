"use strict";
var Object = require('../lib/object.js');
var Vector = require('../lib/vector.js');
var mapArr = require('../lib/ballMap.js');
var ballMapArr = require('../lib/map.js');


var groundFriction = 0.1;
var airFriction = 0.08;
var iceFriction = 0.001;
var gravity = new Vector(0, 2);

class Ball extends Object{

    constructor(x, y, power, ballDemage, ballHp, mouse, id, socketId, team){
        super();
        this.acceleration = new Vector(0,0);
        this.velocity = new Vector(0,0);
        this.location = new Vector(x,y);
        this.mouse = mouse;
        this.dir = Vector.subStatic(this.mouse, this.location);
        this.power = power;
        this.mass = 15;
        this.dir.nomalize();
        this.dir.mult(this.power);
        this.live = true;
        this.ownerId = id;
        this.ownerSocketId = socketId;
        this.hp = ballHp;
        this.demage = ballDemage;
        this.team = team;
        this.nowPosition;
    }

    update(){
        this.applyForth(gravity);
        this.acceleration = this.dir;
        this.velocity.add(this.acceleration);
        this.velocity.limit(this.power/80);
        this.location.add(this.velocity);
        this.live = true;
    }

    draw(){
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.location.x,this.location.y, this.mass, 0, Math.PI*2, true);
        ctx.fillStyle = "black";
        ctx.fill();
        ctx.restore();
    }

    checkEdge() {
        if(this.location.y-this.mass<3){
            this.location.y = this.location.y;
            this.velocity.y = 0;
        }

        try {
          this.nowPosition = ballMapArr[Math.floor(this.location.y / 32)][Math.floor(this.location.x / 32)];
          var nowPosition = mapArr[Math.floor(this.location.y / 32)][Math.floor(this.location.x / 32)];
          if(!(nowPosition == 0)){
            this.live = false;
          }
        } catch (e) {
          this.live = false;
        } finally {

        }


        try{
          var nowPosition = mapArr[Math.floor((this.location.y + this .mass) / 32)][Math.floor(this.location.x / 32)];
          if (!(nowPosition == 0)) { // y impact check bottom
              this.live = false;
          }
        } catch(e){
          this.live = false;
        }

        try{
          var nowPosition = mapArr[Math.floor((this.location.y - this.mass) / 32)][Math.floor(this.location.x / 32)];
          if (!(nowPosition == 0)) { // y impact check top
              this.live = false;
          }
        } catch(e){
          this.live = false;
        }

        try{
          var nowPositionX = mapArr[Math.floor(this.location.y / 32)][Math.floor((this.location.x + this.mass) / 32)];
          if (!(nowPositionX == 0)) { // x impact sheck right
              this.live = false;
          }
        } catch(e){
          this.live = false;
        }

        try{
          var nowPositionX = mapArr[Math.floor(this.location.y / 32)][Math.floor((this.location.x - this.mass) / 32)];
          if(!(nowPositionX ==0 )){ // x impact check left
            //  console.log("iam flase");
              this.live = false;
          }
        } catch(e){
          this.live = false;
        }


    }

    checkTowerImpact(tower){

    }


    run(){
        this.update();
        this.checkEdge();
    }
}

module.exports = Ball;
