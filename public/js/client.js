// 전체흐름
// 1. 소켓 접속
// 2. 접속완료 받으면 닉네임 전송
// 3. 게임시작 emit을 받으면, 게임시작

// 마우스위 좌표정보를 담는 변수
var pointX;
var pointY;

// 맵에이동에 따른 마우스 offset
// 이애하지 않아도 됨.
var shotOffsetX;

// 서버에서 게임시작이라고 하면 true가 됨
var gameStart = false;

// 사용 예정
var mapState;

// 맵의 길이
var mapWidth = 3200;

// 해골의 그림들을 로드하고, spriteSheet객체를 생성하는 과정
//spriteSheet객체는 렌더링을 더 간단하게 해줌
var Img = {};
Img.player = new Image();
Img.player.src = '/public/image/skeleton.png';
var skeletonSheet = new spriteSheet(Img.player, 9, 2, 64, 64);

// 맵이미지를 로드
Img.map = new Image();
Img.map.src = '/public/image/map.png';

//캔버스를 할당하고 캔버스 사이즈 설정
var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');
canvas.width = 1340;
canvas.height = 640;

// 소켓을 담는 변수
var socket;

//???
var modal = document.getElementById('myModal');
var nickBox = document.getElementById('nickBox');
var guest = document.getElementById('guest');

modal.style.display = 'block';

// When the user press enter key, play as guest

//닉네임 입력을 완료하면, 플레이버튼을 누름.
// 누르면, 소켓들을 실행함.
// 이렇게 한 이유는 play버튼을 누르기도 전에 게임이 실행되어
// 그냥 뒤지는것을 방지하기 위함.
nickBox.addEventListener("keydown", function (event) {
    if (event.which == 13 || event.keyCode == 13) {
        var nickname = nickBox.value;
        console.log(nickBox.value);

        startSocket();
        //socket.emit('nickname', nickname);
        modal.style.display = 'none';
    }
});

//닉네임 입력을 완료하면, 플레이버튼을 누름.
// 누르면, 소켓들을 실행함.
// 이렇게 한 이유는 play버튼을 누르기도 전에 게임이 실행되어
// 그냥 뒤지는것을 방지하기 위함.
guest.addEventListener('mousedown', function helloModal() {
    var nickname = nickBox.value;
    console.log(nickBox.value);
    startSocket();
  //  socket.emit('nickname', nickname);
    modal.style.display = 'none';
});

// 로직이 바뀌어서 기존에 있던 채팅코드는 주석처리함
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

// 아래의 값들은 아직 사용되지 않음으로 신경 X
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

// 자신과 적들과 공들을 담을 변수와 배뎔들이다.
// 이들은 그리는 함수에서 사용된다.
var player;
var players = [];
var balls = [];

//렌더딩 루프의 핸들러 이다. 죽으면 정지하기 위해 사용된다.
var gameHanddler;

// 소켓들을 실행함.
// socket = io();
// 를 통해 소켓이 접속하고
// 접속이 되었다는 emit을 받으면, 전에 입력한 닉네임을 emit함
// 그뒤 게임을 시작하라는 emit과 함꼐 자신의 플레이어에 대한 객체를 받으면,
// 클라이언트에 있는 player에 대입함.
// 그뒤, 게임을 시작함.
// 그후 계속 update emit을 받아 자신과, 적들과 공들에 대한 객체들을 계속 업데이트 받아 대입함.
function startSocket(){
  //소켓에 접속한디.
  socket = io();

  console.log("start socket");

  // 접속이 되었다는 emit을 받고 닉네임을 넘겨줌
  socket.on("connected", () => {
    console.log("iam connected");
    console.log(nickBox.value);
    socket.emit("nickName", nickBox.value);
    console.log("i sent nickname");
  });

// 닉네임을 넘겨주면, 서버에서 게임을 시작하라는 명령과 자신의 객체를 받아 대입하고 게임을 시작함.
  socket.on("gameStart", (me) => {

    this.player = me;
    console.log(this.player.locationX);
  //  this.players = players;
    console.log(this.player.locationY);

    // 게임을 시작하는 함수. 여기서 렌더링loop를 시작함.
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

// 서버에서 계속 업데이트하는 emit을 받아 계속 클라이언트의 글로벌 변수와 배열에 대입함.
  socket.on("update", (me, enemys, balls) => {
    player = me;
    players = enemys;
    this.balls = balls;
  })

// 죽으면, 렌더링 루프를 종료함.
  socket.on("die", () => {
    clearInterval(gameHanddler);
  })



// 게임루프이다. 서버에서 게임을 시작하라는 명령을 받으면 실행 되는데,
// 제일 먼저 이벤트들을 받기위해 리스너들을 할당한다.
// 이보다 전에 할당하면, 오류가 발생한다.
// 그뒤 렌더링 loop를 돌린다.
// 이는 맵을 먼저 그리고, 적들을 그리고, 자기 자신을 그리고 마지막에 공들을 그린다.
  function gameStart(){
    startEvent();
    gameHanddler = setInterval(() => {
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
  });

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

// 이벤트리스너 들을 할당하는 함수아다.
// mousemove이벤트는 현재 마우스의 좌표를 알기위해 사용된다.
// mouseup이벤트는 서버측에 공을 던졌음을 알리기위해 사용된다. 이때 마우스의 좌표를 담은 객체를 함께 전송한다.
// keydown이벤트는 사용자가 플레이어를 움직이고 싶어한다는 것을 알리기 위해 사용된디.
// keyup이벤트는 사용자가 플레이어를 그만 움직인다는 것을 알리기위해 사용된다.

function startEvent(){

  // 마우스좌표를 계속 알아야 하는 이유는 공을 던질때 어디로 던지는지 알기 위해서 이다.
  canvas.addEventListener('mousemove', function (event) {
    pointX = event.offsetX;
    pointY = event.offsetY;
});

 // 여기서  shotOffsetX는 조금 이해하기 힘들 수 있는데 맵의 이동을 구현함에 있어서
 // 필수적으로 추가된것이다. 맵의 크기는 3200인데 보여지는 화면의 크기는 1340이라서,
 // 복잡한 처리가 필요하다.
  canvas.addEventListener('mouseup', function (event) {
    var ballData = {
        mouseY : pointY,
        mouseX : pointX + shotOffsetX
      };
      socket.emit('throwBall', ballData);
  });

  //움직임임 이벤트. 방향과  flag를 담은 객체를 함께 전송
  document.onkeydown = function (event) {
      if (event.keyCode === 68) //d
          socket.emit('keyPress', {inputId: 'right', state: true});
      else if (event.keyCode === 65) //a
          socket.emit('keyPress', {inputId: 'left', state: true});
      else if (event.keyCode === 87) // w
          socket.emit('keyPress', {inputId: 'up', state: true});
  }

  //그만 움직임 이벤트.방향과  flag를 담은 객체를 함께 전송
  document.onkeyup = function (event) {
      if (event.keyCode === 68)	//d
          socket.emit('keyPress', {inputId: 'right', state: false});
      else if (event.keyCode === 65) //a
          socket.emit('keyPress', {inputId: 'left', state: false});
      else if (event.keyCode === 87) // w
          socket.emit('keyPress', {inputId: 'up', state: false});
  }
}

// 자신을 그리는 함수 간단하다.
// 자신의 피통은 초록생으로 현재 자신의 체력만큼 사각혁을 그리고
// 자신의 닉네임과, 점수를 그린다.(글자로)
// 마지막으로 자신의 객체를 그리는데, skeletonSheet.getSheet(player.ImageIndex)
// 를 사용하여 자신이 왼족을 보고 있는지, 오른쪽을 보고 있는지, 공중에 있는지를 그린다.
// 이 정보는 서버에서 보내오는 객체에 포함되어 있다.

function drawMyPlayer(player){
  ctx.fillStyle = "green";
  // 피통을 그린다.
  ctx.fillRect(player.vLocationX - 42, player.vLocationY - 42, player.hp, 10);
  ctx.fillStyle = "black";
  // 점수를 그린다.
  ctx.fillText(player.score, player.vLocationX - 52, player.locationY - 52);
  //닉네임을 그린다.
  ctx.fillText(player.name, player.vLocationX - 32, player.locationY - 52);
  // 그림(해골)을 그린다.
  ctx.drawImage(skeletonSheet.getSheet(player.ImageIndex), player.vLocationX - 32, player.vLocationY - 32);
}

// 다른 플레이어들을 그리는 함수이다.
// 위의 자신을 그리는 메소드와는 달리 조금 복잡하다.
// 이유는 맵의 이동때문이다.
// 크게 3가지로 나뉜다.
// 1. 자신이 왼쪽에 있는경우. 2. 자신이 중간이 있는경우 3. 자신이 오른쪽에 있는 경우.
// 이 3가지 경우를 분기하여, 각기다른 위치에 상대방을 그린다.
// 상대방으 피통은 붉은색으로 그린다.
// 이 3가지 분기는 자신의 위치에 따라 달라진다. 그래서 if의 조건절에 자신의 위치가 사용된다.
function drawPlayer(player){
  // map width = 3200
  // canvas width = 1340
  //location check
//  console.log("differ = "+this.player.locationX+" vs "+player.locationX);

  // 자신이 왼쪽이 있는 경우이다. 굉장히 간단하다.
  // 그냥 서버에서 받은 데로만 그리면 된다.
    if(this.player.locationX-670<0){ // if left max
      ctx.fillStyle = "red";
      ctx.fillRect(player.locationX - 42, player.locationY - 42, player.hp, 10);
      ctx.fillStyle = "black";
      ctx.fillText(player.score, player.locationX - 52, player.locationY - 52);
      ctx.fillText(player.name, player.locationX - 32, player.locationY - 52);
      ctx.drawImage(skeletonSheet.getSheet(player.ImageIndex), (player.locationX - 32), player.locationY - 32);
     }
     // 조금 복잡하다. this.player.locationX+670>3200
     // 이는 자신이 오른쪽 끝에 있음을 나타낸다. 그래서 상대방의 위치를 서버에서 받은 그대로 그리지 않고, 조작을 해야한다.
     // 공식은 상대위치 - 맵 width + 화면 width이다. (-42는 offset이므로 상관 X)
     // 이해할 필요는 없다.
      else if(this.player.locationX+670>3200){ // if right max
       ctx.fillStyle = "red";
       ctx.fillRect(player.locationX- 42 -mapWidth + canvas.width, player.locationY - 42, player.hp, 10);
       ctx.fillStyle = "black";
       ctx.fillText(player.score, player.locationX -mapWidth + canvas.width  - 52, player.locationY - 52);
       ctx.fillText(player.name, player.locationX-mapWidth + canvas.width - 32, player.locationY - 52);
      ctx.drawImage(skeletonSheet.getSheet(player.ImageIndex), (player.locationX - 32) -mapWidth + canvas.width , player.locationY - 32);
     }
     // 자신이 중간에 있는 경우이다.
     // 그래서 상대를 그릴때 서버에서만 받은대로 그리지 않는다.
     // 자신이 중간에 있음으로, 상대의 위치를 이에 맞추어야 한다.
     // 상대위치 - 자신위치 + 화면크기/2 이다.
     // 이해하지 않아도 된다.
     else { // middle
       ctx.fillStyle = "red";
       ctx.fillRect((player.locationX - 42) - this.player.locationX + (canvas.width/2), player.locationY - 42, player.hp, 10);
       ctx.fillStyle = "black";
       ctx.fillText(player.score, (player.locationX - 52) - this.player.locationX + (canvas.width/2), player.locationY - 52);
       ctx.fillText(player.name, (player.locationX - 32) - this.player.locationX + (canvas.width/2), player.locationY - 52);
       ctx.drawImage(skeletonSheet.getSheet(player.ImageIndex), (player.locationX - 32) - this.player.locationX + (canvas.width/2) , player.locationY - 32);
     }
}

//맵을 그리는 함수이다.
// 자신의 위치에 따라 맵의 어디를 그려야 할지 정해진다.
// 역시 3가지로 나뉜다.
// 1. 자신이 왼쪽에 있는 경우 2. 자신이 중간에 있는 경우 3. 자신이 오른쪽에 있는경우.
// 자신이 중간에 있는경우는 맵이 이동하지만, 그 외에경우는 고정이다.
function drawMap(me){
  //location check

  //자신이 왼쪽에 있는 경우이다.
  //그냥 그린다.
  if(me.locationX-670<0){ // if left max4
    mapState = "left";
    shotOffsetX = 0;
    ctx.drawImage(Img.map, 0, 0, 1340, 640, 0,0, canvas.width, canvas.height);
  }
  //자신이 오른쪽에 있는 경우이다.
  //그냥 그리면 안되고 맵의 제일 끝 - 회면 길이 부터 맵의 제일 끝을 그려야한다.
  //이해하지 않아도 된다.
  else if(me.locationX+670>3200){ // if right max
    mapState = "right";
    ctx.drawImage(Img.map, 3200-canvas.width, 0, 1340, 640, 0,0, canvas.width, canvas.height);
  }
  //자신이 중간에 있는 경우이다.
  // 그냥그리면 안되고 자신의 위치 - 화면크기/2 부터 화면의 크기만큼 그려야 한다.
  // 이해하지 않아도 된다.
  else { // middle
    mapState = "middle";
    shotOffsetX = (me.locationX) - (canvas.width/2);
    ctx.drawImage(Img.map, me.locationX-670, 0, 1340, 640, 0,0, canvas.width, canvas.height);
  }
}

//공을 그리는 함수이다.
//이 역시 3가지 경우로 나뉘다.
// 1. 자신이 왼쪽에 있는 경우 2. 자신이 중간에 있는 경우 3. 자신이 오른쪽에 있는경우.
// 이때 그리는 공식은 상대방을 그리는 공식과 같다.
function drawBall(ball){
    ctx.fillStyle = "white";
    ctx.beginPath();

    //location check

    //자신이 왼쪽에 있는경우
    if(this.player.locationX-670<0){ // if left max
      ctx.arc(ball.locationX, ball.locationY, 10, 0, Math.PI * 2);
     }
     // 자신이 오른쪽에 있는경우
     else if(this.player.locationX+670>3200){ // if right max
       ctx.arc(ball.locationX -mapWidth + canvas.width, ball.locationY, 10, 0, Math.PI * 2);
     }
     //자신이 중간에 있는 경우
     else { // middle
       ctx.arc(ball.locationX - player.locationX + (canvas.width/2), ball.locationY, 10, 0, Math.PI * 2);
     }
     ctx.fill();
}
