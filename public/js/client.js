
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

  draw() {
    ctx.save();
    //vLocation is middle about vLocation;
    ctx.drawImage(skeletonSheet.getSheet(this.nowImageIndex), this.vLocation.x - this.mass, this.location.y - this.mass);
    ctx.restore();
  }

  checkImage() {
    var state = "stop";
    if (!(this.flying) && (state == "stop")) {
      // console.log("sicbank"); // standing state // 콘솔보기 힘들어서 지움
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

  run() {
    this.pressUpdate();
    this.update();
    this.vLocationUpdate();
    this.checkEdge(this.location.x, this.location.y);
    this.checkImage();
    this.draw();
  }

  pressUpdate() { //65 left 84 top 68 right
    if (press[65]) {
      var left = new Vector(-(this.speed), 0);
      this.applyForth(left);
    }

    if (press[87]) {
      if (!(this.flying)) {
        this.applyForth(new Vector(0, -(this.jumpHeight)));
      }
      this.flying = true;
    }

    if (press[68]) {
      var right = new Vector(this.speed, 0);
      this.applyForth(right);
    }

  }

}