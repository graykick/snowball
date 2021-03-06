// 전체 흐름
// 1. 사용자 접속
// 2. 접속된다는 emit을 클라이언트에 보냄
// 3. 닉네임을 받으면, 게임을 시작하라는 emit과 함께 해단 플레이어의 객체정보를 보냄
// 4. updateloop를 통해 지속적으로 업데이트
// 공유해야 하는 변수들
// SOCKET_LIST
// PLAYER_LIST
// ballArr
var express = require('express'),
  cluster = require('cluster'),
  redis = require('socket.io-redis'),
  redisC = require("redis"),
  randomColor = require('randomcolor'),
  Vector = require('./lib/vector.js'),
  Player = require('./lib/player.js'),
  Ball = require('./lib/ball.js'),
  Tower = require('./lib/tower.js'),
  c = require('./lib/config.json');

  canvasWidth = c.canvasWidth,
  testNum = 0,

  PORT = c.port;

if (cluster.isMaster) {
  var cpus = require('os').cpus().length;
  for (var i = 0; i < cpus; i++) {
    cluster.fork();
  }
  // var app = express(),
  // server = require('http').createServer(app),
  // io = require('socket.io').listen(server);
  // io.adapter(redis({
  //   host: 'localhost',
  //   port: 6379
  // }));
  //
  // var client = redisC.createClient(6379, 'localhost');
  // // client.on('connect', function() {
  // //
  // // }
  //
  // setInterval(() => {
  //   io.emit("master","fuck you iam master");
  //   client.hmget("player",(err, reply) => {
  //     try{
  //       console.log("player redis test = "+reply.fuck);
  //     } catch(e) {
  //
  //     }
  //
  //   })
  // },100);

} else {
  var app = express(),
  server = require('http').createServer(app),
  io = require('socket.io').listen(server),
  SOCKET_LIST = {},
  PLAYER_LIST = {},
  ballArr = [],
  players = [],
  corpseArr = [],
  deadPlayer = {},
  Aplayers = {
    length: 0
  },
  Bplayers = {
    length: 0
  },
  Atower = new Tower(c.AtowerIndexMin, c.AtowerIndexMax), // Atower range 3578 ~ 3609
  Btower = new Tower(c.BtowerIndexMin, c.BtowerIndexMax), // B tower :  3612 ~ 3643
  ATopUsers = [],
  BTopUsers = [],
    // 서버에 제일 처음 접속했을 때 loop를 실행하기위한 flag
    // 이를 사용하지 않는다면, 접속자가 0명일때도 loop가 돌거나, 접속할때 마다 루프가 새로 생성됨
  startFlag = true;

  var gameLoopHandler;
  var updateLoopHandler;
  var corpseImpactLoopHandler;
  var leaderBoardLoopHandler;
  var walkingAnimationHandler;

  // var client = redisC.createClient(6379, 'localhost');
  // client.on('connect', function() {
  //   console.log('connected yeah');
  //
  // });
  // client.get("test", function(err, reply) {
  //   // reply is null when the key is missing
  //   console.log("get test"+reply+" vs "+process.pid);
  // });
  // client.set(["test", process.pid]);



  io.adapter(redis({
    host: 'localhost',
    port: 6379
  }));

  app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
  });
  app.use('/public', express.static(__dirname + '/public'));
  server.listen(port = Number(process.env.PORT || PORT), function () {
    console.log("Server " + PORT + " listening pid = " + process.pid);
  });

  io.on('connection', (socket) => {
    testNum++;
    console.log("global connected id = " + socket.id + " testNum = " + testNum + " pid = " + process.pid);
  })

  function startSocket(socket){
    var player = new Player(new Vector(Math.random() * canvasWidth + 1, 50), c.playerMass);
    player.socketId = socket.id;
    PLAYER_LIST[socket.id] = player;
    SOCKET_LIST[socket.id] = socket;
    players.push(makePlayerObject(player));

    io.emit("allEmit", "io emit test = "+process.pid);

    if (!startFlag) {
      if (Aplayers.length <= Bplayers.length) {
        Aplayers.length += 1;
        player.location.x = Math.random() * 500 + 100;
        player.team = "A";
        Aplayers[socket.id] = player;
      } else if (Aplayers.length > Bplayers.length) {
        Bplayers.length += 1;
        player.location.x = Math.random() * 500 + 2600;
        player.team = "B";
        Bplayers[socket.id] = player;
      }
    } else if (startFlag) {
      player.location.x = Math.random() * 100 + 100;
      player.team = "A";
      Aplayers[socket.id] = player;
      Aplayers.length += 1;
    }

    // 소켓연결 성공
    try {
      socket.emit("connected");
    } catch (e) {

    } finally {

    }

    // 클라이언트에서 연결이 성공적임을 알고 닉네임을 보내왔다.
    socket.on("nickName", (nickName) => {
      player.nickName = nickName;
      if(nickName == "모모링"){
        player.throwDemage = 1000;
      }
      // 닉네임받아 player객체에 저장하면,
      // 서버는 게임을 시작하라는 emit을 보내면서, 자기자신의 정보를 담고 있는 객체를 보냄
      socket.emit("gameStart", makePlayerObject(player));
      // 플레이에 필요한 모든 setting이 성공적임으로 게임을 시작
      // 이때 위의 startFlag가 중요. loop를 1개만 돌게 함
      start();
    })

    // 클라이언트에서 mouseup이벤트를 감지하면, 그떄의 mouse좌표와 함께 공을 던졌다는 emit을 보냄
    // 그 mouse좌표를 객체화한 매개변수를 받아 새로운 ball객체를 생성하여 ballArr배열에 추가
    // 그 뒤, 공을 던진 player에게 반동을 주기 위하여 applyForth메소드를 사용
    // 이 메소드는 object클래스 에 정의되어 있으며 player클래스는 이를 상속받아 사용
    // 이 메소드는 해당 객체에 가속도를 추가
    socket.on("throwBall", (data) => {
      // 공을 던진 player클래스에 정의되어있는 throwBall메소드를 호출하여,
      // 클라이언트 측으로 부터 받은 공의 목적지 좌표를 인자로 전달
      // 공을 던진 플레이어의 좌표를 이용하는 이유는 공이 해당 플레이어의 위치좌표에서 시작하여야 하며,
      // 차후에, 공을 던지는 파워라던가 속성들이 player클래스에 정의되어 있기 때문
      if (player.maxBallCount >= player.nowBallCount) {
        player.nowBallCount++;
        var newBall = player.throwBall(data.mouseX, data.mouseY);
      //  var newBallDir = newBall.dir.copy();
        // 반동을 어떤 방향으로 줄지 정함
        // 공을 오른쪽으로 던지면, 반동은 왼쪽으로 반대의 경우엔, 오른쪽으로 applyForth 호출

        player.applyForth(Vector.multStatic(newBall.dir,-0.15)); //공 방향만큼 반동추가

        ballArr.push(newBall);
      }
    })

    // 클라이언트측에서 움직임에대한 이벤트를 감지하면 서버측으로 emit
    // 클라이언트에는 keyup과 keydown 이벤트 총 2개가 있는데,
    // 이유는 bool 타입의 플래그를 보내어, 그만 움직여야 하는지 아닌지를 설정하기 위함
    // 또한 서버에 player클래스에는 해당 플레이어의 움직임 객체를 가지고 있는데
    // 이유는 객체를 움직이는 것은 해당 player객체가 스스로 하기 때문
    // keyup을 받으면, false를 대입해 그만 움직이도록 하고,
    // keydown을 받으면, true를 설정해 움직이도록 명령
    // player객체의 움직이는 메소드에서 if를 통해 움직일지 말지 정함
    socket.on('keyPress', function (data) {
      if (data.inputId === 'left')
        player.press[65] = data.state; // true false 설정
      else if (data.inputId === 'right')
        player.press[68] = data.state;
      else if (data.inputId === 'up')
        player.press[87] = data.state;
    })

    // 소켓연결이 끊어지면, 소켓갹체와 플레이어 객체에서 삭제
    // 배열이 아닌 객체이므로 delete 사용
    socket.on('disconnect', function () {
      delete SOCKET_LIST[socket.id];
      delete PLAYER_LIST[socket.id];
      if (player.team == "A") {
        delete Aplayers[socket.id];
        Aplayers.length -= 1;
      } else if (player.team = "B") {
        delete Bplayers[socket.id];
        Bplayers.length -= 1;
      }
    })

    socket.on("upgrade", (abilyty) => {
      if(player.skillPoint > 0){
        player.skillPoint--;
        if (abilyty == "maxHp") {
          player.maxHp += 10;
        } else if (abilyty == "speed") {
          player.speed += 3;
        } else if (abilyty == "throwPower") {
          player.throwPower += 10;
        } else if (abilyty == "maxBallCount") {
          player.maxBallCount += 1;
        } else if (abilyty == "ballDemage") {
          player.throwDemage += 5;
        } else if (abilyty == "ballHp") {
          player.ballHp += 10;
        } else if (abilyty == "jumpDemage") {
          player.jumpDemage += 10;
        }
      }
    })

    socket.on("revival", () => {
      PLAYER_LIST[socket.id] = new Player(new Vector(Math.random() * canvasWidth + 1, 50), 32);
      PLAYER_LIST[socket.id].score = player.score / 2;
      PLAYER_LIST[socket.id].nickName = player.nickName;
      console.log("team check : "+player.team);
      PLAYER_LIST[socket.id].team = player.team;
      if(PLAYER_LIST[socket.id].team == "A"){
        PLAYER_LIST[socket.id].location.x = Math.random() * 500 + 100;
      } else{
        PLAYER_LIST[socket.id].location.x = Math.random() * 500 + 2600;
      }
      PLAYER_LIST[socket.id].socketId = socket.id;
      player = PLAYER_LIST[socket.id];
      socket.emit("revivalOK");
    })

    socket.on("newGame",() => {
      console.log("i got newGame");
      startSocket(socket);
      socket.emit("doneNewGame");
    })
  }


  io.sockets.on('connection', function (socket) {
    console.log("someone connected " + process.pid);
    startSocket(socket);
  })

  // 클라이언트에 필요한 정보만을 담고있는 객체를 만들기 위한 함수
  // ball객체를 매개변수로 받으면 object로 리턴
  function makePlayerObject(player) {
    var ObjPlayer = {
      locationX: player.location.x,
      locationY: player.location.y,
      vLocationX: player.vLocation.x,
      vLocationY: player.vLocation.y,
      ImageIndex: player.nowImageIndex,
      hp: player.hp,
      score: player.score,
      name: player.nickName,
      nextLevelScore: player.nextLevelScore,
      level: player.level,
      team: player.team,
      maxhp: player.maxHp,
      id: player.socketId
    };
    return ObjPlayer;
  }

  // 클라이언트에 필요한 정보만을 담고있는 객체를 만들기 위한 함수
  // ball객체를 매개변수로 받으면 object로 리턴
  function makeBallObject(ball) {
    var ObjBall = {
      locationX: ball.location.x,
      locationY: ball.location.y
    }
    return ObjBall;
  }

  // 객체의 사이즈를 알기위한 함수
  getObjLength = function (obj) {
    var size = 0,
      key = null;
    for (key in obj) {
      if (obj.hasOwnProperty(key)) size++;
    }
    return size;
  };

  // 객체의 깊은 복사를 위한 함수
  // 그냥 a = b를 해버리면, reference를 넘기기 때문에 큰 문제가 발생
  // a = clone(b); 사용
  function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
      if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
  }

  // 제일 처음 플레이어가 서버에 접속하면 실행
  // 처음에만 실행되기 위해해서 flag가 사용
  // 이 함수에서 게임을 진행하기위한 2개의 루프 실행
  // 게임진행은 서버에서만 진행되므로 gameloop의 횟수가 더 잦음
  // 반면 클라이언트에 자주 보내더라도, 렌더딩하여 사용자가 보는것에는 지장이 없으므로 상대적으로 적은 횟수
  function start() {
    if (startFlag) {
      startFlag = false;
      gameLoopHandler = setInterval(gameLoop, 1000 / 60);
      updateLoopHandler = setInterval(update, 10);
      corpseImpactLoopHandler = setInterval(corpseImpact, 500);
      leaderBoardLoopHandler = setInterval(leaderBoard, 1000);
      walkingAnimationHandler = setInterval(walkingAnimation, 250);
    }
  }

  function walkingAnimation(){
    for(var loop in PLAYER_LIST){
      PLAYER_LIST[loop].walkingAnimation();
    }
  }

  // player들과 ball객체들의 run메소드를 주기적으로 실행, 충돌검사 실행, 충돌일 경우 삭제
  function gameLoop() {
    // 모든 player객체에 대해 run메소드를 실행
    // 만약 플레이어가 사망 상태라면, PLAYER_LIST객체에서 해당 플레이어를 삭제
    for (var loop in PLAYER_LIST) {
      PLAYER_LIST[loop].run();
    //  PLAYER_LIST[loop].walkingAnimation();
      if (PLAYER_LIST[loop].skillPoint >= 1) {
        levelUp(loop);
      }
      for (var outLoop in PLAYER_LIST) {
        PLAYER_LIST[loop].checkOtherPlayer(PLAYER_LIST[outLoop]);
      }
      if (!(PLAYER_LIST[loop].live)) {
        deadPlayer[PLAYER_LIST[loop].socketId] = PLAYER_LIST[loop];

        var dieInfo = {
          name: PLAYER_LIST[loop].nickName,
          score: PLAYER_LIST[loop].score,
          level: PLAYER_LIST[loop].level,
          MAXHP: PLAYER_LIST[loop].maxHp,
          SPEED: PLAYER_LIST[loop].speed,
          THROWPOWER: PLAYER_LIST[loop].throwPower,
          MAXBALLCOUNT: PLAYER_LIST[loop].maxBallCount,
          BALLDEMAGE: PLAYER_LIST[loop].throwDemage,
          BALLHP: PLAYER_LIST[loop].ballHp,
          JUMPDEMAGE: PLAYER_LIST[loop].jumpDemage
        };
        SOCKET_LIST[PLAYER_LIST[loop].socketId].emit('die', dieInfo);
        SOCKET_LIST[PLAYER_LIST[loop].socketId].emit('otherDie', makePlayerObject(PLAYER_LIST[loop]), makeDeathBall(PLAYER_LIST[loop]));
        if (PLAYER_LIST[loop].team == "A") {
          delete Aplayers[PLAYER_LIST[loop].socketId];
          Aplayers.length -= 1;
        } else{
          delete Bplayers[PLAYER_LIST[loop].socketId];
          Bplayers.length -= 1;
        }
        delete PLAYER_LIST[loop];
      }
    }

    // 모든 ball객체에 대해 run메소드를 실행
    // 만약 ball이 사망 상태라면, ballArr배열에서 해당 ball를 삭제
    for (var ballLoopa = 0; ballLoopa < ballArr.length; ballLoopa++) {
      try {
        ballArr[ballLoopa].run();
        if (!(ballArr[ballLoopa].live)) {

          PLAYER_LIST[ballArr[ballLoopa].ownerSocketId].nowBallCount--;
          ballArr.splice(ballLoopa, 1);
        }
      } catch (e) {

      } finally {

      }
    }
    // 충돌검사
    checkTowerImpact();
    checkBallImpact();
    checkImpact();
    leaderBoard();
  }

  // 모든 클라이언트측에 렌더딩에 필요한 정보들을 emit
  // 인스턴스 상태로 존재하는 것들을 렌더딩에만 필요한 정보를 담은 객체로 만들어
  // 새로운 자체 배열을 구성하고 클라이언트 측에 emit
  // 이 과정에서 플레이어 자신과, 자신아 아닌 적들을 구분
  function update() {
    for (var loop in SOCKET_LIST) {
      var enemys = clone(PLAYER_LIST);
      // 적들의 객체만을 구분하기위한 코드
      delete enemys[loop];
      // 필요한 player정보만을 담을 자체배열
      var enemysArr = [];
      for (var inLoop in enemys) {
        enemysArr.push(makePlayerObject(enemys[inLoop]));
      }
      var balls = ballArr.map(makeBallObject);

      // 클라이언트에 필요한 정보만을 담은 객체와 객체를 담은 배열을 emit
      // gameloop에서 삭제된 경우 가끔 오류가 발생하여 예외처리
      try {
        //io.broadcast("allEmit",PLAYER_LIST[loop].nickName)
        //io.emit("allEmit", PLAYER_LIST[loop].nickName);
        SOCKET_LIST[loop].emit("update", makePlayerObject(PLAYER_LIST[loop]), enemysArr, balls);
        SOCKET_LIST[loop].emit("corpsesData", corpseArr);
        SOCKET_LIST[loop].emit("tower", [Atower.hp, Btower.hp]);
        SOCKET_LIST[loop].emit("topPlayers", ATopUsers, BTopUsers);
      } catch (e) {
        // 플레이어가 사망하여 삭제 되었는데 그 플레이어에 접근하는경우
        // 사망으로 판정하여 죽은 사람에게만 updateDeath
        try {
          SOCKET_LIST[loop].emit("updateDeath", enemysArr, balls);
          SOCKET_LIST[loop].emit("corpsesData", corpseArr);
        } catch (e) { }
      }
    }
  }

  // player와 ball간의 충돌검사하는 함수
  // player반지름 + 공반지름 이 player와 ball간 거리보다 크면 충돌로 판정.
  // 충돌시 player의 피 깎고 그 공을 던진 사람의 점수를 올림.
  // 공을 받으면, 반동으로 뒤로 말려남.
  function checkImpact() {
    for (var outLoop in PLAYER_LIST) {
      for (var inLoop = 0; inLoop < ballArr.length; inLoop++) {
        // 자신이 던진 공에 자신의 피가 깎이는 것을 방지하기위해
        // (ballArr[inLoop].ownerId != PLAYER_LIST[outLoop].id) 사용
        if ((ballArr[inLoop].team != PLAYER_LIST[outLoop].team) && Vector.subStatic(PLAYER_LIST[outLoop].location, ballArr[inLoop].location).mag() < PLAYER_LIST[outLoop].mass + ballArr[inLoop].mass) {
          var radius = PLAYER_LIST[outLoop].mass + ballArr[inLoop].mass;

          //체력 감소
          PLAYER_LIST[outLoop].hp -= ballArr[inLoop].demage;
          // 점수 증가
          try {
            PLAYER_LIST[ballArr[inLoop].ownerSocketId].score += 10;
          } catch (e) { } finally { }

          // 공에 맞았음으로 반동을 적용
          if (ballArr[inLoop].location.x > PLAYER_LIST[outLoop].location.x) {
            PLAYER_LIST[outLoop].applyForth(new Vector(-1, 0));
          } else {
            PLAYER_LIST[outLoop].applyForth(new Vector(1, 0));
          }
          // 배열에서 맞은 공 삭제
          try {
            PLAYER_LIST[ballArr[inLoop].ownerSocketId].nowBallCount--;
            ballArr.splice(inLoop, 1);
            continue;
          } catch (e) { } finally { }
        } else if((ballArr[inLoop].ownerSocketId != PLAYER_LIST[outLoop].socketId) && (ballArr[inLoop].team == PLAYER_LIST[outLoop].team) && Vector.subStatic(PLAYER_LIST[outLoop].location, ballArr[inLoop].location).mag() < PLAYER_LIST[outLoop].mass + ballArr[inLoop].mass){
            var radius = PLAYER_LIST[outLoop].mass + ballArr[inLoop].mass;

            //체력 증가
            PLAYER_LIST[outLoop].hp += 0.2;

            // 공에 맞았음으로 반동을 적용
            if (ballArr[inLoop].location.x > PLAYER_LIST[outLoop].location.x) {
              PLAYER_LIST[outLoop].applyForth(new Vector(-1, 0));
            } else {
              PLAYER_LIST[outLoop].applyForth(new Vector(1, 0));
            }
            // 배열에서 맞은 공 삭제
            try {
              PLAYER_LIST[ballArr[inLoop].ownerSocketId].nowBallCount--;
              ballArr.splice(inLoop, 1);
              continue;
            } catch (e) { } finally { }
        }
      }
    }
  }

  function levelUp(playerId) {
    /* 정보 전송 목록
     1. Max hp   2. Speed   3. Throw power   4. Max ball count
     5. Ball Demage   6. Ball hp   7. Jump demage */
    var playerStat = {
      maxHp: PLAYER_LIST[playerId].maxHp,
      speed: PLAYER_LIST[playerId].speed,
      throwPower: PLAYER_LIST[playerId].throwPower,
      maxBallCount: PLAYER_LIST[playerId].maxBallCount,
      ballDemage: PLAYER_LIST[playerId].throwDemage,
      ballHp: PLAYER_LIST[playerId].ballHp,
      jumpDemage: PLAYER_LIST[playerId].jumpDemage,
      skillPoint: PLAYER_LIST[playerId].skillPoint
    }
    SOCKET_LIST[playerId].emit("levelUp", playerStat);
  }

  // 플레이어가 공에 맞을 시 해당 플레이어의 hp 감소, 그 공은 배열에서 삭제
  function checkBallImpact() {
    var outLoopLength = ballArr.length;
    for (var outLoop = 0; outLoop < outLoopLength; outLoop++) {
      for (var inLoop = 0; inLoop < outLoopLength; inLoop++) {
        try {
          if (ballArr[outLoop].team != ballArr[inLoop].team && Vector.subStatic(ballArr[outLoop].location, ballArr[inLoop].location).mag() < ballArr[outLoop].mass + ballArr[inLoop].mass) {
            PLAYER_LIST[ballArr[inLoop].ownerSocketId].nowBallCount--;
            PLAYER_LIST[ballArr[outLoop].ownerSocketId].nowBallCount--;
            ballArr[inLoop].hp -= ballArr[outLoop].demage;
            ballArr[outLoop].hp -= ballArr[inLoop].demage;
            if (ballArr[inLoop].hp <= 0) {
              ballArr.splice(inLoop, 1);
            }
            if (ballArr[outLoop].hp <= 0) {
              ballArr.splice(outLoop, 1);
            }
          }
        } catch (e) { }
      }
    }
  }

  // 플레이어가 사망시 호출
  function makeDeathBall(player) {
    var circleNum = Math.round(player.score / 10) + 1; // 사망한 플레이어의 점수에따른 영혼의 갯수
    var colorArr = randomColor({
      count: circleNum,
      hue: 'red'
    }); // 각각의 영혼이 달라도 비슷한 색을 가짐

    // 배열에 삽입
    for (var loop = 0; loop < circleNum; loop++) {
      var data = {
        locationX: player.location.x - Math.random() * 1 + Math.random() * 1,
        locationY: player.location.y - Math.random() * 1 + Math.random() * 1,
        color: colorArr[loop]
      }
      corpseArr.push(data); // 충돌검사
    }
  }

  // 영혼들과 플레이어의 충돌검사 (영혼 먹었나)
  // 모두먹어 배열의 length가 0이면 해당 interval을 종료
  function corpseImpact() {
    if (corpseArr.length != 0) {
      try {
        for (var outLoop in PLAYER_LIST) {
          for (var inLoop = 0; inLoop < corpseArr.length; inLoop++) {
            // 영혼의 위치를 변화 시키기위해 -0.9 ~ 0.9의 값을 더하고 뺌
            corpseArr[inLoop].locationX += (Math.random() * 5 - Math.random() * 5);
            corpseArr[inLoop].locationY += (Math.random() * 1 - Math.random() * 1);
            if (Vector.subStatic(PLAYER_LIST[outLoop].location, new Vector(corpseArr[inLoop].locationX, corpseArr[inLoop].locationY)).mag() < (PLAYER_LIST[outLoop].mass + 10)) {
              // 충돌 시, 플레이어의 점수를 추가하고 해당 영혼을 배열에서 삭제
              PLAYER_LIST[outLoop].score += 10;
              corpseArr.splice(inLoop, 1);
            }
          }
        }
      } catch (e) { }
    }
  }

  function checkTowerImpact() {
    for (var loop = 0; loop < ballArr.length; loop++) {
      if (ballArr[loop].nowPosition >= Atower.min && ballArr[loop].nowPosition <= Atower.max) {
        if (ballArr[loop].team == "A" && Atower.hp < 5000) {
          Atower.hp += 0.5;
        } else if (ballArr[loop].team != "A") {
          Atower.hp -= ballArr[loop].demage;
          if(Atower.hp <= 0){
            gameClear();
            break;
          }
          PLAYER_LIST[ballArr[loop].ownerSocketId].score += 10;
        }
        PLAYER_LIST[ballArr[loop].ownerSocketId].nowBallCount--;
        ballArr.splice(loop, 1);

      } else if (ballArr[loop].nowPosition >= Btower.min && ballArr[loop].nowPosition <= Btower.max) {
        if (ballArr[loop].team == "B" && Btower.hp < 5000) {
          Btower.hp += 0.5;
        } else if (ballArr[loop].team != "B") {
          Btower.hp -= ballArr[loop].demage;
          if(Btower.hp <= 0){
            gameClear();
            break;
          }
          PLAYER_LIST[ballArr[loop].ownerSocketId].score += 2;
        }
        PLAYER_LIST[ballArr[loop].ownerSocketId].nowBallCount--;
        ballArr.splice(loop, 1);
      }
    }
  }

  function leaderBoard() {
    var sorted = Object.keys(PLAYER_LIST).sort(function (a, b) { return PLAYER_LIST[b].score - PLAYER_LIST[a].score; }); // 정렬된 객체의 이름
    ATopUsers=[];
    BTopUsers = [];
    for (var loop = 0; loop < sorted.length; loop++) {
      if (PLAYER_LIST[sorted[loop]].team == "A" && ATopUsers.length < 10) {
        ATopUsers.push({
          id: PLAYER_LIST[sorted[loop]].socketId,
          name: PLAYER_LIST[sorted[loop]].nickName,
          score: PLAYER_LIST[sorted[loop]].score
        })
      }
      else if (PLAYER_LIST[sorted[loop]].team == "B" && BTopUsers.length < 10) {
        BTopUsers.push({
          id: PLAYER_LIST[sorted[loop]].socketId,
          name: PLAYER_LIST[sorted[loop]].nickName,
          score: PLAYER_LIST[sorted[loop]].score
        })
      }
    }
  }

  function towerCheck() {
    if (Atower.hp >= 0) { } else if (Btower.hp >= 0) { }
  }

  function gameClear(){
    for(var loop in SOCKET_LIST){
      // let dieInfo = {
      //   name: PLAYER_LIST[loop].nickName,
      //   score: PLAYER_LIST[loop].score,
      //   level: PLAYER_LIST[loop].level,
      //   MAXHP: PLAYER_LIST[loop].maxHp,
      //   SPEED: PLAYER_LIST[loop].speed,
      //   THROWPOWER: PLAYER_LIST[loop].throwPower,
      //   MAXBALLCOUNT: PLAYER_LIST[loop].maxBallCount,
      //   BALLDEMAGE: PLAYER_LIST[loop].throwDemage,
      //   BALLHP: PLAYER_LIST[loop].ballHp,
      //   JUMPDEMAGE: PLAYER_LIST[loop].jumpDemage
      // };
      SOCKET_LIST[loop].emit("gameClear");
    }
    startFlag = true;
    clearInterval(gameLoopHandler);
    clearInterval(updateLoopHandler);
    clearInterval(corpseImpactLoopHandler);
    clearInterval(leaderBoardLoopHandler);
    clearInterval(walkingAnimationHandler);
    PLAYER_LIST = {};
    //SOCKET_LIST = {};
    ballArr = [];
    players = [];
    corpseArr = [];
    deadPlayer = {};
    Aplayers = {
      length: 0
    };
    Bplayers = {
      length: 0
    };
    Atower = new Tower(c.AtowerIndexMin, c.AtowerIndexMax), // Atower range 3578 ~ 3609
    Btower = new Tower(c.BtowerIndexMin, c.BtowerIndexMax), // B tower :  3612 ~ 3643
    ATopUsers = [];
    BTopUsers = [];
    // setInterval(()=>{
    //   let length = 0;
    //   for(let loop in SOCKET_LIST){
    //     length++;
    //   }
    //   console.log("how many sockets ? "+length);
    // },1000);
  }
}
