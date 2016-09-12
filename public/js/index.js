
    canvas.addEventListener('mousemove', function (event) {
        pointX = event.offsetX;
        pointY = event.offsetY;
    });

    canvas.addEventListener('mousedown', function (event) {
        mousePressed = true;

    });
    canvas.addEventListener('mouseup', function (event) {
      player.throwBall();
        mousePressed = false;
    });

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

    canvas.width = 1340;
    canvas.height = 640;
    var skeletionImg = new Image();
    skeletionImg.src = "../public/image/skeleton.png"
    var skeletonSheet = new spriteSheet(skeletionImg, 9,2,64,64);

    var mapImage = new Image();
    mapImage.addEventListener('load', pngLoaded, false);
    mapImage.src = "../public/image/map.png";

    function pngLoaded() {
        start();
    }

    var player = new Player(new Vector(670, 50), 32);
    var gravity =  new Vector(0, 2);
    var newBall = new Ball(player.location.x, player.location.y, 10, new Vector(pointX, pointY));

    function start() {
        setInterval('loop()', 10);
    }

    function loop() {
        ctx.clearRect(0,0,canvas.width, canvas.height);

        // map move
        if(player.location.x-670<0){ // if left max
          ctx.drawImage(mapImage, 0, 0, 1340, 640, 0,0, canvas.width, canvas.height);
        } else if(player.location.x+670>3200){ // if right max
          ctx.drawImage(mapImage, 3200-canvas.width, 0, 1340, 640, 0,0, canvas.width, canvas.height);
        } else { // middle
          ctx.drawImage(mapImage, player.location.x-670, 0, 1340, 640, 0,0, canvas.width, canvas.height);
      }

        player.velocity.limit(5);
        player.run();
      //  newBall.run();
        drawString();
    }

    function drawString() {
        ctx.fillStyle = "black";
        ctx.font = "15px Arial";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.fillText(`${pointX}, ${pointY} X velocity ${Math.floor(player.velocity.x)} Y velocity ${Math.floor(player.velocity.y)}`, 10, 50);
        ctx.fillStyle = "blue";
        ctx.fillText(`X acceleration ${(player.acceleration.x)} Y acceleration ${Math.floor(player.acceleration.y)}`, 10,75);
        ctx.fillText(`X velocity ${(player.velocity.x)} Y velocity ${Math.floor(player.velocity.y)}`, 10,100);
        ctx.fillStyle = "black"
        ctx.fillText(`X location ${Math.floor(player.location.x)} Y location ${Math.floor(player.location.y)}`, 10,125);
        ctx.fillText(`X Vlocation ${Math.floor(player.vLocation.x)} Y Vlocation ${Math.floor(player.vLocation.y)}`, 10,150);
    }
//}
