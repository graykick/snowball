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

// modal
var modal = document.getElementById('myModal');
var nickBox = document.getElementById('nickBox');
var guest = document.getElementById('guest');
modal.style.display = 'block';

nickBox.addEventListener("keydown", function (event) {
    if (event.which == 13 || event.keyCode == 13) {
        var nickname = nickBox.value;
        socket.emit('nickname', nickname);
        modal.style.display = 'none';
    }
});

guest.addEventListener('mousedown', function helloModal() {
    var nickname = nickBox.value;
    socket.emit('nickname', nickname);
    modal.style.display = 'none';
});

// chat
var chatText = document.getElementById('chat-text');
var chatInput = document.getElementById('chat-input');
var chatForm = document.getElementById('chat-form');

socket.on('receiveToChat', function (data) {
    chatText.innerHTML += '<div class="receiveMes">' + data + '</div>';
});

socket.on('sendToChat', function (data) {
    chatText.innerHTML += '<div class="sendMes">' + data + '</div>';
});

socket.on('evalAnswer', function (data) {
    console.log(data);
});

chatForm.onsubmit = function (e) {
    e.preventDefault();
    if (chatInput.value[0] === '/')
        socket.emit('evalServer', chatInput.value.slice(1));
    else
        socket.emit('sendMsgToServer', chatInput.value);
    chatInput.value = '';
}

// game
socket.on('init', function (data) { // initPack
    console.log('init');
    console.log(data);
    //{ player : [{locationX:x, locationY:x, vLocationX:x, vLocationY: x,
    // ImageIndex: x, hp:x, score:x}], ball: [locationX:x,locationY: x]}
    for (var i = 0; i < data.player.length; i++) {
        new Player(data.player[i]);
    }
    for (var i = 0; i < data.ball.length; i++) {
        new Ball(data.ball[i]);
    }
});

socket.on('update', function (data) { // pack
    console.log('update');
    console.log(data);
    for (var i = 0; i < data.player.length; i++) {
        var pack = data.player[i];
        var p = Player.list[pack.id];
        if (p) {
            if (pack.x !== undefined)
                p.x = pack.x;
            if (pack.y !== undefined)
                p.y = pack.y;
            if (pack.hp !== undefined)
                p.hp = pack.hp;
            if (pack.score !== undefined)
                p.score = pack.score;
        }
    }
    for (var i = 0; i < data.ball.length; i++) {
        var pack = Ball.list[i];
        var b = Ball.list[data.Ball.list[i].id];
        if (b) {
            if (pack.x !== undefined)
                b.x = pack.x;
            if (pack.y !== undefined)
                b.y = pack.y;
        }
    }
});

socket.on('remove', function (data) {
    console.log('remove');
    console.log(data);
    for (var i = 0; i < data.player.length; i++) {
        delete Player.list[data.player[i]];
    }
    for (var i = 0; i < data.bullet.length; i++) {
        delete Ball.list[data.ball[i]];
    }
});

setInterval(function () {
    ctx.drawImage(Img.map, 0, 0, 1340, 640, 0, 0, canvas.width, canvas.height);

    ctx.clearRect(0, 0, 500, 500);
    for (var i in PLAYER_LIST) {
        ctx.fillStyle = "red";
        ctx.fillRect(data[i].locationX - 42, data[i].locationY - 42, data[i].hp, 10);
        ctx.fillStyle = "black";
        ctx.fillText(data[i].score, data[i].locationX - 52, data[i].locationY - 52);
        ctx.drawImage(skeletonSheet.getSheet(data[i].ImageIndex), data[i].locationX - 32, data[i].locationY - 32);
    }
    for (var i in Ball.list) {
        ctx.beginPath();
        ctx.arc(ball[loop].locationX, ball[loop].locationY, 10, 0, Math.PI * 2);
        ctx.fill();
    }
}, 40);

/*
 socket.on('newPosition', function (data, ball) {
 //  ctx.clearRect(0, 0, 500, 500); // 캔버스를 깨끗이
 ctx.drawImage(Img.map, 0, 0, 1340, 640, 0, 0, canvas.width, canvas.height);
 for (var i = 0; i < data.length; i++) {
 ctx.fillStyle = "red";
 ctx.fillRect(data[i].locationX - 42, data[i].locationY - 42, data[i].hp, 10);
 ctx.fillStyle = "black";
 ctx.fillText(data[i].score, data[i].locationX - 52, data[i].locationY - 52);
 ctx.drawImage(skeletonSheet.getSheet(data[i].ImageIndex), data[i].locationX - 32, data[i].locationY - 32);
 }
 for (var loop = 0; loop < ball.length; loop++) {
 ctx.beginPath();
 ctx.arc(ball[loop].locationX, ball[loop].locationY, 10, 0, Math.PI * 2);
 ctx.fill();

 }

 });
 */

socket.on('dead', () => {
    chatText.innerHTML += '<div>' + "you die____" + '</div>';
    var modalHead = document.getElementById("modal-header2");
    modalHead.innerHTML = "hahahahaha you dead";
    modal.style.display = 'block';
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
canvas.addEventListener('mousemove', function (event) {
    pointX = event.offsetX;
    pointY = event.offsetY;
});
canvas.addEventListener('mouseup', function (event) {
    var ballData = {
        mouseX: pointX,
        mouseY: pointY
    };
    socket.emit('throwBall', ballData);
});