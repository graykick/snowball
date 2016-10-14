
var
    express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    Vector = require('./lib/vector.js'),
    Player = require('./lib/player.js'),
    Ball = require('./lib/ball.js'),
    Object = require('./lib/object.js');
    var  PORT = 3002;
    var canvasWidth = 1340;
    var getNicname = false;

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.use('/public', express.static(__dirname + '/public'));

server.listen(port = Number(process.env.PORT || PORT), function () {
    console.log("Server " + PORT + " listening");
});

function makePlayerObject(player){
  var ObjPlayer = {
    locationX: player.location.x,
    locationY: player.location.y,
    vLocationX: player.vLocation.x,
    vLocationY: player.vLocation.y,
    ImageIndex: player.nowImageIndex,
    hp: player.hp, // 해골 방향 index
    score: player.score,
    name : player.nickname
  };

  return ObjPlayer;
}

function makeBallObject(ball){
  var ObjBall = {
    locationX : ball.location.x,
    locationY : ball.location.y
  }
  return ObjBall;
}

getObjLength = function(obj) {
    var size = 0, key = null;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;

};

function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
}


var SOCKET_LIST = {};
var PLAYER_LIST = {};
var ballArr = [];
var players = [];
var startFlag = true;


io.sockets.on('connection', function (socket) {
  console.log("someone connected");
  var player = new Player(new Vector(Math.random() * canvasWidth+1, 50), 32);
  player.id = socket;
  player.socketId = socket.id;
  console.log("so id = "+socket.id);
  console.log("in socke test = "+player.location.x);
  console.log("player list size = "+getObjLength(PLAYER_LIST));
  PLAYER_LIST[socket.id] = player;
  console.log("no obj in sock= "+PLAYER_LIST[socket.id].location.x);
  console.log("after = player list size = "+getObjLength(PLAYER_LIST));
  SOCKET_LIST[socket.id] = socket;
  players.push(makePlayerObject(player));

  socket.emit("connected");
  socket.on("nickName", (nickName) => {
    console.log("i got nickName");
    player.nickName = nickName;
    socket.emit("gameStart", makePlayerObject(player));

    start();

  });

  socket.on("throwBall", (data) => {
    var newBall = player.throwBall(data.mouseX, data.mouseY);

    if(data.mouseX>player.location.x){
      player.applyForth(new Vector(-10,0));
    } else {
      player.applyForth(new Vector(10,0));
    }
  //  player.applyForth(10,0);

  //  var reaction = Vector.multStatic(Vector.subStatic(new Vector(data.mouseX, data.mouseY), player.location), (newBall.power*0.00000001*-1));
  //  player.applyForth(reaction);
    ballArr.push(newBall);
  })

  socket.on('keyPress', function (data) {
      if (data.inputId === 'left')
          player.press[65] = data.state;
      else if (data.inputId === 'right')
          player.press[68] = data.state;
      else if (data.inputId === 'up')
          player.press[87] = data.state;
  });

  socket.on('disconnect', function () {
      delete SOCKET_LIST[socket.id];
      delete PLAYER_LIST[socket.id];
  });


});

function start(){
  if(startFlag){
    startFlag = false;
    setInterval(gameLoop, 1000/60);
    setInterval(update, 30);
  }
}

function gameLoop(){
  //run each player's run method
  for(var loop in PLAYER_LIST){
    PLAYER_LIST[loop].run();
    if(!(PLAYER_LIST[loop].live)){
      delete PLAYER_LIST[loop];
    }
  }

  //run each ball's run method
  for(var ballLoopa = 0; ballLoopa < ballArr.length; ballLoopa++){
    ballArr[ballLoopa].run();
    if(!(ballArr[ballLoopa].live)){
      ballArr.splice(ballLoopa,1);
    }
  }
  checkImpact();
}

function update(){
  //loop for all sockets
  for(var loop in SOCKET_LIST){
    var enemys = clone(PLAYER_LIST);
    delete enemys[loop];

    var enemysArr = [];
    for(var inLoop in enemys){
      enemysArr.push(makePlayerObject(enemys[inLoop]));
    }

    var balls = ballArr.map(makeBallObject);


    try{
      SOCKET_LIST[loop].emit("update", makePlayerObject(PLAYER_LIST[loop]), enemysArr, balls);
    } catch(e){

    }
  }

}

function checkImpact() {

  //loop for imapactCheck players and balls
  for(var outLoop in PLAYER_LIST){
    for(var inLoop=0; inLoop < ballArr.length; inLoop++){
      if ((ballArr[inLoop].ownerId != PLAYER_LIST[outLoop].id) && Vector.subStatic(PLAYER_LIST[outLoop].location, ballArr[inLoop].location).mag() < PLAYER_LIST[outLoop].mass + ballArr[inLoop].mass) {
          var radius = PLAYER_LIST[outLoop].mass + ballArr[inLoop].mass;
          PLAYER_LIST[outLoop].hp -= 10;
          try{
            PLAYER_LIST[ballArr[loop].ownerSocketId].score += 10;
          } catch(e){

          }

          if (ballArr[inLoop].location.x > PLAYER_LIST[outLoop].location.x) {
              PLAYER_LIST[outLoop].applyForth(new Vector(-1, 0));
          } else {
              PLAYER_LIST[outLoop].applyForth(new Vector(1, 0));
          }

          ballArr.splice(inLoop, 1);
          continue;
      }
    }
  }
}
