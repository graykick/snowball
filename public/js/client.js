// 전체흐름
// 1. 소켓 접속
// 2. 접속완료 받으면 닉네임 전송
// 3. 게임시작 emit을 받으면, 게임시작
var introAnimationID,
  /* 메인의 로고 */
  loginCanvas = document.getElementById('loginCanvas'),
  balls_intro = initballs_intro(),
  date = new Date(),
  time = date.getTime(),
  mousePos = {
    x: 9999,
    y: 9999
  },
  /* 눈송이 */
  mp = 25, //max particles
  particles = [],
  W, H,
  /* 게임 */
  canvas = document.getElementById('myCanvas'),
  ctx = canvas.getContext('2d'),

  pointX, // 마우스의 좌표
  pointY,
  shotOffsetX, // 맵의 이동에 따른 마우스 offset

  gameStart = false, // 서버에서 게임시작이라고 하면 true
  mapWidth = 3200,
  mapState, // 0 = 왼쪽 1 = 중간 2 = 오른쪽
  Img = {}, // 해골, 맵
  player,
  players = [],
  ballArr = [],
  corpseArr = [],
  death = false,
  towers = [],
  ATopUsers = [],
  BTopUsers = [],
  gameHanddler, //렌더딩 루프의 핸들러. 죽으면 정지하기 위해 사용
  socket;

W = canvas.width = 1340;
H = canvas.height = 640;

Img.map = new Image();
Img.map.src = '/public/image/map.png';
Img.player = new Image();
Img.player.src = '/public/image/skeleton.png';
var skeletonSheet = new spriteSheet(Img.player, 9, 2, 64, 64);

window.requestAnimFrame = (function(callback) {
  return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
    function(callback) {
      window.setTimeout(callback, 1000 / 60);
    };
})();
window.cancelAniFrame = (function() {
  return window.cancelAnimationFrame ||
    window.webkitCancelAnimationFrame ||
    window.mozCancelAnimationFrame ||
    window.oCancelAnimationFrame ||
    function(id) {
      window.clearTimeout(id);
    };
})();
window.onload = function() {
  if (window.localStorage && window.localStorage.nick) {
    document.getElementById("nick").value = localStorage.nick;
  }
}
animate(loginCanvas, balls_intro, time, mousePos);
/* 눈송이 */
for (var i = 0; i < mp; i++) {
  particles.push({
    x: Math.random() * canvas.width, //x-coordinate
    y: Math.random() * canvas.height, //y-coordinate
    r: Math.random() * 4 + 1, //radius
    d: Math.random() * mp //density
  })
}
var angle = 0;

/* 메인의 로고 */
function searchKeyPress(e) { // trigger
  e = e || window.event;
  if (e.keyCode == 13) {
    document.getElementById('play').click();
    return false;
  }
  return true;
}

function submitNick() {
  document.getElementById('loginDiv').style.display = 'none';
  document.getElementById('gameAreaWrapper').style.display = 'flex';
  startSocket();
  cancelAniFrame(introAnimationID);
}

function initballs_intro() {
  balls_intro = [];

  var blue = '#13073A';
  var grey = '#4E4E4F';

  // Snowball.io
  balls_intro.push(new Ball(64, 12, 0, 0, blue));
  balls_intro.push(new Ball(76, 12, 0, 0, blue));
  balls_intro.push(new Ball(88, 12, 0, 0, blue));
  balls_intro.push(new Ball(412, 12, 0, 0, blue));
  balls_intro.push(new Ball(580, 12, 0, 0, blue));
  balls_intro.push(new Ball(616, 12, 0, 0, blue));
  balls_intro.push(new Ball(688, 12, 0, 0, grey));
  balls_intro.push(new Ball(40, 24, 0, 0, blue));
  balls_intro.push(new Ball(52, 24, 0, 0, blue));
  balls_intro.push(new Ball(88, 24, 0, 0, blue));
  balls_intro.push(new Ball(412, 24, 0, 0, blue));
  balls_intro.push(new Ball(580, 24, 0, 0, blue));
  balls_intro.push(new Ball(616, 36, 0, 0, blue));
  balls_intro.push(new Ball(40, 48, 0, 0, blue));
  balls_intro.push(new Ball(124, 48, 0, 0, blue));
  balls_intro.push(new Ball(136, 48, 0, 0, blue));
  balls_intro.push(new Ball(148, 48, 0, 0, blue));
  balls_intro.push(new Ball(160, 48, 0, 0, blue));
  balls_intro.push(new Ball(172, 48, 0, 0, blue));
  balls_intro.push(new Ball(220, 48, 0, 0, blue));
  balls_intro.push(new Ball(232, 48, 0, 0, blue));
  balls_intro.push(new Ball(244, 48, 0, 0, blue));
  balls_intro.push(new Ball(258, 48, 0, 0, blue));
  balls_intro.push(new Ball(292, 48, 0, 0, blue));
  balls_intro.push(new Ball(340, 48, 0, 0, blue));
  balls_intro.push(new Ball(388, 48, 0, 0, blue));
  balls_intro.push(new Ball(412, 48, 0, 0, blue));
  balls_intro.push(new Ball(424, 48, 0, 0, blue));
  balls_intro.push(new Ball(436, 48, 0, 0, blue));
  balls_intro.push(new Ball(448, 48, 0, 0, blue));
  balls_intro.push(new Ball(460, 48, 0, 0, blue));
  balls_intro.push(new Ball(496, 48, 0, 0, blue));
  balls_intro.push(new Ball(508, 48, 0, 0, blue));
  balls_intro.push(new Ball(520, 48, 0, 0, blue));
  balls_intro.push(new Ball(532, 48, 0, 0, blue));
  balls_intro.push(new Ball(580, 48, 0, 0, blue));
  balls_intro.push(new Ball(616, 48, 0, 0, blue));
  balls_intro.push(new Ball(688, 48, 0, 0, grey));
  balls_intro.push(new Ball(736, 48, 0, 0, grey));
  balls_intro.push(new Ball(748, 48, 0, 0, grey));
  balls_intro.push(new Ball(760, 48, 0, 0, grey));
  balls_intro.push(new Ball(772, 48, 0, 0, grey));
  balls_intro.push(new Ball(52, 60, 0, 0, blue));
  balls_intro.push(new Ball(64, 60, 0, 0, blue));
  balls_intro.push(new Ball(124, 60, 0, 0, blue));
  balls_intro.push(new Ball(172, 60, 0, 0, blue));
  balls_intro.push(new Ball(208, 60, 0, 0, blue));
  balls_intro.push(new Ball(268, 60, 0, 0, blue));
  balls_intro.push(new Ball(292, 60, 0, 0, blue));
  balls_intro.push(new Ball(328, 60, 0, 0, blue));
  balls_intro.push(new Ball(340, 60, 0, 0, blue));
  balls_intro.push(new Ball(376, 60, 0, 0, blue));
  balls_intro.push(new Ball(412, 60, 0, 0, blue));
  balls_intro.push(new Ball(460, 60, 0, 0, blue));
  balls_intro.push(new Ball(472, 60, 0, 0, blue));
  balls_intro.push(new Ball(544, 60, 0, 0, blue));
  balls_intro.push(new Ball(580, 60, 0, 0, blue));
  balls_intro.push(new Ball(616, 60, 0, 0, blue));
  balls_intro.push(new Ball(688, 60, 0, 0, grey));
  balls_intro.push(new Ball(724, 60, 0, 0, blue));
  balls_intro.push(new Ball(772, 60, 0, 0, blue));
  balls_intro.push(new Ball(64, 72, 0, 0, blue));
  balls_intro.push(new Ball(616, 60, 0, 0, blue));
  balls_intro.push(new Ball(724, 60, 0, 0, grey));
  balls_intro.push(new Ball(772, 60, 0, 0, grey));
  balls_intro.push(new Ball(64, 72, 0, 0, blue));
  balls_intro.push(new Ball(76, 72, 0, 0, blue));
  balls_intro.push(new Ball(88, 72, 0, 0, blue));
  balls_intro.push(new Ball(124, 72, 0, 0, blue));
  balls_intro.push(new Ball(172, 72, 0, 0, blue));
  balls_intro.push(new Ball(208, 72, 0, 0, blue));
  balls_intro.push(new Ball(268, 72, 0, 0, blue));
  balls_intro.push(new Ball(292, 72, 0, 0, blue));
  balls_intro.push(new Ball(304, 72, 0, 0, blue));
  balls_intro.push(new Ball(328, 72, 0, 0, blue));
  balls_intro.push(new Ball(352, 72, 0, 0, blue));
  balls_intro.push(new Ball(376, 72, 0, 0, blue));
  balls_intro.push(new Ball(412, 72, 0, 0, blue));
  balls_intro.push(new Ball(472, 72, 0, 0, blue));
  balls_intro.push(new Ball(532, 72, 0, 0, blue));
  balls_intro.push(new Ball(544, 72, 0, 0, blue));
  balls_intro.push(new Ball(580, 72, 0, 0, blue));
  balls_intro.push(new Ball(616, 72, 0, 0, blue));
  balls_intro.push(new Ball(688, 72, 0, 0, grey));
  balls_intro.push(new Ball(712, 72, 0, 0, grey));
  balls_intro.push(new Ball(724, 72, 0, 0, grey));
  balls_intro.push(new Ball(784, 72, 0, 0, grey));
  balls_intro.push(new Ball(88, 84, 0, 0, grey));
  balls_intro.push(new Ball(124, 84, 0, 0, blue));
  balls_intro.push(new Ball(172, 84, 0, 0, blue));
  balls_intro.push(new Ball(208, 84, 0, 0, blue));
  balls_intro.push(new Ball(268, 84, 0, 0, blue));
  balls_intro.push(new Ball(304, 84, 0, 0, blue));
  balls_intro.push(new Ball(328, 84, 0, 0, blue));
  balls_intro.push(new Ball(352, 84, 0, 0, blue));
  balls_intro.push(new Ball(376, 84, 0, 0, blue));
  balls_intro.push(new Ball(412, 84, 0, 0, blue));
  balls_intro.push(new Ball(472, 84, 0, 0, blue));
  balls_intro.push(new Ball(496, 84, 0, 0, blue));
  balls_intro.push(new Ball(508, 84, 0, 0, blue));
  balls_intro.push(new Ball(544, 84, 0, 0, blue));
  balls_intro.push(new Ball(580, 84, 0, 0, blue));
  balls_intro.push(new Ball(616, 84, 0, 0, blue));
  balls_intro.push(new Ball(688, 84, 0, 0, grey));
  balls_intro.push(new Ball(712, 84, 0, 0, grey));
  balls_intro.push(new Ball(784, 84, 0, 0, grey));
  balls_intro.push(new Ball(88, 84, 0, 0, blue));
  balls_intro.push(new Ball(124, 84, 0, 0, blue));
  balls_intro.push(new Ball(172, 84, 0, 0, blue));
  balls_intro.push(new Ball(208, 84, 0, 0, blue));
  balls_intro.push(new Ball(268, 84, 0, 0, blue));
  balls_intro.push(new Ball(304, 96, 0, 0, blue));
  balls_intro.push(new Ball(316, 96, 0, 0, blue));
  balls_intro.push(new Ball(352, 96, 0, 0, blue));
  balls_intro.push(new Ball(364, 96, 0, 0, blue));
  balls_intro.push(new Ball(412, 96, 0, 0, blue));
  balls_intro.push(new Ball(460, 96, 0, 0, blue));
  balls_intro.push(new Ball(472, 96, 0, 0, blue));
  balls_intro.push(new Ball(496, 96, 0, 0, blue));
  balls_intro.push(new Ball(544, 96, 0, 0, blue));
  balls_intro.push(new Ball(580, 96, 0, 0, blue));
  balls_intro.push(new Ball(616, 96, 0, 0, blue));
  balls_intro.push(new Ball(688, 96, 0, 0, grey));
  balls_intro.push(new Ball(724, 96, 0, 0, grey));
  balls_intro.push(new Ball(772, 96, 0, 0, grey));
  balls_intro.push(new Ball(784, 96, 0, 0, grey));
  balls_intro.push(new Ball(40, 108, 0, 0, blue));
  balls_intro.push(new Ball(76, 108, 0, 0, blue));
  balls_intro.push(new Ball(88, 108, 0, 0, blue));
  balls_intro.push(new Ball(124, 108, 0, 0, blue));
  balls_intro.push(new Ball(172, 108, 0, 0, blue));
  balls_intro.push(new Ball(208, 108, 0, 0, blue));
  balls_intro.push(new Ball(220, 108, 0, 0, blue));
  balls_intro.push(new Ball(256, 108, 0, 0, blue));
  balls_intro.push(new Ball(304, 108, 0, 0, blue));
  balls_intro.push(new Ball(316, 108, 0, 0, blue));
  balls_intro.push(new Ball(352, 108, 0, 0, blue));
  balls_intro.push(new Ball(364, 108, 0, 0, blue));
  balls_intro.push(new Ball(412, 108, 0, 0, blue));
  balls_intro.push(new Ball(424, 108, 0, 0, blue));
  balls_intro.push(new Ball(460, 108, 0, 0, blue));
  balls_intro.push(new Ball(496, 108, 0, 0, blue));
  balls_intro.push(new Ball(532, 108, 0, 0, blue));
  balls_intro.push(new Ball(544, 108, 0, 0, blue));
  balls_intro.push(new Ball(580, 108, 0, 0, blue));
  balls_intro.push(new Ball(616, 108, 0, 0, blue));
  balls_intro.push(new Ball(652, 108, 0, 0, grey));
  balls_intro.push(new Ball(688, 108, 0, 0, grey));
  balls_intro.push(new Ball(724, 108, 0, 0, grey));
  balls_intro.push(new Ball(736, 108, 0, 0, grey));
  balls_intro.push(new Ball(772, 108, 0, 0, grey));
  balls_intro.push(new Ball(52, 120, 0, 0, blue));
  balls_intro.push(new Ball(64, 120, 0, 0, blue));
  balls_intro.push(new Ball(76, 120, 0, 0, blue));
  balls_intro.push(new Ball(232, 120, 0, 0, blue));
  balls_intro.push(new Ball(244, 120, 0, 0, blue));
  balls_intro.push(new Ball(436, 120, 0, 0, blue));
  balls_intro.push(new Ball(448, 120, 0, 0, blue));
  balls_intro.push(new Ball(508, 120, 0, 0, blue));
  balls_intro.push(new Ball(502, 120, 0, 0, blue));
  balls_intro.push(new Ball(652, 120, 0, 0, grey));
  balls_intro.push(new Ball(736, 120, 0, 0, grey));
  balls_intro.push(new Ball(748, 120, 0, 0, grey));
  balls_intro.push(new Ball(760, 120, 0, 0, grey));

  return balls_intro;
}

function getMousePos(canvas, evt) {
  // get canvas position
  var obj = canvas;
  var top = 0;
  var left = 0;
  while (obj.tagName != 'BODY') {
    top += obj.offsetTop;
    left += obj.offsetLeft;
    obj = obj.offsetParent;
  }

  // return relative mouse position
  var mouseX = evt.clientX - left + window.pageXOffset;
  var mouseY = evt.clientY - top + window.pageYOffset;
  return {
    x: mouseX,
    y: mouseY
  };
}

function updateballs_intro(canvas, balls_intro, timeDiff, mousePos) {
  var context = canvas.getContext('2d');
  var collisionDamper = 0.3;
  var floorFriction = 0.0005 * timeDiff;
  var mouseForceMultiplier = 1 * timeDiff;
  var restoreForce = 0.002 * timeDiff;

  for (var n = 0; n < balls_intro.length; n++) {
    var ball = balls_intro[n];
    // set ball position based on velocity
    ball.y += ball.vy;
    ball.x += ball.vx;

    // restore forces
    if (ball.x > ball.origX) ball.vx -= restoreForce;
    else ball.vx += restoreForce;
    if (ball.y > ball.origY) ball.vy -= restoreForce;
    else ball.vy += restoreForce;

    // mouse forces
    var mouseX = mousePos.x;
    var mouseY = mousePos.y;

    var distX = ball.x - mouseX;
    var distY = ball.y - mouseY;

    var radius = Math.sqrt(Math.pow(distX, 2) + Math.pow(distY, 2));

    var totalDist = Math.abs(distX) + Math.abs(distY);

    var forceX = (Math.abs(distX) / totalDist) * (1 / radius) * mouseForceMultiplier;
    var forceY = (Math.abs(distY) / totalDist) * (1 / radius) * mouseForceMultiplier;

    // mouse is left of ball
    if (distX > 0) ball.vx += forceX;
    else ball.vx -= forceX;
    // mouse is on top of ball
    if (distY > 0) ball.vy += forceY;
    else ball.vy -= forceY;

    // floor friction
    if (ball.vx > 0) ball.vx -= floorFriction;
    else if (ball.vx < 0) ball.vx += floorFriction;
    if (ball.vy > 0) ball.vy -= floorFriction;
    else if (ball.vy < 0) ball.vy += floorFriction;

    // floor condition
    if (ball.y > (canvas.height - ball.radius)) {
      ball.y = canvas.height - ball.radius - 2;
      ball.vy *= -1;
      ball.vy *= (1 - collisionDamper);
    }

    // ceiling condition
    if (ball.y < (ball.radius)) {
      ball.y = ball.radius + 2;
      ball.vy *= -1;
      ball.vy *= (1 - collisionDamper);
    }

    // right wall condition
    if (ball.x > (canvas.width - ball.radius)) {
      ball.x = canvas.width - ball.radius - 2;
      ball.vx *= -1;
      ball.vx *= (1 - collisionDamper);
    }

    // left wall condition
    if (ball.x < (ball.radius)) {
      ball.x = ball.radius + 2;
      ball.vx *= -1;
      ball.vx *= (1 - collisionDamper);
    }
  }
}

function Ball(x, y, vx, vy, color) {
  this.x = x;
  this.y = y;
  this.vx = vx;
  this.vy = vy;
  this.color = color;
  this.origX = x;
  this.origY = y;
  this.radius = 10;
}

function animate(canvas, balls_intro, lastTime, mousePos) {
  var context = loginCanvas.getContext('2d');

  // update
  var date = new Date();
  var time = date.getTime();
  var timeDiff = time - lastTime;
  updateballs_intro(loginCanvas, balls_intro, timeDiff, mousePos);
  lastTime = time;

  // clear
  context.clearRect(0, 0, loginCanvas.width, loginCanvas.height);

  // render
  for (var n = 0; n < balls_intro.length; n++) {
    var ball = balls_intro[n];
    context.beginPath();
    context.arc(ball.x, ball.y, ball.radius, 0, 2 * Math.PI, false);
    context.fillStyle = ball.color;
    context.fill();
  }

  // request new frame
  introAnimationID = requestAnimFrame(function() {
    animate(loginCanvas, balls_intro, lastTime, mousePos);
  });
}
var mousePos = {
  x: 9999,
  y: 9999
};
loginCanvas.addEventListener('mousemove', function(evt) {
  var pos = getMousePos(loginCanvas, evt);
  mousePos.x = pos.x;
  mousePos.y = pos.y;
});

loginCanvas.addEventListener('mouseout', function(evt) {
  mousePos.x = 9999;
  mousePos.y = 9999;
});

/* 게임 */
function startSocket() {
  socket = io({transports: ['websocket']});

  socket.on("connected", () => {
    if (window.localStorage) {
      localStorage.nick = nick.value;
    }
    socket.emit("nickName", nick.value);
  });

  // 자신의 객체를 클라이언트에 있는 player에 대입
  socket.on("gameStart", (me) => {
    this.player = me;
    gameStart();
  });

  // 서버에서 계속 업데이트하는 emit을 받아 클라이언트의 글로벌 변수와 배열에 대입
  socket.on("update", (me, enemys, balls) => {
    player = me;
    players = enemys;
    ballArr = balls;
  })

  socket.on("updateDeath", (enemys, balls) => {
    players = enemys;
    ballArr = balls;
  })

  // 죽으면 렌더링 루프를 종료함.
  socket.on("die", (information) => {
    document.getElementById("NAME").innerHTML = "name : " + information.name;
    document.getElementById("SCORE").innerHTML = "score : " + information.score;
    document.getElementById("LEVEL").innerHTML = "level : " + information.level;

    document.getElementById("MAXHP").innerHTML = "maxhp : " + information.MAXHP;
    document.getElementById("SPEED").innerHTML = "speed : " + information.SPEED;
    document.getElementById("THROWPOWER").innerHTML = "throw power : " + information.THROWPOWER;
    document.getElementById("MAXBALLCOUNT").innerHTML = "max ball count : " + information.MAXBALLCOUNT;
    document.getElementById("BALLDEMAGE").innerHTML = "ball demage : " + information.BALLDEMAGE;
    document.getElementById("BALLHP").innerHTML = "ball hp : " + information.BALLHP;
    document.getElementById("JUMPDEMAGE").innerHTML = "jump demage : " + information.JUMPDEMAGE;
    death = true;

    document.getElementById("dieWrapper").style.display = "flex";
  })

  socket.on("revivalOK", () => {
    document.getElementById("dieWrapper").style.display = "none";
    document.getElementById("upgradeForm").style.display = "none";
    death = false;
  })

  socket.on("levelUp", (playerStat) => {
    //레벌업 창 띄우고, 선택한것 emit
    this.skillPoint = playerStat.skillPoint;
    document.getElementById("maxHp").innerHTML = "Max Hp : " + playerStat.maxHp;
    document.getElementById("speed").innerHTML = "Speed : " + playerStat.speed;
    document.getElementById("throwPower").innerHTML = "Throw Power : " + playerStat.throwPower;
    document.getElementById("maxBallCount").innerHTML = "Max Ball Count : " + playerStat.maxBallCount;
    document.getElementById("balldemage").innerHTML = "Ball Demage : " + playerStat.ballDemage;
    document.getElementById("ballHp").innerHTML = "Ball Hp : " + playerStat.ballHp;
    document.getElementById("jumpDemage").innerHTML = "Jump Demage : " + playerStat.jumpDemage;
    document.getElementById('statContainer').style.display = 'inline-block';
    document.getElementById("upgradeForm").style.display = "inline-block";
  })

  socket.on("tower", (tower) => {
    towers = tower;
  })

  // 다른 플레이어가 사망할 때 실행
  // 콜백의 인자는 사망플레이어의 영혼을 매개변수로 받아 전역변수에 대입
  socket.on("corpsesData", (corpseArr) => {
    this.corpseArr = corpseArr;
  })

  socket.on("topPlayers", (ATops, BTops) => {
    BTopUsers = BTops;
    ATopUsers = ATops;
  })

  function gameStart() {
    startEvent();
    animationStart();

    function animationStart() {
      drawMap(player);
      for (var loop = 0; loop < players.length; loop++) {
        drawPlayer(players[loop]);
      }
      drawMyPlayer(player);
      drawScoreBar(player);
      for (var loop = 0; loop < ballArr.length; loop++) {
        drawBall(ballArr[loop]);
      }
      dieEffecte();
      dieScreen();
      drawTower();
      drawScore();
      drawLeaderBoard();
      drawMiniMap();
      SnowDraw();
      requestAnimFrame(animationStart);
    }
  }
}

function upgradeEmit(abilyty) {
  socket.emit("upgrade", abilyty);
  document.getElementById('statContainer').style.display = 'none';
}

// 이벤트리스너 할당
// mousemove: 현재 마우스의 좌표를 알기위해 사용
// mouseup: 서버측에 공을 던졌음을 알리기위해 사용, 마우스의 좌표를 담은 객체를 함께 전송
function startEvent() {
  canvas.addEventListener('mousemove', function(event) {
    pointX = event.offsetX;
    pointY = event.offsetY;
  });
  canvas.addEventListener('mouseup', function(event) {
    var ballData = {
      mouseY: pointY,
      mouseX: pointX + shotOffsetX
    };
    if (!death) {
      socket.emit('throwBall', ballData);
    }
  });

  // 움직임 이벤트. 방향과 flag를 담은 객체 전송
  document.onkeydown = function(event) {
    if (event.keyCode === 68) //d
      socket.emit('keyPress', {
      inputId: 'right',
      state: true
    });
    else if (event.keyCode === 65) //a
      socket.emit('keyPress', {
      inputId: 'left',
      state: true
    });
    else if (event.keyCode === 87) // w
      socket.emit('keyPress', {
      inputId: 'up',
      state: true
    });
  }

  // 그만 움직임 이벤트. 방향과 flag를 담은 객체를 함께 전송
  document.onkeyup = function(event) {
    if (event.keyCode === 68) //d
      socket.emit('keyPress', {
      inputId: 'right',
      state: false
    });
    else if (event.keyCode === 65) //a
      socket.emit('keyPress', {
      inputId: 'left',
      state: false
    });
    else if (event.keyCode === 87) // w
      socket.emit('keyPress', {
      inputId: 'up',
      state: false
    });
  }
}

function drawScoreBar(player) {
  // 빈 게이지
  ctx.save();
  ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
  ctx.fillRect(canvas.width / 4, canvas.height - 70, (canvas.width / 4) * 2, 20);
  ctx.beginPath();
  ctx.arc(canvas.width / 4, canvas.height - 70 + 10, 10, Math.PI / 2, Math.PI * 3 / 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc((canvas.width / 4) * 3, canvas.height - 70 + 10, 10, Math.PI / 2, Math.PI * 3 / 2, true);
  ctx.fill();
  ctx.restore();

  // 찬 게이지
  ctx.save();
  ctx.fillStyle = "rgb(255, 236, 71)";
  ctx.fillRect(canvas.width / 4, canvas.height - 70 + 2, player.score * (((canvas.width / 4) * 2) / player.nextLevelScore) - 2, 20 - 4);
  ctx.beginPath();
  ctx.arc(canvas.width / 4 + 2, canvas.height - 70 + 10, 8, Math.PI / 2, Math.PI * 3 / 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(canvas.width / 4 + player.score * (((canvas.width / 4) * 2) / player.nextLevelScore) - 2, canvas.height - 70 + 10, 8, Math.PI / 2, Math.PI * 3 / 2, true);
  ctx.fill();
  ctx.restore();

  // 경험치 / 다음레벨 경험치
  ctx.save();
  ctx.textBaseline = "middle";
  ctx.font = "900 10pt Arial";
  ctx.fillStyle = "white";
  ctx.fillText(player.level + " lvl  " + player.score + " / " + player.nextLevelScore, canvas.width / 2 - ctx.measureText(player.level + " lvl  " + player.score + " / " + player.nextLevelScore).width / 2, canvas.height - 70 + 10);
  ctx.strokeStyle = "black";
  ctx.strokeText(player.level + " lvl  " + player.score + " / " + player.nextLevelScore, canvas.width / 2 - ctx.measureText(player.level + " lvl  " + player.score + " / " + player.nextLevelScore).width / 2, canvas.height - 70 + 10);
  ctx.restore();
}

function drawMyPlayer(player) {
  if (!death) {
    ctx.save();
    ctx.shadowBlur = 20;
    ctx.shadowColor = "#00e5bb";
    ctx.font = "15px Arial";

    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.fillRect(player.vLocationX - 50, player.locationY - 42, 100, 10);
    ctx.beginPath();
    ctx.arc(player.vLocationX - 50, player.locationY - 42 + 5, 5, Math.PI / 2, Math.PI * 3 / 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(player.vLocationX + 50, player.locationY - 42 + 5, 5, Math.PI / 2, Math.PI * 3 / 2, true);
    ctx.fill();

    // 찬 게이지
    ctx.fillStyle = "#00ff80";
    ctx.fillRect(player.vLocationX - 50, player.locationY - 42 + 1, player.hp * (100 / player.maxhp), 8);
    ctx.beginPath();
    ctx.arc(player.vLocationX - 50 + 2, player.locationY - 42 + 5, 4, Math.PI / 2, Math.PI * 3 / 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(player.vLocationX - 50 + player.hp * (100 / player.maxhp) - 1, player.locationY - 42 + 5, 4, Math.PI / 2, Math.PI * 3 / 2, true);
    ctx.fill();

    // 피통
    ctx.fillStyle = "white";
    ctx.strokeStyle = "black";
    ctx.font = "bolder 18px Arial";
    ctx.shadowBlur = 0;

    //닉네임
    ctx.fillText(player.level + "lv " + player.name, player.vLocationX - ctx.measureText(player.level + "lv " + player.name).width / 2, player.locationY - 52);
    ctx.strokeText(player.level + "lv " + player.name, player.vLocationX - ctx.measureText(player.level + "lv " + player.name).width / 2, player.locationY - 52);

    // 해골
    ctx.shadowBlur = 20;
    ctx.drawImage(skeletonSheet.getSheet(player.ImageIndex), player.vLocationX - 32, player.vLocationY - 32);
    ctx.restore();
  }
}

// 다른 플레이어를 그림
// 맵의 이동때문에 크게 3가지로 나뉨
// 1. 자신이 왼쪽에 있는경우 2. 자신이 중간이 있는경우 3. 자신이 오른쪽에 있는 경우
// 이 3가지 경우를 분기하여, 각기다른 위치에 상대방을 그림
// 이 3가지 분기는 자신의 위치에 따라 달라짐. 그래서 if의 조건절에 자신의 위치가 사용
function drawPlayer(player) {
  ctx.save();
  ctx.shadowBlur = 20;
  ctx.shadowColor = "red";
  if (player.team == this.player.team) {
    ctx.shadowColor = "blue";
  }
  ctx.font = "15px Arial";

  // 자신이 왼쪽이 있는 경우. 서버에서 받은대로 그림
  if (this.player.locationX - 670 < 0) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.fillRect(player.locationX - 50, player.locationY - 42, 100, 10);
    ctx.beginPath();
    ctx.arc(player.locationX - 50, player.locationY - 42 + 5, 5, Math.PI / 2, Math.PI * 3 / 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(player.locationX + 50, player.locationY - 42 + 5, 5, Math.PI / 2, Math.PI * 3 / 2, true);
    ctx.fill();
    ctx.fillStyle = "red";
    if (player.team == this.player.team) {
      ctx.fillStyle = "blue";
    }
    ctx.fillRect(player.locationX - 50, player.locationY - 42 + 1, player.hp * (100 / player.maxhp), 8);
    ctx.beginPath();
    ctx.arc(player.locationX - 50 + 2, player.locationY - 42 + 5, 4, Math.PI / 2, Math.PI * 3 / 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(player.locationX - 50 + player.hp * (100 / player.maxhp) - 1, player.locationY - 42 + 5, 4, Math.PI / 2, Math.PI * 3 / 2, true);
    ctx.fill();
    ctx.fillStyle = "white";
    ctx.strokeStyle = "black";
    ctx.font = "18px Arial";
    ctx.shadowBlur = 0;

    // 닉네임
    ctx.fillText(player.level + "lv " + player.name, player.locationX + 50 - ctx.measureText(player.level + "lv " + player.name).width, player.locationY - 52);
    ctx.strokeText(player.level + "lv " + player.name, player.locationX + 50 - ctx.measureText(player.level + "lv " + player.name).width, player.locationY - 52);

    ctx.shadowBlur = 20;
    ctx.drawImage(skeletonSheet.getSheet(player.ImageIndex), (player.locationX - 32), player.locationY - 32);
  }
  // 자신이 오른쪽에 있는 경우
  // this.player.locationX+670>3200
  // 공식은 상대위치 - 맵 width + 화면 width (-42는 offset이므로 상관 X)
  else if (this.player.locationX + 670 > 3200) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.fillRect(player.locationX - 50 - mapWidth + canvas.width, player.locationY - 42, 100, 10);
    ctx.beginPath();
    ctx.arc(player.locationX - 50 - mapWidth + canvas.width, player.locationY - 42 + 5, 5, Math.PI / 2, Math.PI * 3 / 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(player.locationX + 50 - mapWidth + canvas.width, player.locationY - 42 + 5, 5, Math.PI / 2, Math.PI * 3 / 2, true);
    ctx.fill();
    ctx.fillStyle = "red";
    if (player.team == this.player.team) {
      ctx.fillStyle = "blue";
    }
    ctx.fillRect(player.locationX - 50 - mapWidth + canvas.width, player.locationY - 42 + 1, player.hp * (100 / player.maxhp), 8);
    ctx.beginPath();
    ctx.arc(player.locationX - 50 + 2 - mapWidth + canvas.width, player.locationY - 42 + 5, 4, Math.PI / 2, Math.PI * 3 / 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(player.locationX - 50 - mapWidth + canvas.width + player.hp * (100 / player.maxhp) - 1, player.locationY - 42 + 5, 4, Math.PI / 2, Math.PI * 3 / 2, true);
    ctx.fill();
    ctx.fillStyle = "white";
    ctx.strokeStyle = "black";
    ctx.font = "18px Arial";
    ctx.shadowBlur = 0;

    // 닉네임
    ctx.fillText(player.level + "lv " + player.name, player.locationX - mapWidth + canvas.width + 50 - ctx.measureText(player.level + "lv " + player.name).width, player.locationY - 52);
    ctx.strokeText(player.level + "lv " + player.name, player.locationX - mapWidth + canvas.width + 50 - ctx.measureText(player.level + "lv " + player.name).width, player.locationY - 52);
    ctx.shadowBlur = 20;
    ctx.drawImage(skeletonSheet.getSheet(player.ImageIndex), (player.locationX - 32) - mapWidth + canvas.width, player.locationY - 32);
  }
  // 자신이 중간에 있는 경우
  // 자신이 중간에 있음으로, 상대의 위치를 이에 맞추어야 한다.
  // 상대위치 - 자신위치 + 화면크기/2
  else {
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.fillRect(player.locationX - 50 - this.player.locationX + (canvas.width / 2), player.locationY - 42, 100, 10);
    ctx.beginPath();
    ctx.arc(player.locationX - 50 - this.player.locationX + (canvas.width / 2), player.locationY - 42 + 5, 5, Math.PI / 2, Math.PI * 3 / 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(player.locationX + 50 - this.player.locationX + (canvas.width / 2), player.locationY - 42 + 5, 5, Math.PI / 2, Math.PI * 3 / 2, true);
    ctx.fill();
    ctx.fillStyle = "red";
    if (player.team == this.player.team) {
      ctx.fillStyle = "blue";
    }
    ctx.fillRect(player.locationX - 50 - this.player.locationX + (canvas.width / 2), player.locationY - 42 + 1, player.hp * (100 / player.maxhp), 8);
    ctx.beginPath();
    ctx.arc(player.locationX - 50 + 2 - this.player.locationX + (canvas.width / 2), player.locationY - 42 + 5, 4, Math.PI / 2, Math.PI * 3 / 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(player.locationX - 50 - this.player.locationX + (canvas.width / 2) + player.hp * (100 / player.maxhp) - 1, player.locationY - 42 + 5, 4, Math.PI / 2, Math.PI * 3 / 2, true);
    ctx.fill();
    ctx.fillStyle = "white";
    ctx.strokeStyle = "black";
    ctx.font = "18px Arial";
    ctx.shadowBlur = 0;

    // 닉네임을 그린다.
    ctx.fillText(player.level + "lv " + player.name, (player.locationX) - this.player.locationX + (canvas.width / 2) + 50 - ctx.measureText(player.level + "lv " + player.name).width, player.locationY - 52);
    ctx.strokeText(player.level + "lv " + player.name, (player.locationX) - this.player.locationX + (canvas.width / 2) + 50 - ctx.measureText(player.level + "lv " + player.name).width, player.locationY - 52);
    ctx.shadowBlur = 20;
    ctx.drawImage(skeletonSheet.getSheet(player.ImageIndex), (player.locationX - 32) - this.player.locationX + (canvas.width / 2), player.locationY - 32);
  }
  ctx.restore();
}

// 자신의 위치에 따라 맵의 어디를 그려야 할지 정해짐
// 1. 자신이 왼쪽에 있는 경우 2. 자신이 중간에 있는 경우 3. 자신이 오른쪽에 있는경우
// 자신이 중간에 있는경우는 맵이 이동하지만, 그 외에경우는 고정
function drawMap(me) {
  // 자신이 왼쪽에 있는 경우
  if (me.locationX - 670 < 0) {
    mapState = "left";
    shotOffsetX = 0;
    ctx.drawImage(Img.map, 0, 0, 1340, 640, 0, 0, canvas.width, canvas.height);
  }
  // 자신이 오른쪽에 있는 경우이다.
  // 맵의 제일 끝 - 회면 길이 부터 맵의 제일 끝을 그림
  else if (me.locationX + 670 > 3200) {
    mapState = "right";
    shotOffsetX = mapWidth - canvas.width;
    ctx.drawImage(Img.map, 3200 - canvas.width, 0, 1340, 640, 0, 0, canvas.width, canvas.height);
  }
  // 자신이 중간에 있는 경우
  // 자신의 위치 - 화면크기/2 부터 화면의 크기만큼 그림
  else {
    mapState = "middle";
    shotOffsetX = (me.locationX) - (canvas.width / 2);
    ctx.drawImage(Img.map, me.locationX - 670, 0, 1340, 640, 0, 0, canvas.width, canvas.height);
  }
}

// 공을 그림
// 1. 자신이 왼쪽에 있는 경우 2. 자신이 중간에 있는 경우 3. 자신이 오른쪽에 있는경우.
function drawBall(ball) {
  ctx.save();
  var radgrad = ctx.createRadialGradient(60, 60, 0, 60, 60, 60);
  radgrad.addColorStop(0, 'rgba(255,0,0,1)');
  radgrad.addColorStop(0.8, 'rgba(228,0,0,.9)');
  radgrad.addColorStop(1, 'rgba(228,0,0,0)');

  ctx.shadowBlur = 20;
  ctx.shadowColor = "black";
  ctx.fillStyle = "white";
  ctx.beginPath();

  // 자신이 왼쪽에 있는경우
  if (this.player.locationX - 670 < 0) {
    ctx.arc(ball.locationX, ball.locationY, 10, 0, Math.PI * 2);
  }
  // 자신이 오른쪽에 있는경우
  else if (this.player.locationX + 670 > 3200) {
    ctx.arc(ball.locationX - mapWidth + canvas.width, ball.locationY, 10, 0, Math.PI * 2);
  }
  // 자신이 중간에 있는 경우
  else {
    ctx.arc(ball.locationX - player.locationX + (canvas.width / 2), ball.locationY, 10, 0, Math.PI * 2);
  }
  ctx.fill();
  ctx.restore();
}

function dieScreen() {
  if (death) {
    ctx.save();
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = "#d5deed";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }
}

function dieEffecte() {
  try {
    if (corpseArr.length != 0) {
      try {
        for (var loop = 0; loop < corpseArr.length; loop++) {
          ctx.save();
          ctx.shadowBlur = 20;
          ctx.shadowColor = corpseArr[loop].color; // corpseArr[loop].color 접근에 오래 걸리는듯 함
          ctx.fillStyle = corpseArr[loop].color;
          ctx.beginPath();
          if (mapState == "left") {
            ctx.arc(corpseArr[loop].locationX, corpseArr[loop].locationY, 20, 0, Math.PI * 2);
          } else if (mapState == "right") {
            ctx.arc(corpseArr[loop].locationX - mapWidth + canvas.width, corpseArr[loop].locationY, 20, 0, Math.PI * 2);
          } else if (mapState == "middle") {
            ctx.arc(corpseArr[loop].locationX - player.locationX + (canvas.width / 2), corpseArr[loop].locationY, 20, 0, Math.PI * 2);
          }
          ctx.fill();
          ctx.restore();
        }
      } catch (e) {}
    }
  } catch (e) {}
}

function drawMiniMap() {
  var XOnMinimap = 1020,
    YOnMinimap = 520;
  ctx.save();
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = "rgba(0,0,0,.8)";
  // TODO: x,y
  ctx.fillRect(XOnMinimap, YOnMinimap, 310, 100);
  ctx.strokeStyle = "black";

  // 자신을 그림
  ctx.beginPath();
  ctx.arc(XOnMinimap + (player.locationX / 10.3),
    YOnMinimap - ((canvas.height - player.locationY * 2 - 600) / 10), 5, 0, Math.PI * 2);
  ctx.fillStyle = "lime";
  ctx.fill();

  // 나를 제외한 플레이어를 그림
  for (var loop = 0; loop < players.length; loop++) {
    ctx.beginPath();
    ctx.arc(XOnMinimap + (players[loop].locationX / 12),
      YOnMinimap - ((canvas.height - players[loop].locationY * 2 - 600) / 10), 5, 0, Math.PI * 2);
    ctx.fillStyle = "red";
    if (player.team == players[loop].team) {
      ctx.fillStyle = "blue";
    }
    ctx.fill();
  }
  ctx.restore();
}

function drawTower() {
  ctx.save();
  ctx.font = "15px Arial";
  if (this.player.locationX - 670 < 0) {
    ctx.fillStyle = "black";
    ctx.fillText(towers[0], 10, 300);
  }
  // 자신이 오른쪽에 있는경우
  else if (this.player.locationX + 670 > 3200) {
    ctx.fillStyle = "black";
    ctx.fillText(towers[1], 1300, 300);
  }
  ctx.restore();
}

function drawScore() {
  ctx.fillStyle = "white";
  ctx.strokeStyle = "black";
  ctx.font = "40px Arial";
  ctx.strokeText(Math.floor(towers[0]) + " : " + Math.floor(towers[1]), canvas.width / 2 - ctx.measureText(Math.floor(towers[0]) + " : " + Math.floor(towers[1])).width / 2, 50);
  ctx.fillText(Math.floor(towers[0]) + " : " + Math.floor(towers[1]), canvas.width / 2 - ctx.measureText(Math.floor(towers[0]) + " : " + Math.floor(towers[1])).width / 2, 50);
}

function drawLeaderBoard() {
  console.log(BTopUsers);
  ctx.save();
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";

  for (var loop = 0; loop < ATopUsers.length; loop++) {
    ctx.fillText("#" + (loop + 1) + "  " + ATopUsers[loop].name + "  " + ATopUsers[loop].score, 20, 20 + loop * 21);
  }
  for (var loop = 0; loop < BTopUsers.length; loop++) {
    ctx.fillText("#" + (loop + 1) + "  " + BTopUsers[loop].name + "  " + BTopUsers[loop].score, canvas.width-200, 20 + loop * 21);
  }
  ctx.restore();
}

function revival() {
  socket.emit("revival");
}

function SnowDraw() {
  ctx.save();
  ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
  ctx.beginPath();
  for (var i = 0; i < mp; i++) {
    var p = particles[i];
    ctx.moveTo(p.x, p.y);
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2, true);
  }
  ctx.fill();
  ctx.restore();
  snowUpdate();
}

//Function to move the snowflakes
//angle will be an ongoing incremental flag. Sin and Cos functions will be applied to it to create vertical and horizontal movements of the flakes


function snowUpdate() {
  angle += 0.01;
  for (var i = 0; i < mp; i++) {
    var p = particles[i];
    //Updating X and Y coordinates
    //We will add 1 to the cos function to prevent negative values which will lead flakes to move upwards
    //Every particle has its own density which can be used to make the downward movement different for each flake
    //Lets make it more random by adding in the radius
    p.y += Math.cos(angle + p.d) + 1 + p.r / 2;
    p.x += Math.sin(angle) * 2;

    //Sending flakes back from the top when it exits
    //Lets make it a bit more organic and let flakes enter from the left and right also.
    if (p.x > W + 5 || p.x < -5 || p.y > H) {
      if (i % 3 > 0) //66.67% of the flakes
      {
        particles[i] = {
          x: Math.random() * W,
          y: -2,
          r: p.r,
          d: p.d
        };
      } else {
        //If the flake is exitting from the right
        if (Math.sin(angle) > 0) {
          //Enter from the left
          particles[i] = {
            x: -2,
            y: Math.random() * H,
            r: p.r,
            d: p.d
          };
        } else {
          //Enter from the right
          particles[i] = {
            x: W + 2,
            y: Math.random() * H,
            r: p.r,
            d: p.d
          };
        }
      }
    }
  }
}