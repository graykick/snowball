//window.onload = function() {
    var canvas = document.getElementById('myCanvas');
    var ctx = canvas.getContext('2d');
    var groundFriction = 0.04;
    var airFriction = 0.09;
    var iceFriction = 0.001;

    var mapArr = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 2177, 2178, 2179, 566, 567, 568, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3705, 3700, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2177, 2178, 2179, 2180, 566, 567, 568, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3705, 3700, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2177, 2178, 2179, 566, 567, 568, 0, 0, 0, 0],
        [0, 0, 0, 0, 2181, 2182, 2183, 570, 571, 572, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3755, 3756, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2181, 2182, 2183, 2184, 570, 571, 572, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3721, 3722, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2181, 2182, 2183, 570, 571, 572, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2177, 2178, 2179, 2180, 565, 566, 3759, 3760, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3725, 3726, 2179, 2180, 565, 566, 567, 568, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2177, 2178, 568, 0, 0, 0, 0, 0, 0, 0, 0, 2177, 2178, 568, 0, 0, 0, 2181, 2182, 2183, 2184, 569, 570, 3763, 3764, 0, 0, 0, 2177, 2178, 568, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2177, 2178, 568, 0, 0, 0, 3729, 3730, 2183, 2184, 569, 570, 571, 572, 0, 0, 0, 2177, 2178, 568, 0, 0, 0, 0, 0, 0, 2177, 2178, 568, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2181, 2182, 572, 0, 0, 0, 0, 0, 0, 0, 0, 2181, 2182, 572, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2181, 2182, 572, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2181, 2182, 572, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2181, 2182, 572, 0, 0, 0, 0, 0, 0, 2181, 2182, 572, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 401, 402, 403, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 404, 405, 406, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 407, 408, 409, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [617, 618, 619, 634, 635, 636, 0, 0, 601, 618, 619, 620, 617, 618, 619, 620, 617, 618, 619, 620, 617, 618, 619, 620, 617, 618, 619, 620, 617, 618, 619, 636, 0, 0, 601, 620, 617, 618, 619, 620, 617, 618, 619, 620, 617, 618, 619, 620, 617, 618, 619, 620, 617, 618, 619, 620, 617, 618, 619, 620, 617, 618, 619, 620, 617, 618, 635, 636, 0, 0, 601, 620, 617, 618, 619, 620, 617, 618, 619, 620, 617, 618, 619, 620, 617, 618, 619, 620, 617, 618, 619, 636, 0, 0, 601, 602, 603, 604, 619, 620],
        [621, 622, 623, 638, 639, 640, 0, 0, 605, 622, 623, 624, 621, 622, 623, 624, 621, 622, 623, 624, 621, 622, 623, 624, 621, 622, 623, 624, 621, 622, 623, 640, 0, 0, 605, 624, 621, 622, 623, 624, 621, 622, 623, 624, 621, 622, 623, 624, 621, 622, 623, 624, 621, 622, 623, 624, 621, 622, 623, 624, 621, 622, 623, 624, 621, 622, 639, 640, 0, 0, 605, 624, 621, 622, 623, 624, 621, 622, 623, 624, 621, 622, 623, 624, 621, 622, 623, 624, 621, 622, 623, 640, 0, 0, 605, 606, 607, 608, 623, 624],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 416, 417, 418, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 410, 411, 412, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 419, 420, 421, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 410, 411, 412, 0, 0],
        [0, 0, 413, 414, 415, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 422, 423, 424, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 413, 414, 415, 0, 0],
        [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        [18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 18, 19, 20, 21, 22, 23, 24, 25, 26],
        [34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 34, 35, 36, 37, 38, 39, 40, 41, 42],
        [50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 50, 51, 52, 53, 54, 55, 56, 57, 58]
    ];


    var pointX = 100;
    var pointY = 100;

    canvas.addEventListener('mousemove', function (event) {
        pointX = event.offsetX;
        pointY = event.offsetY;
    });

    canvas.addEventListener('mousedown', function (event) {
        mousePressed = true;

    });
    canvas.addEventListener('mouseup', function (event) {
        mousePressed = false;
    });

    var press = {65: false, 87: false, 68: false}; //65 left 84 top 68 right

    document.addEventListener('keydown', function (event) {
        if (event.keyCode in press) {
            press[event.keyCode] = true;
        }
    });

    document.addEventListener('keyup', function (event) {
        if (event.keyCode in press) {
            press[event.keyCode] = false;
        }
    });


    var mousePressed = false;

    canvas.width = 3200;
    canvas.height = 640;
    var skeletionImg = new Image();
    skeletionImg.src = "../public/image/skeleton.png"

    var mapImage = new Image();
    mapImage.addEventListener('load', pngLoaded, false);
    mapImage.src = "../public/image/map.png";

    class Object {
        constructor() {

        }

        applyForth(addingVector) {
            let transedAddingVector = addingVector.copy();
            transedAddingVector.div(this.mass);
            this.acceleration.add(transedAddingVector);
        }

        checkEdge() {

        }

        getFriction(mew, vector) { // mew = 마찰계수
            mew = mew * (vector.mag() * vector.mag());
            let friction = vector.copy();
            friction.mult(-1);
            friction.nomalize();
            friction.mult(mew);
            return friction;
        }
    }

    class Vector {

        constructor(x, y) {
            this.x = x;
            this.y = y;
        }

        add(vector) {
            this.x += vector.x;
            this.y += vector.y;
        }

        sub(vector) {
            this.xx -= vector.x;
            this.xy -= vector.y;
        }

        mult(how) {
            this.x *= how;
            this.y *= how;
        }

        div(how) {
            this.x /= how;
            this.y /= how;
        }

        mag() {
            const Vsize = Math.sqrt(this.x * this.x + this.y * this.y);
            return Vsize;
        }

        nomalize() {
            if (this.mag() != 0) {
                this.div(this.mag());
            }
        }

        limit(limitNum) {
            if (this.mag() > limitNum) {
                this.nomalize();
                this.mult(limitNum);
            }
        }

        copy() {
            var copyVector = new Vector(this.x, this.y);
            return copyVector;
        }

        static addStatic(Vector1, Vector2) {
            let addedVector = new Vector(Vector1.x + Vector2.x, Vector1.y + Vector2.y);
            return addedVector;
        }

        static subStatic(Vector1, Vector2) {
            let subedVector = new Vector(Vector1.x - Vector2.x, Vector1.y - Vector2.y);
            return subedVector;
        }

        static divStatic(Vector1, Num) {
            let subedVector = new Vector(Vector1.x / Num, Vector1.y / Num);
            return subedVector;
        }
    }

    class Player extends Object {
        constructor(setVector, mass) {
            super();
            this.location = setVector.copy();
            this.velocity = new Vector(0, 0);
            this.acceleration = new Vector(0, 0);
            this.mass = mass;
            this.flying = true;
            this.elasticity;
        }

        update() {
            this.applyForth(this.getFriction(airFriction,this.velocity));
            this.applyForth(gravity);
          //  console.log(`in update ${this.acceleration.y}`);
            this.velocity.add(this.acceleration);
            this.location.add(this.velocity);
            this.acceleration.mult(0);
        }

        draw() {
            ctx.save();
            var state = "stop"
            if(!(this.flying)&&(state == "stop")){
              if(this.velocity.x>=0){
                  ctx.drawImage(skeletionImg, 32*16, 0, 32*2, 32*2, this.location.x-this.mass, this.location.y-this.mass, 32*2, 32*2);
              } else if(this.velocity.x<0) {
                  ctx.drawImage(skeletionImg, 32*16, 64, 32*2, 32*2, this.location.x-this.mass, this.location.y-this.mass, 32*2, 32*2);
              }

            }
            if(this.flying){
              if(this.velocity.x>=0){
                ctx.drawImage(skeletionImg,0,0,64,64,this.location.x-this.mass, this.location.y-this.mass,32*2, 32*2);
              } else if(this.velocity.x<0) {
                  ctx.drawImage(skeletionImg,0,64,64,64,this.location.x-this.mass, this.location.y-this.mass,32*2, 32*2);
              }

            }
            ctx.restore();
        }

        checkEdge() {
            var fix = this.location.y;
            var nowPosition = mapArr[Math.floor((this.location.y + this.mass) / 32)][Math.floor(this.location.x / 32)];
            var nowX = this.location.x;
            var nowY = this.location.y;
            if (!(nowPosition == 0)) { // y impact check bottom
                this.location.y = Math.floor(this.location.y/32)*32;
                this.velocity.y = -(this.velocity.y/3);
                if(nowPosition<=14){
                  this.acceleration.x += this.getFriction(iceFriction, this.velocity).x; //add friction only X
                } else{
                this.acceleration.x += this.getFriction(groundFriction, this.velocity).x; //add friction only X
              }
                this.flying = false;
            }

            nowPosition = mapArr[Math.floor((this.location.y - this.mass) / 32)][Math.floor(this.location.x / 32)];
            if (!(nowPosition == 0)) { // y impact check top
                this.location.y = this.location.y+1;
                this.velocity.y = 0;
            }

            var nowPositionX = mapArr[Math.floor(this.location.y / 32)][Math.floor((this.location.x + this.mass) / 32)];
            if (!(nowPositionX == 0)) { // x impact sheck right
                this.location.x = this.location.x-1;
                this.velocity.x=0;
            }

            nowPositionX = mapArr[Math.floor(this.location.y / 32)][Math.floor((this.location.x - this.mass) / 32)];
            if(!(nowPositionX ==0 )){ // x impact check left
                this.location.x = this.location.x+1;
                this.velocity.x=0;
            }

            if (this.location.x + this.mass > canvas.width) { //right wall
                this.location.x = canvas.width - this.mass;
                this.velocity.x *= -1;
            }

            else if (this.location.x - this.mass < 0) { // left wall
                this.velocity.x *= -1;
                this.location.x = 0 + this.mass;
            }

            if (this.location.y + this.mass > canvas.height) { // bottom
                this.velocity.y *= -1;
                this.location.y = canvas.height - this.mass;
            }
            else if (this.location.y - this.mass-1 < 0) { // top
              //  this.velocity.y *= -1;
                console.log('this.mass');
                this.location.y = this.mass+1;

            }


        }

        run() {
            this.pressUpdate();
            this.update();
            this.checkEdge(this.location.x, this.location.y);
            this.draw();
        }

        pressUpdate(){ //65 left 84 top 68 right
          if(press[65]){
            var left = new Vector(-10, 0);
            this.applyForth(left);
          }

          if(press[87]){
            if(!(this.flying)){
              this.applyForth(new Vector(0, -650));
            }
            this.flying = true;
          }

          if(press[68]){
            var right = new Vector(10, 0);
            this.applyForth(right);
          }

        }

    }

    function pngLoaded() {
        start();
    }

    var player = new Player(new Vector(50, 50), 32);
    var gravity =  new Vector(0, 2);

    function start() {
        setInterval('loop()', 10);
    }

    function loop() {
        ctx.drawImage(mapImage, 0, 0);
        player.velocity.limit(5);
        player.run();
        drawString();
    }

    function drawString() {
        ctx.fillStyle = "black";
        ctx.font = "15px Arial";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.fillText(`${pointX}, ${pointY} X velocity ${Math.floor(player.velocity.x)} Y velocity ${Math.floor(player.velocity.y)}`, 10, 50);
        ctx.fillStyle = "blue";
        ctx.fillText(`X acceleration ${Math.floor(player.acceleration.x)} Y acceleration ${Math.floor(player.acceleration.y)}`, 10,75);

    }
//}
