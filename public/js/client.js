var pointX;
var pointY;

var Img = {};
Img.player = new Image();
Img.player.src = '/public/image/skeleton.png';
var skeletonSheet = new spriteSheet(Img.player, 9, 2, 64, 64);

Img.map = new Image();
Img.map.src = '/public/image/map.png';

var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');
canvas.width = 1340;
canvas.height = 640;

var socket = io();

var modal = document.getElementById('myModal');
var nickBox = document.getElementById('nickBox');
var guest = document.getElementById('guest');
modal.style.display = 'block';

// When the user press enter key, play as guest
nickBox.addEventListener("keydown", function(event) {
    event.preventDefault();
    if (event.which == 13 || event.keyCode == 13) {
        // trigger / dispatch 로 바꾸기
        console.log('enter');
        hello();
    }
});

guest.addEventListener('mousedown', function hello() {
    console.log('in hello');
    var nickname = nickBox.value;
    socket.emit('nickname', nickname);
    modal.style.display = 'none';
});

//------add mouse listen
canvas.addEventListener('mousemove', function (event) {
        pointX = event.offsetX;
        pointY = event.offsetY;
});

canvas.addEventListener('mouseup', function (event) {
        var ballData = {
          mouseX : pointX,
          mouseY : pointY
        };
        socket.emit('throwBall', ballData);
        console.log("fire");
});

socket.on('newPosition', function (data, ball) {
    ctx.clearRect(0, 0, 500, 500); // 캔버스를 깨끗이
    ctx.drawImage(Img.map, 0, 0, 1340, 640, 0, 0, canvas.width, canvas.height);
    for (var i = 0; i < data.length; i++) {
        ctx.drawImage(skeletonSheet.getSheet(data[i].ImageIndex), data[i].locationX - 32, data[i].locationY - 32);
    }
    for(var loop = 0; loop < ball.length; loop++){
      ctx.beginPath();
      ctx.arc(ball[loop].locationX, ball[loop].locationY, 10, 0, Math.PI*2);
      ctx.fill();
    }
});

document.onkeydown = function (event) {
    if (event.keyCode === 68) //d
        socket.emit('keyPress', {inputId: 'right', state: true});
    else if (event.keyCode === 65) //a
        socket.emit('keyPress', {inputId: 'left', state: true});
    else if (event.keyCode === 87) // w
        socket.emit('keyPress', {inputId: 'up', state: true});

}

document.onkeyup = function (event) {
    if (event.keyCode === 68)	//d
        socket.emit('keyPress', {inputId: 'right', state: false});
    else if (event.keyCode === 65) //a
        socket.emit('keyPress', {inputId: 'left', state: false});
    else if (event.keyCode === 87) // w
        socket.emit('keyPress', {inputId: 'up', state: false});
}
