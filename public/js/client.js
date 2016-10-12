var pointX;
var pointY;
var shotOffsetX;
var gameStart = false;
var mapState;

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
var login = document.getElementById('login');
modal.style.display = 'block';

nickBox.addEventListener("keydown", function (event) {
    if (event.which == 13 || event.keyCode == 13) {
        var nickname = nickBox.value;
        socket.emit('nickname', nickname);
        modal.style.display = 'none';
    }
});

guest.addEventListener('mousedown', function () {
    var nickname = nickBox.value;
    socket.emit('nickname', nickname);
    modal.style.display = 'none';
});
login.addEventListener('mousedown', function () {
    alert("로그인은 준비중>,<");
});

//chat
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
socket.on('newPosition', function (data, ball, me) {
    if (me.locationX - 670 < 0) { // if left max4
        mapState = "left";
        shotOffsetX = 0;
        ctx.drawImage(Img.map, 0, 0, 1340, 640, 0, 0, canvas.width, canvas.height);
    } else if (me.locationX + 670 > 3200) { // if right max
        mapState = "right";
        ctx.drawImage(Img.map, 3200 - canvas.width, 0, 1340, 640, 0, 0, canvas.width, canvas.height);
    } else { // middle
        mapState = "middle";
        shotOffsetX = (me.locationX) - (canvas.width / 2);
        ctx.drawImage(Img.map, me.locationX - 670, 0, 1340, 640, 0, 0, canvas.width, canvas.height);
    }
    for (var i = 0; i < data.length; i++) {
        ctx.fillStyle = "red";
        ctx.fillRect(me.vLocationX - 42, me.vLocationY - 42, me.hp, 10);
        ctx.fillStyle = "black";
        ctx.fillText(me.score, me.vLocationX - 52, me.locationY - 52);
        ctx.fillText(me.name, me.vLocationX - 32, me.locationY - 52);
        ctx.drawImage(skeletonSheet.getSheet(me.ImageIndex), me.vLocationX - 32, me.vLocationY - 32);

        if (me.name != data[i].name) {
            if (me.locationX - 670 < 0) { // if left max
                ctx.fillStyle = "red";
                ctx.fillRect(data[i].locationX - 42, data[i].locationY - 42, data[i].hp, 10);
                ctx.fillStyle = "black";
                ctx.fillText(data[i].score, data[i].locationX - 52, data[i].locationY - 52);
                ctx.fillText(data[i].name, data[i].locationX - 32, data[i].locationY - 52);
                ctx.drawImage(skeletonSheet.getSheet(data[i].ImageIndex), (data[i].locationX - 32), data[i].locationY - 32);
            } else if (me.locationX + 670 > 3200) { // if right max
                ctx.fillStyle = "red";
                ctx.fillRect(data[i].locationX - 42, data[i].locationY - 42, data[i].hp, 10);
                ctx.fillStyle = "black";
                ctx.fillText(data[i].score, data[i].locationX - 52, data[i].locationY - 52);
                ctx.fillText(data[i].name, data[i].locationX - 32, data[i].locationY - 52);
                ctx.drawImage(skeletonSheet.getSheet(data[i].ImageIndex), (data[i].locationX - 32) - me.locationX + (canvas.width / 2), data[i].locationY - 32);
            } else { // middle
                ctx.fillStyle = "red";
                ctx.fillRect((data[i].locationX - 42) - me.locationX + (canvas.width / 2), data[i].locationY - 42, data[i].hp, 10);
                ctx.fillStyle = "black";
                ctx.fillText(data[i].score, (data[i].locationX - 52) - me.locationX + (canvas.width / 2), data[i].locationY - 52);
                ctx.fillText(data[i].name, (data[i].locationX - 32) - me.locationX + (canvas.width / 2), data[i].locationY - 52);
                ctx.drawImage(skeletonSheet.getSheet(data[i].ImageIndex), (data[i].locationX - 32) - me.locationX + (canvas.width / 2), data[i].locationY - 32);
            }
        }
    }
    for (var loop = 0; loop < ball.length; loop++) {
        ctx.beginPath();
        if (me.locationX - 670 < 0) { // if left max
            ctx.arc(ball[loop].locationX, ball[loop].locationY, 10, 0, Math.PI * 2);
        } else if (me.locationX + 670 > 3200) { // if right max
            ctx.arc(ball[loop].locationX - me.locationX + (canvas.width / 2), ball[loop].locationY, 10, 0, Math.PI * 2);
        } else { // middle
            ctx.arc(ball[loop].locationX - me.locationX + (canvas.width / 2), ball[loop].locationY, 10, 0, Math.PI * 2);
        }
        ctx.fill();
    }
});


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
        mouseX: pointX + shotOffsetX,
        mouseY: pointY
    };
    socket.emit('throwBall', ballData);
    console.log("fire");
});