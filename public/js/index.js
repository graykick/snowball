window.onload = function() {
    var canvas = document.getElementById('myCanvas');
    var ctx = canvas.getContext('2d');

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

    document.addEventListener('keydown', function (event) {
        //left
        if (event.keyCode == 65) {
            console.log('left');
            var left = new Vector(-5, 0);
            player.applyForth(left);
            //  player.applyForth(player.getFriction(0.5,left));
            //  let speed = this.velocity.mag();
            //    player.acceleration.mult(0);
        }
        //top
        else if (event.keyCode == 87) {
            player.applyForth(new Vector(0, -5));
            console.log('wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww');
        }
        //right
        else if (event.keyCode == 68) {
            var right = new Vector(5, 0);
            player.applyForth(right);
            //    player.applyForth(player.getFriction(0.5,right));

        }
        //bottom
        else if (event.keyCode == 83) {
        }
    });


    var mousePressed = false;

    canvas.width = 3200;
    canvas.height = 640;
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
        }

        update() {
            this.applyForth(gravity);
            //  console.log(`acceleration ${this.acceleration.x}, ${this.acceleration.y}`);
            //console.log(`acceleration ${this.acceleration.x}, ${this.acceleration.y}`);
            this.velocity.add(this.acceleration);
            //console.log(`velocity ${this.velocity.x}, ${this.velocity.y}`);
            this.location.add(this.velocity);
            //console.log(`location ${this.location.x}, ${this.location.y}`);
            this.acceleration.mult(0);
        }

        draw() {
            ctx.save();
            //ctx.globalAlpha = this.lifeSpan/255.0;
            ctx.beginPath();
            ctx.fillStyle = "red";
            ctx.arc(this.location.x, this.location.y, this.mass, 0, Math.PI * 2, true);
            ctx.fill();
            ctx.restore();
        }

        checkEdge() {
            var fix = this.location.y;
            var nowPosition = mapArr[Math.floor((this.location.y + this.mass) / 32)][Math.floor(this.location.x / 32)];
            if (!(nowPosition == 0)) { // y 출돌검사
                this.location.y = Math.floor(this.location.y / 32) * 32;
                this.velocity.y = 0;
                //  this.applyForth(this.getFriction(0.1,this.velocity));
                this.acceleration.x += this.getFriction(0.1, this.velocity).x;
            }
            nowPosition = mapArr[Math.floor((this.location.y - this.mass) / 32)][Math.floor(this.location.x / 32)];
            if (!(nowPosition == 0)) { // y 출돌검사
                this.location.y = Math.floor(this.location.y / 32) * 32;
                this.velocity.y = 0;
                //  this.applyForth(this.getFriction(0.1,this.velocity));
                //  this.acceleration.x += this.getFriction(0.1,this.velocity).x;
            }

            var nowPositionX = mapArr[Math.floor(this.location.y / 32)][Math.floor((this.location.x + this.mass) / 32)];
            //  console.log(`${Math.floor(this.location.y/32)} uuu ${Math.floor((this.location.x+this.mass)/32)} uuu ${nowPositionX}`);
            if (!(nowPositionX == 0)) { //X출돌검사
                this.location.x = Math.floor(this.location.x / 32) * 32;
                console.log(`wow`);
            }

            if (this.location.x + this.mass > canvas.width) { //right wall
                this.location.x = canvas.width - this.mass;
                this.velocity.x *= -1;
            }

            else if (this.location.x - this.mass < 0) { // left wall
                this.velocity.x *= -1;
                this.location.x = 0 + this.mass;
            }

            if (this.location.y + this.mass > canvas.height) { //bottom
                this.velocity.y *= -1;
                this.location.y = canvas.height - this.mass;
            }
            else if (this.location.y - this.mass < 0) { //top
                console.log('fuck');
                this.velocity.y *= -1;
                this.location.y = 0 + this.mass;
            }


        }

        run() {
            this.update();
            this.checkEdge(this.location.x, this.location.y);
            this.draw();
        }

    }

    function pngLoaded() {
        start();
    }

    var player = new Player(new Vector(50, 50), 32);
    var gravity = new Vector(0, 0.1);

    function start() {
        setInterval('loop()', 10);
    }

    function loop() {
        ctx.drawImage(mapImage, 0, 0);
        //player.applyForth(gravity);
        player.velocity.limit(5);
        player.run();
        drawString();
    }

    function drawString() {
        ctx.fillStyle = "black";
        ctx.font = "30px Arial";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.fillText(`${pointX}, ${pointY}`, 10, 50);
    }
}