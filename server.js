// 전체 흐름
// 1. 사용자 접속
// 2. 접속된다는 emit을 클라이언트에 보냄
// 3. 닉네임을 받으면, 게임을 시작하라는 emit과 함께 해단 플레이어의 객체정보를 보냄
// 4. updateloop를 통해 지속적으로 업데이트

var
    express = require('express'),
    Vector = require('./lib/vector.js'),
    Player = require('./lib/player.js'),
    Ball = require('./lib/ball.js'),
    Object = require('./lib/object.js');
    cluster = require('cluster');
    var sio = require('socket.io');
    var  PORT = 3002;
    var canvasWidth = 1340;
    var getNicname = false;
    var redis = require('socket.io-redis');
    var randomColor = require('randomcolor');




    // 공유해야할 변수들
    // SOCKET_LIST
    // PLAYER_LIST
    // ballArr


var numCPUs = require('os').cpus().length;

var testNum = 0;

if (cluster.isMaster) {
  for (var i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
} else {
  var app = express();
  var server = require('http').createServer(app);
  var io = require('socket.io').listen(server);
  io.adapter(redis({ host: 'localhost', port: 6379 }));

  io.on('connection', (socket) => {
    testNum++;
    console.log("global connected id = "+ socket.id + " testNum = "+testNum + " pid = "+ process.pid);
    //  console.log("global connected id = "+ socket.id);
  })


app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.use('/public', express.static(__dirname + '/public'));

server.listen(port = Number(process.env.PORT || PORT), function () {
    console.log("Server " + PORT + " listening pid = "+process.pid);
});

// 클라이언트에 필요한 정보만을 담고있는 객체를 만들기 위한 함수이다.
// player객체를 매개변수로 받으면, object로 리턴한다.
function makePlayerObject(player){
  var ObjPlayer = {
    locationX: player.location.x,
    locationY: player.location.y,
    vLocationX: player.vLocation.x,
    vLocationY: player.vLocation.y,
    ImageIndex: player.nowImageIndex,
    hp: player.hp, // 해골 방향 index
    score: player.score,
    name : player.nickName,
    nextLevelScore : player.nextLevelScore,
    level : player.level
  };

  return ObjPlayer;
}

// 클라이언트에 필요한 정보만을 담고있는 객체를 만들기 위한 함수이다.
// ball객체를 매개변수로 받으면, object로 리턴한다.
function makeBallObject(ball){
  var ObjBall = {
    locationX : ball.location.x,
    locationY : ball.location.y
  }
  return ObjBall;
}

//객체의 사이즈를 알기위한 함수이다. 객체는 .length를 사용할 수 없다.
getObjLength = function(obj) {
    var size = 0, key = null;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;

};

//객체의 깊은 복사를 위한 함수이다. 그냥 a = b를 해버리면, reference를 넘기기 떄문에 큰 문제가 발생한다/
// a = clone(b); 이와같이 사용한다.
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
var corpseArr = [];
var deadPlayer = {};

//서버에 제일 처음 접속했을 때 loop를 실행하기위한 flag이다.
//이를 사용하지 않는다면, 접속자가 0명일때도 loop가 돌거나, 접속할때 마다 루프가 새로 생성된다.
var startFlag = true;


io.sockets.on('connection', function (socket) {
  console.log("someone connected "+process.pid);
  var player = new Player(new Vector(Math.random() * canvasWidth+1, 50), 32);
  player.id = socket;
  player.socketId = socket.id;
  PLAYER_LIST[socket.id] = player;
  SOCKET_LIST[socket.id] = socket;
  player.socket = socket;
  players.push(makePlayerObject(player));

//큰라이언트 측에 소켓연결이 성공적이라는 emit을 준다. 이 emit을 받으면, 클라이언트는 닉네임을 보내온다.
  socket.emit("connected");

  // 클라이언트에서 연결이 성공적임을 알고 닉네임을 보내왔다.
  socket.on("nickName", (nickName) => {
    console.log("i got nickName = "+nickName);
  //  PLAYER_LIST[socket.id].nickName = nickName;

  // 받은 닉네임을 대입한다.
    player.nickName = nickName;

    // 닉네임받아 player객체에 저장하면,
    //서버는 게임을 시작하라는 emit을 보내면서, 자기자신의 정보를 담고 있는 객체를 보낸다
    socket.emit("gameStart", makePlayerObject(player));

    // 플레이에 필요한 모든 setting이 성공적임으로 게임을 시작한다.
    // 이때 위의  startFlag가 중요한 역할을 한다. loop를 1개만 돌게 한다.
    start();

  });

  // 클라이언트에서 mouseup이벤트를 감지하면, 그떄의 mouse좌표와 함께 공을 던졌다는 emit을 보내온다.
  // 그 mouse좌표를 객체화한 매개변수를 받아 새로운 ball객체를 생성하여 ballArr배열에 추가한다.
  // 그 뒤, 공을 던진 player에게 반동을 주기 위하여 applyForth메소드를 사용한다.
  // 이 메소드는 object클래스 에 정의되어 있으며 player클래스는 이를 상속받아 사용한다.
  // 이 메소드는 해당 객체에 가속도를 추가한다.
  socket.on("throwBall", (data) => {

    //공을 던진 player클래스에 정의되어있는 throwBall메소드를 호출하여, 클라이언트 측으로 부터 받은
    //공의 목적지 좌표를 인자로 준다. 공을 던진 플레이어의 좌표를 이용하는 이유는 공이 해당 플레이어의 위치좌표에서
    //시작하여야 하며, 차후에, 공을 던지는 파워라던가 속성들이 player클래스에 정의되어 있기 때문이다.
    if(player.maxBallCount >= player.nowBallCount){
      player.nowBallCount++;
      var newBall = player.throwBall(data.mouseX, data.mouseY);

  // 반동을 어떤 방향으로 줄지에 대한 if문이다.
  // 공을 오른쪽으로 던지면, 반동은 왼쪽으로 반대의 경우엔, 오른쪽으로 applyForth를 한다.
      if(data.mouseX>player.location.x){
        player.applyForth(new Vector(-10,0));
      } else {
        player.applyForth(new Vector(10,0));
      }
    //  player.applyForth(10,0);

    //  var reaction = Vector.multStatic(Vector.subStatic(new Vector(data.mouseX, data.mouseY), player.location), (newBall.power*0.00000001*-1));
    //  player.applyForth(reaction);

    //ball객체에대한 setting이 완료 되었으므로, ballArr에 추가한다.
      ballArr.push(newBall);
    }
  })

// 클라이언트측에서 움직임에대한, 이벤트를 감지하면, 서버측으로 emit을 준다.
// 클라이언트에는 keyup과 keydown 이벤트 총 2개가 있는데,
// 이유는 bool 타입의 플래그를 보내어, 그만 움직여야 하는지 아닌지를 설정하기 위해서이다.
// 또한 서버에 player클래스에는 해당 플레이어의 움직임 객체를 가지고 있는데
// 이유는 객체를 움직이는 것은 해당 player객체가 스스로 하기 때문이다.
// keyup을 받으면, false를 대입해 그만 움직이도록 하고,
// keydown을 받으면, true를 설정해 움직이도록 한다.
// player객체의 움직이는 메소드에서 if를 통해 움직일지 말지 정한다.
  socket.on('keyPress', function (data) {
      if (data.inputId === 'left')
          player.press[65] = data.state; // true false 설정
      else if (data.inputId === 'right')
          player.press[68] = data.state;
      else if (data.inputId === 'up')
          player.press[87] = data.state;
  });

// 소켓연결이 끊어지면, 소켓갹체와 플레이어 객체에서 삭제한다.
// 배열이 아닌 객체이므로 delete를 사용한다.
  socket.on('disconnect', function () {
      delete SOCKET_LIST[socket.id];
      delete PLAYER_LIST[socket.id];
  });

  socket.on("upgrade", (abilyty) => {
    player.skillPoint--;
    if(abilyty == "maxHp"){
      player.maxHp += 10;
    } else if(abilyty == "speed") {
      player.speed += 10;
    } else if(abilyty == "throwPower") {
      player.throwPower += 10;
    } else if(abilyty == "maxBallCount") {
      player.maxBallCount += 1;
    } else if(abilyty == "ballDemage") {
      player.throwDemage += 5;
    } else if(abilyty == "ballHp") {
      player.ballHp += 10;
    } else if(abilyty == "jumpDemage") {
      player.jumpDemage += 10;
    }
  })


});

// 제일 처음 플레이어가 서버에 접속하면, 실행된다.
// 처음에만 실행되기 위해해서 flag가 사용되었다.
// 이 함수에서 게임을 진행하기위한 loop가 2개 실행되는데
// gameloop는 정말로 게임을 진행하는 루프이다.
// player들과 ball객체들의 run메소드를 주기적으로 실행시키고,
// 충돌검사를 실행하고, 충돌일 경우 삭제하는 역할도 담당한다.
// updateloop는 모든 클라이언트측에 렌더딩에 필요한 정보들을 emit하는 loop이다
// 코드를 보면 update횟수보다 gameloop의 횟수가 더 잦은데 그 이유는, 게임진행은 서버에서만 되는데
// 이는 잦아야 한다.
// 반면 클라이언트에 보내는 것은 조금 덜 잦더라도, 렌더딩하여 사용자가 보는것에는 지장이 없으므로, 상대적으로
// 적은 횟수이다.

function start(){
  if(startFlag){
    startFlag = false;
    setInterval(gameLoop, 1000/60);
    setInterval(update, 10);
    setInterval(corpseImpact, 500);
  }
}


// gameloop는 정말로 게임을 진행하는 루프이다.
// player들과 ball객체들의 run메소드를 주기적으로 실행시키고,
// 충돌검사를 실행하고, 충돌일 경우 삭제하는 역할도 담당한다.
function gameLoop(){
  var nStart = new Date().getTime();
  //run each player's run method

  //모든 player객체에 대해 run메소드를 실행 시키고,
  //만약 플레이어가 사망 상태라면, PLAYER_LIST객체에서 해당 플레이어를 삭제한다.
  //이 사망판정은 player클래스 자체적으로 한다.
  for(var loop in PLAYER_LIST){
    PLAYER_LIST[loop].run();
    for(var outLoop in PLAYER_LIST){
      PLAYER_LIST[loop].checkOtherPlayer(PLAYER_LIST[outLoop]);
    }
    if(!(PLAYER_LIST[loop].live)){
      deadPlayer[PLAYER_LIST[loop].socketId] = PLAYER_LIST[loop];
      SOCKET_LIST[PLAYER_LIST[loop].socketId].emit('die');
      SOCKET_LIST[PLAYER_LIST[loop].socketId].emit('otherDie', makePlayerObject(PLAYER_LIST[loop]), makeDeathBall(PLAYER_LIST[loop]));
      delete PLAYER_LIST[loop];
    }
  }

  //run each ball's run method

  //모든 ball객체에 대해 run메소드를 실행 시키고,
  //만약 ball이가 사망 상태라면, ballArr배열에서 해당 ball를 삭제한다.
  //이 사망판정은 player클래스 자체적으로 한다.
  for(var ballLoopa = 0; ballLoopa < ballArr.length; ballLoopa++){
    try {
      ballArr[ballLoopa].run();
      if(!(ballArr[ballLoopa].live)){

       PLAYER_LIST[ballArr[ballLoopa].ownerSocketId].nowBallCount--;
    //배열에서 삭제하는 메소드이다.
        ballArr.splice(ballLoopa,1);
      }
    } catch (e) {

    } finally {

    }


  }
  //checkBallImpact함수는 플레이어와 ball간의 충돌검사를 하는 함수이다.
  //이 함수에서 플레이어가 공에 맞을 시, 해당 플레이어의 hp를 갂는다.
  //또한 그 공은 배열에서 삭제한다.
//  checkBallImpact();

  //checkImpact함수는 공과 공의충돌을 검사하기위한 함수이다.
  // 공끼리 부딛히면 삭제한다.
  // 그러나 아직 작동하지 않는다.
  checkBallImpact();
  checkImpact();
//  if(this.corpseArr.length != 0){
  //}

  var nEnd =  new Date().getTime();      //end time check(Units ms)

  var nDiff = nEnd - nStart;      //time difference between the two calculations (Units ms)
  //console.log("gameloop time = "+nDiff + "ms");
}

// updateloop는 모든 클라이언트측에 렌더딩에 필요한 정보들을 emit하는 loop이다.
// 이 루프에서 인스턴스 상태로 존재하는 것들을 렌더딩에만 필요한 정보를 담은 객체로 만들어
// 새로운 자체 배열을 구성하고 클라이언트 측에 emit한다.
// 이 과정에서 플레이어 자신과, 자신아 아닌 적들을 구분한다.
function update(){
  var nStart = new Date().getTime();
  //loop for all sockets
  for(var loop in SOCKET_LIST){
    //깊은복사를 위한 함수를 사용하였다.
    var enemys = clone(PLAYER_LIST);
    // 자신아아닌 적들의 객체만을 구분하기위한 코드
    delete enemys[loop];

    // 필요한 player정보만을 담을 자체배열
    var enemysArr = [];
    for(var inLoop in enemys){
      // 렌더링에 필요한 정보만을 가지게 하기위하여 makePlayerObject함수를 사용하였다.
      enemysArr.push(makePlayerObject(enemys[inLoop]));
    }

    // 렌더링에 필요한 정보만을 가지게 하기위하여 makeBallObject함수를 사용하였다.
    // map메소드는 구글검색으로 찾아보길 바람.
    // 대충 설명하면, 배열의 모든 값들에대해 callback을 수행하여 새로운 배열을 리턴.
    var balls = ballArr.map(makeBallObject);

    //클라이언트에 필요한 정보만을 담은 객체외 객체를 담은 배열을 eemit함.
    //위의 gameloop에서 삭제된 경우 가끔 오류가 발생하여 예외처리함.
    //그러나 게임 진행에 지장 X
    try{
      SOCKET_LIST[loop].emit('timeCheck',  new Date().getTime());
      SOCKET_LIST[loop].emit("update", makePlayerObject(PLAYER_LIST[loop]), enemysArr, balls);
      SOCKET_LIST[loop].emit("corpsesData", corpseArr);
    } catch(e){
    //  SOCKET_LIST[loop].emit("update", , enemysArr, balls);
    SOCKET_LIST[loop].emit('timeCheck',  new Date().getTime());
    SOCKET_LIST[loop].emit("updateDeath", enemysArr, balls);
    SOCKET_LIST[loop].emit("corpsesData", corpseArr);
    }

  }

  var nEnd = new Date().getTime();
  var nDiff = nEnd - nStart;
  //console.log("updateloop time = "+nDiff+"ms");
}

//player와 ball간의 충돌검사하는 함수
//충돌판정방법은 대충 이러함
//player반지름 + 공반지름 이 player와 ball간 거리보다 크면 충돌로 판정.
// 충돌시 player의 피 깎음
// 또한 그 공을 던진 사람의 점수를 올림.
// 또 공을 받으면, 반동으로 뒤로 말려남.











// function checkPlayerImpact(){
//   for(var outLoop in PLAYER_LIST){
//     for(var inLoop in PLAYER_LIST){
//       if(PLAYER_LIST[outLoop].)
//     }
//   }
// }

function checkImpact() {

  //loop for imapactCheck players and balls
  var nStart = new Date().getTime();
  for(var outLoop in PLAYER_LIST){
    for(var inLoop=0; inLoop < ballArr.length; inLoop++){

      //if안의 조건절은 위에서 설명한 충돌판정에 따름
      //또한 자신이 던진 공에 자신의 피가 깍이는 것을 방지하기위해 if조건절에서
      //(ballArr[inLoop].ownerId != PLAYER_LIST[outLoop].id)
      //를 사용하여 검사함.

      if ((ballArr[inLoop].ownerId != PLAYER_LIST[outLoop].id) && Vector.subStatic(PLAYER_LIST[outLoop].location, ballArr[inLoop].location).mag() < PLAYER_LIST[outLoop].mass + ballArr[inLoop].mass) {
          var radius = PLAYER_LIST[outLoop].mass + ballArr[inLoop].mass;

          //체력 감소
          PLAYER_LIST[outLoop].hp -= ballArr[inLoop].demage;

          // 점수 증가
          PLAYER_LIST[ballArr[inLoop].ownerSocketId].score += 10;

          //레벨업확인
          if(PLAYER_LIST[ballArr[inLoop].ownerSocketId].checkScore()){
            levelUp(ballArr[inLoop].ownerSocketId);
          }


          //공에 맞았음으로 반동을 적용한다.
          if (ballArr[inLoop].location.x > PLAYER_LIST[outLoop].location.x) {
              PLAYER_LIST[outLoop].applyForth(new Vector(-1, 0));
          } else {
              PLAYER_LIST[outLoop].applyForth(new Vector(1, 0));
          }

          // 맞은 공을  배열에서 삭제한다.
         PLAYER_LIST[ballArr[inLoop].ownerSocketId].nowBallCount--;
          ballArr.splice(inLoop, 1);
          continue;
      }
    }
  }
  var nEnd = new Date().getTime();
  //console.log("checkImpact time = "+(nEnd-nStart));
}

function levelUp(playerId){
  //정보 전송 목록
  // 1. Max hp
	// 2. Speed
	// 3. Throw power
	// 4. Max ball count
	// 5. Ball Demage
	// 6. Ball hp
  // 7. Jump demage
  var playerStat = {
    maxHp : PLAYER_LIST[playerId].maxHp,
    speed : PLAYER_LIST[playerId].speed,
    throwPower : PLAYER_LIST[playerId].throwPower,
    maxBallCount : PLAYER_LIST[playerId].maxBallCount,
    ballDemage : PLAYER_LIST[playerId].throwDemage,
    ballHp : PLAYER_LIST[playerId].ballHp,
    jumpDemage : PLAYER_LIST[playerId].jumpDemage,
    skillPoint : PLAYER_LIST[playerId].skillPoint
  }
  if(PLAYER_LIST[playerId].skillPoint >= 1){
    SOCKET_LIST[playerId].emit("levelUp", playerStat);
  }
}

//아직 수정중이다.
function checkBallImpact(){
  var nStartc = new Date().getTime();
  var outLoopLength = ballArr.length;
  for(var outLoop = 0; outLoop < outLoopLength; outLoop++){
    for(var inLoop = 0; inLoop < outLoopLength; inLoop++){
      try{
        if(ballArr[outLoop].ownerSocketId != ballArr[inLoop].ownerSocketId && Vector.subStatic(ballArr[outLoop].location, ballArr[inLoop].location).mag() < ballArr[outLoop].mass + ballArr[inLoop].mass){
          PLAYER_LIST[ballArr[inLoop].ownerSocketId].nowBallCount--;
          PLAYER_LIST[ballArr[outLoop].ownerSocketId].nowBallCount--;

          ballArr[inLoop].hp -= ballArr[outLoop].demage;
          ballArr[outLoop].hp -= ballArr[inLoop].demage;
          console.log("hp check "+  ballArr[inLoop].hp+", "+ballArr[outLoop].hp);

          if(ballArr[inLoop].hp <= 0){
            ballArr.splice(inLoop, 1);
          }
          if(ballArr[outLoop].hp <= 0){
            ballArr.splice(outLoop, 1);
          }



          // ballArr.splice(inLoop, 1);
          // ballArr.splice(outLoop, 1);
        }
      } catch(e){
      }
    }
  }
  var nEndc = new Date().getTime();
  //console.log("ballImpact time = "+(nEndc-nStartc));
}

//플레이어가 사망시, 호출된다.
//사망한 플레이어의 점수에따라 영혼이 만들어 지는 갯수가 달라진다.
//또한 각각의 영혼이 다르지만, 비슷한 색을 가지게 하였다. randomColor()
//이렇게 각각의 영혼을 만들면, 배열에 넣고, 충돌검사를 하는 함수에 보낸다.
function makeDeathBall(player){
  var circleNum = Math.round(player.score/5) +1;
  var colorArr =  randomColor({
    count: circleNum,
    hue: 'red'
  });

  for(var loop = 0; loop < circleNum; loop++){
    console.log("makle!");
    var data = {
      locationX : player.location.x - Math.random()*1 + Math.random()*1,
      locationY : player.location.y - Math.random()*1 + Math.random()*1,
      color : colorArr[loop]
    }
  //  console.log("color = "+data.color);
    corpseArr.push(data);
    console.log("push test = "+corpseArr.length);
  }
}

//영혼들과, 플레이어의 충돌검사를 한다.
//즉 플레이어가 영혼을 먹었는지를 판별한다.
//충돌했다면, 해당 영혼을 배열에서 삭제하고, 플레이어의 점수를 추가한다.
//또한 모두먹어 배열의 length가 0이면 해당 interval을 종료한다.
//매 루프마다, 영혼의 위치를 변화 시키기위해 -0.9 ~ 0.9의 값을 더하고 뺀다.
function corpseImpact(){
      if(corpseArr.length != 0){
        try{
          for(var outLoop in PLAYER_LIST){
            for(var inLoop = 0; inLoop < corpseArr.length; inLoop++){
              corpseArr[inLoop].locationX += (Math.random()*1- Math.random()*1);
              corpseArr[inLoop].locationY += (Math.random()*1- Math.random()*1);
              if(Vector.subStatic(PLAYER_LIST[outLoop].location, new Vector(corpseArr[inLoop].locationX, corpseArr[inLoop].locationY)).mag() < (PLAYER_LIST[outLoop].mass + 10)){
                PLAYER_LIST[outLoop].score += 10;
                corpseArr.splice(inLoop);
              }
            }
          }
        } catch(e){

        }
      }
}
}
