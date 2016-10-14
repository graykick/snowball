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

var socket;

var modal = document.getElementById('myModal');
var nickBox = document.getElementById('nickBox');
var guest = document.getElementById('guest');

modal.style.display = 'block';

// When the user press enter key, play as guest
nickBox.addEventListener("keydown", function (event) {
    if (event.which == 13 || event.keyCode == 13) {
        var nickname = nickBox.value;
        startSocket();
        //socket.emit('nickname', nickname);
        modal.style.display = 'none';
    }
});

guest.addEventListener('mousedown', function helloModal() {
    var nickname = nickBox.value;
    startSocket();
  //  socket.emit('nickname', nickname);
    modal.style.display = 'none';
});

//chat
// var chatText = document.getElementById('chat-text');
// var chatInput = document.getElementById('chat-input');
// var chatForm = document.getElementById('chat-form');

// socket.on('receiveToChat', function (data) {
//     chatText.innerHTML += '<div class="receiveMes">' + data + '</div>';
// });
//
// socket.on('sendToChat', function (data) {
//     chatText.innerHTML += '<div class="sendMes">' + data + '</div>';
// });
//
// socket.on('evalAnswer', function (data) {
//     console.log(data);
// });
//
// chatForm.onsubmit = function (e) {
//     e.preventDefault();
//     if (chatInput.value[0] === '/')
//         socket.emit('evalServer', chatInput.value.slice(1));
//     else
//         socket.emit('sendMsgToServer', chatInput.value);
//     chatInput.value = '';
// }

//------add mouse listen


var playerConfig = {
    border: 6,
    textColor: '#FFFFFF',
    textBorder: '#000000',
    textBorderSize: 3,
    defaultSize: 30
};

var MainPlayer = {
  locationX : 0,
  locationY : 0,
  vLocationX : 0,
  vLocationY : 0,
  ImageIndex : 0,
  hp : 0,
  score : 0,
  name : ""
};

var player;
var players = [];
var balls = [];
var gameHanddler;


function startSocket(){
  socket = io();

  console.log("start socket");
  socket.on("connected", () => {
    console.log("iam connected");
    socket.emit("nickName", nickBox.value);
    console.log("i sent nickname");
  });

  socket.on("gameStart", (me) => {
    console.log("gkgkgk");

    this.player = me;
    console.log(this.player.locationX);
  //  this.players = players;
    console.log("in gamestart socket");
    console.log(this.player.locationY);
    gameStart();
    //start game
  });

  // socket.on("MeUpdate", (player) => {
  //   this.player = player;
  //   //array update
  // });
  //
  // socket.on("playersUpdate", (players) => {
  //   this.players = players;
  // })

  socket.on("update", (me, enemys, balls) => {
    console.log("i got update");
    player = me;
    players = enemys;
    this.balls = balls;
    console.log("ball num = "+this.balls.length);
  })

  socket.on("die", () => {
    clearInterval(gameHanddler);
  })

  socket.on("update2", () => {
    console.log("i get update2");
  })

  function gameStart(){
    console.log("in game start");
    startEvent();
    gameHanddler = setInterval(() => {
      console.log("player value check = "+player.locationY);
      drawMap(player);

      //loop for draw player
      for(var loop = 0; loop < players.length; loop++){
        drawPlayer(players[loop]);
      }
      drawMyPlayer(player);

      //loop for draw ball
      for(var loop = 0; loop < this.balls.length; loop++){
        drawBall(this.balls[loop]);
      }
    },30);
  }

}

// function gameStart(){
//   console.log("in game start");
//   startEvent();
//   gameHanddler = setInterval(() => {
//     drawMap(player);
//     drawMyPlayer(player);
//     for(var loop = 0; loop < players.length; loop++){
//       drawPlayer(players[loop]);
//     }
//     for(var loop = 0; loop > balls.length; loop++){
//       drawBall(balls[loop]);
//     }
//   },30);
// }

function startEvent(){
  canvas.addEventListener('mousemove', function (event) {
    pointX = event.offsetX;
    pointY = event.offsetY;
});

  canvas.addEventListener('mouseup', function (event) {
    var ballData = {
        mouseY : pointY,
        mouseX : pointX + shotOffsetX
      };
      console.log("throw!!!!");
      socket.emit('throwBall', ballData);
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
}

function drawMyPlayer(player){
  ctx.fillStyle = "green";
  ctx.fillRect(player.vLocationX - 42, player.vLocationY - 42, player.hp, 10);
  ctx.fillStyle = "black";
  ctx.fillText(player.score, player.vLocationX - 52, player.locationY - 52);
  ctx.fillText(player.name, player.vLocationX - 32, player.locationY - 52);
  ctx.drawImage(skeletonSheet.getSheet(player.ImageIndex), player.vLocationX - 32, player.vLocationY - 32);
}

function drawPlayer(player){
  //location check
//  console.log("differ = "+this.player.locationX+" vs "+player.locationX);
    if(this.player.locationX-670<0){ // if left max
      ctx.fillStyle = "red";
      ctx.fillRect(player.locationX - 42, player.locationY - 42, player.hp, 10);
      ctx.fillStyle = "black";
      ctx.fillText(player.score, player.locationX - 52, player.locationY - 52);
      ctx.fillText(player.name, player.locationX - 32, player.locationY - 52);
      ctx.drawImage(skeletonSheet.getSheet(player.ImageIndex), (player.locationX - 32), player.locationY - 32);
     } else if(this.player.locationX+670>3200){ // if right max
       ctx.fillStyle = "red";
       ctx.fillRect(player.locationX + this.player.locationX - (canvas.width/2)- 42, player.locationY - 42, player.hp, 10);
       ctx.fillStyle = "black";
       ctx.fillText(player.score, player.locationX + this.player.locationX - (canvas.width/2)  - 52, player.locationY - 52);
       ctx.fillText(player.name, player.locationX + this.player.locationX - (canvas.width/2) - 32, player.locationY - 52);
      ctx.drawImage(skeletonSheet.getSheet(player.ImageIndex), (player.locationX - 32) - this.player.locationX + (canvas.width/2) , player.locationY - 32);
     } else { // middle
       ctx.fillStyle = "red";
       ctx.fillRect((player.locationX - 42) - this.player.locationX + (canvas.width/2), player.locationY - 42, player.hp, 10);
       ctx.fillStyle = "black";
       ctx.fillText(player.score, (player.locationX - 52) - this.player.locationX + (canvas.width/2), player.locationY - 52);
       ctx.fillText(player.name, (player.locationX - 32) - this.player.locationX + (canvas.width/2), player.locationY - 52);
       ctx.drawImage(skeletonSheet.getSheet(player.ImageIndex), (player.locationX - 32) - this.player.locationX + (canvas.width/2) , player.locationY - 32);
     }
}

function drawMap(me){
  //location check
  if(me.locationX-670<0){ // if left max4
    mapState = "left";
    shotOffsetX = 0;
    ctx.drawImage(Img.map, 0, 0, 1340, 640, 0,0, canvas.width, canvas.height);
  } else if(me.locationX+670>3200){ // if right max
    mapState = "right";
    ctx.drawImage(Img.map, 3200-canvas.width, 0, 1340, 640, 0,0, canvas.width, canvas.height);
  } else { // middle
    mapState = "middle";
    shotOffsetX = (me.locationX) - (canvas.width/2);
    ctx.drawImage(Img.map, me.locationX-670, 0, 1340, 640, 0,0, canvas.width, canvas.height);
  }
}

function drawBall(ball){
    ctx.fillStyle = "white";
    ctx.beginPath();

    console.log("ball's location = "+ball.locationX);
    //location check
    if(this.player.locationX-670<0){ // if left max
      ctx.arc(ball.locationX, ball.locationY, 10, 0, Math.PI * 2);
     } else if(this.player.locationX+670>3200){ // if right max
       ctx.arc(ball.locationX + player.locationX - (canvas.width/2), ball.locationY, 10, 0, Math.PI * 2);
     } else { // middle
       ctx.arc(ball.locationX - player.locationX + (canvas.width/2), ball.locationY, 10, 0, Math.PI * 2);
     }
     ctx.fill();
}























































// var pointX;
// var pointY;
// var shotOffsetX;
// var gameStart = false;
// var mapState;
//
// var startGame = false;
//
// var Img = {};
// Img.player = new Image();
// Img.player.src = '/public/image/skeleton.png';
// var skeletonSheet = new spriteSheet(Img.player, 9, 2, 64, 64);
//
// Img.map = new Image();
// Img.map.src = '/public/image/map.png';
//
// var canvas = document.getElementById('myCanvas');
// var ctx = canvas.getContext('2d');
// canvas.width = 1340;
// canvas.height = 640;
//
// var socket = io();
//
// var modal = document.getElementById('myModal');
// var nickBox = document.getElementById('nickBox');
// var guest = document.getElementById('guest');
//
// modal.style.display = 'block';
//
// // When the user press enter key, play as guest
// nickBox.addEventListener("keydown", function (event) {
//     if (event.which == 13 || event.keyCode == 13) {
//         var nickname = nickBox.value;
//         socket.emit('nickname', nickname);
//         modal.style.display = 'none';
//     }
// });
//
// guest.addEventListener('mousedown', function helloModal() {
//     var nickname = nickBox.value;
//     socket.emit('nickname', nickname);
//     modal.style.display = 'none';
// });
//
// //chat
// var chatText = document.getElementById('chat-text');
// var chatInput = document.getElementById('chat-input');
// var chatForm = document.getElementById('chat-form');
//
// socket.on('receiveToChat', function (data) {
//     chatText.innerHTML += '<div class="receiveMes">' + data + '</div>';
// });
//
// socket.on('sendToChat', function (data) {
//     chatText.innerHTML += '<div class="sendMes">' + data + '</div>';
// });
//
// socket.on('evalAnswer', function (data) {
//     console.log(data);
// });
//
// chatForm.onsubmit = function (e) {
//     e.preventDefault();
//     if (chatInput.value[0] === '/')
//         socket.emit('evalServer', chatInput.value.slice(1));
//     else
//         socket.emit('sendMsgToServer', chatInput.value);
//     chatInput.value = '';
// }
//
// //------add mouse listen
// canvas.addEventListener('mousemove', function (event) {
//     pointX = event.offsetX;
//     pointY = event.offsetY;
//     console.log("mouseY = "+pointY);
// });
//
// canvas.addEventListener('mouseup', function (event) {
//     var ballData = {
//       mouseY : pointY,
//       mouseX : pointX + shotOffsetX
//     };
//     socket.emit('throwBall', ballData);
//     console.log("fire");
// });
//
//
// //<<<<<<< HEAD
//   //  ctx.clearRect(0, 0, 500, 500); // 캔버스를 깨끗이
// //=======
//   socket.on('newPosition', function (data, ball, me) {
//       //  ctx.clearRect(0, 0, 500, 500); // 캔버스를 깨끗이
//
//   //>>>>>>> origin/front
//   if(me.locationX-670<0){ // if left max4
//       mapState = "left";
//         shotOffsetX = 0;
//       ctx.drawImage(Img.map, 0, 0, 1340, 640, 0,0, canvas.width, canvas.height);
//     } else if(me.locationX+670>3200){ // if right max
//       mapState = "right";
//       ctx.drawImage(Img.map, 3200-canvas.width, 0, 1340, 640, 0,0, canvas.width, canvas.height);
//     } else { // middle
//       mapState = "middle";
//         shotOffsetX = (me.locationX) - (canvas.width/2);
//       ctx.drawImage(Img.map, me.locationX-670, 0, 1340, 640, 0,0, canvas.width, canvas.height);
//     }
//     //  ctx.drawImage(Img.map, 0, 0, 1340, 640, 0, 0, canvas.width, canvas.height);
//
//       for (var i = 0; i < data.length; i++) {
//         ctx.fillStyle = "green";
//         ctx.fillRect(me.vLocationX - 42, me.vLocationY - 42, me.hp, 10);
//         ctx.fillStyle = "black";
//         ctx.fillText(me.score, me.vLocationX - 52, me.locationY - 52);
//         ctx.fillText(me.name, me.vLocationX - 32, me.locationY - 52);
//         ctx.drawImage(skeletonSheet.getSheet(me.ImageIndex), me.vLocationX - 32, me.vLocationY - 32);
//
//         if(me.name != data[i].name){
//           if(me.locationX-670<0){ // if left max
//             ctx.fillStyle = "red";
//             ctx.fillRect(data[i].locationX - 42, data[i].locationY - 42, data[i].hp, 10);
//             ctx.fillStyle = "black";
//             ctx.fillText(data[i].score, data[i].locationX - 52, data[i].locationY - 52);
//             ctx.fillText(data[i].name, data[i].locationX - 32, data[i].locationY - 52);
//             ctx.drawImage(skeletonSheet.getSheet(data[i].ImageIndex), (data[i].locationX - 32), data[i].locationY - 32);
//            } else if(me.locationX+670>3200){ // if right max
//              ctx.fillStyle = "red";
//              ctx.fillRect(data[i].locationX + me.locationX - (canvas.width/2)- 42, data[i].locationY - 42, data[i].hp, 10);
//              ctx.fillStyle = "black";
//              ctx.fillText(data[i].score, data[i].locationX + me.locationX - (canvas.width/2)  - 52, data[i].locationY - 52);
//              ctx.fillText(data[i].name, data[i].locationX + me.locationX - (canvas.width/2) - 32, data[i].locationY - 52);
//             ctx.drawImage(skeletonSheet.getSheet(data[i].ImageIndex), (data[i].locationX - 32) - me.locationX + (canvas.width/2) , data[i].locationY - 32);
//            } else { // middle
//              ctx.fillStyle = "red";
//              ctx.fillRect((data[i].locationX - 42) - me.locationX + (canvas.width/2), data[i].locationY - 42, data[i].hp, 10);
//              ctx.fillStyle = "black";
//              ctx.fillText(data[i].score, (data[i].locationX - 52) - me.locationX + (canvas.width/2), data[i].locationY - 52);
//              ctx.fillText(data[i].name, (data[i].locationX - 32) - me.locationX + (canvas.width/2), data[i].locationY - 52);
//              ctx.drawImage(skeletonSheet.getSheet(data[i].ImageIndex), (data[i].locationX - 32) - me.locationX + (canvas.width/2) , data[i].locationY - 32);
//            }
//
//
//           // if(me.locationX-670<0){
//           //   ctx.drawImage(skeletonSheet.getSheet(data[i].ImageIndex), (data[i].locationX - 32) - me.locationX + (canvas.width/2) , data[i].locationY - 32);
//           // }
//         }
//       }
//       for (var loop = 0; loop < ball.length; loop++) {
//           ctx.fillStyle = "white";
//           ctx.beginPath();
//           if(me.locationX-670<0){ // if left max
//             ctx.arc(ball[loop].locationX, ball[loop].locationY, 10, 0, Math.PI * 2);
//            } else if(me.locationX+670>3200){ // if right max
//              ctx.arc(ball[loop].locationX + me.locationX - (canvas.width/2), ball[loop].locationY, 10, 0, Math.PI * 2);
//            } else { // middle
//              ctx.arc(ball[loop].locationX - me.locationX + (canvas.width/2), ball[loop].locationY, 10, 0, Math.PI * 2);
//            }
//           ctx.fill();
//       }
//   });
//
//
// socket.on('dead', () => {
//     chatText.innerHTML += '<div>' + "you die____" + '</div>';
//     var modalHead = document.getElementById("modal-header2");
//     modalHead.innerHTML = "hahahahaha you dead";
//     modal.style.display = 'block';
// });
//
// document.onkeydown = function (event) {
//     if (event.keyCode === 68) //d
//         socket.emit('keyPress', {inputId: 'right', state: true});
//     else if (event.keyCode === 65) //a
//         socket.emit('keyPress', {inputId: 'left', state: true});
//     else if (event.keyCode === 87) // w
//         socket.emit('keyPress', {inputId: 'up', state: true});
// }
//
// document.onkeyup = function (event) {
//     if (event.keyCode === 68)	//d
//         socket.emit('keyPress', {inputId: 'right', state: false});
//     else if (event.keyCode === 65) //a
//         socket.emit('keyPress', {inputId: 'left', state: false});
//     else if (event.keyCode === 87) // w
//         socket.emit('keyPress', {inputId: 'up', state: false});
// }
