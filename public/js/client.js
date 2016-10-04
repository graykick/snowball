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

//chat
var chatText = document.getElementById('chat-text');
var chatInput = document.getElementById('chat-input');
var chatForm = document.getElementById('chat-form');

socket.on('addToChat',function(data){
    chatText.innerHTML += '<div>' + data + '</div>';
});
socket.on('evalAnswer',function(data){
    console.log(data);
});

chatForm.onsubmit = function(e){
    e.preventDefault();
    if(chatInput.value[0] === '/')
        socket.emit('evalServer',chatInput.value.slice(1));
    else
        socket.emit('sendMsgToServer',chatInput.value);
    chatInput.value = '';
}

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
  //  ctx.clearRect(0, 0, 500, 500); // 캔버스를 깨끗이
    ctx.drawImage(Img.map, 0, 0, 1340, 640, 0, 0, canvas.width, canvas.height);
    for (var i = 0; i < data.length; i++) {
    //  ctx.save();
      ctx.fillStyle = "red";
      ctx.fillRect(data[i].locationX-42, data[i].locationY-42, data[i].hp, 10);
      ctx.fillStyle = "black"
      ctx.fillText(data[i].score,data[i].locationX-52,data[i].locationY-52);
  //    ctx.fill();
    //  ctx.restore();
      ctx.drawImage(skeletonSheet.getSheet(data[i].ImageIndex), data[i].locationX - 32, data[i].locationY - 32);
    }
  //  ctx.fill();
  //  ctx.clearRect();
    for(var loop = 0; loop < ball.length; loop++){
  //    ctx.save();
      ctx.beginPath();
      ctx.arc(ball[loop].locationX, ball[loop].locationY, 10, 0, Math.PI*2);
      ctx.fill();
    //  ctx.restore();
    }

  //  ctx.clearRect();
});

socket.on('dead', () => {
  chatText.innerHTML += '<div>' + "you die____" + '</div>';
  var modalHead = document.getElementById("modal-header2");
  modalHead.innerHTML = "hahahahaha you dead";
  modal.style.display = 'block';
})

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
