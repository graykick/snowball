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
        // 글씨만 써지면 trigger 성공
        modalHello();
    }
});

guest.addEventListener('mousedown', modalHello);

function modalHello() {
    var nickname = nickBox.value;
    socket.emit('nickname',  nickname);
    modal.style.display = 'none';
}
var Player = function(initPack){
    var self = {};
    self.id = initPack.id;
    self.x = initPack.x;
    self.y = initPack.y;
    PLAYER_LIST[self.id] = self;
    return self;
}
PLAYER_LIST = {};

var Ball = function(initPack){
    var self = {};
    self.id = initPack.id;
    self.x = initPack.x;
    self.y = initPack.y;
    BALL_LIST[self.id] = self;
    return self;
}
BALL_LIST = {};

socket.on('init',function(data){
    //{ player : [{id:123,number:'1',x:0,y:0},{id:1,number:'2',x:0,y:0}], bullet: []}
    for(var i = 0 ; i < data.player.length; i++){
        new Player(data.player[i]);
    }
    for(var i = 0 ; i < data.ball.length; i++){
        new Ball(data.ball[i]);
    }
});

socket.on('update',function(data){
    //{ player : [{locationX:0,locationY:0}, bullet: []}
    for(var i = 0 ; i < data.player.length; i++){
        var pack = data.player[i];
        var p = PLAYER_LIST[i];
        if(p){
            if(pack.locationX !== undefined)
                p.locationX = pack.locationX;
            if(pack.locationY !== undefined)
                p.locationY = pack.locationY;
        }
    }
    for(var i = 0 ; i < data.ball.length; i++){
        var pack = data.ball[i];
        var b = BALL_LIST[i];
        if(b){
            if(pack.locationX !== undefined)
                b.locationX = pack.locationX;
            if(pack.y !== undefined)
                b.locationY = pack.locationY;
        }
    }
});

socket.on('remove',function(data){
    for(var i = 0 ; i < data.player.length; i++){
        delete PLAYER_LIST[data.player[i]];
    }
    for(var i = 0 ; i < data.ball.length; i++){
        delete BALL_LIST[data.ball[i]];
    }
});

setInterval(function(){
    ctx.clearRect(0, 0, 500, 500); // 캔버스를 깨끗이
    ctx.drawImage(Img.map, 0, 0, 1340, 640, 0, 0, canvas.width, canvas.height);

    for(var i = 0 ; i < PLAYER_LIST.length; i++) // 플레이어마다 해골 그림
        ctx.drawImage(skeletonSheet.getSheet(PLAYER_LIST[i].ImageIndex), PLAYER_LIST[i].locationX - 32, PLAYER_LIST[i].locationY - 32);

    for(var i = 0 ; i < BALL_LIST.length; i++) { // 공 그림
        console.log(PLAYER_LIST[i]);
        console.log(PLAYER_LIST[i].x - 32, PLAYER_LIST[i].y - 32+"      PLAYER");
        console.log(BALL_LIST[i].x + 32, BALL_LIST[i].y + 32 - 5+"      BALL");

        ctx.fillRect(BALL_LIST[i].locationX + 32, BALL_LIST[i].locationY + 32 - 5, 10, 10);
    }
},40);

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

document.onmousedown = function(event){
    socket.emit('keyPress',{inputId:'attack',state:true});
}
document.onmouseup = function(event){
    socket.emit('keyPress',{inputId:'attack',state:false});
}
document.onmousemove = function(event){
    var x = -250 + event.clientX - 8;
    var y = -250 + event.clientY - 8;
    var angle = Math.atan2(y,x) / Math.PI * 180;
    socket.emit('keyPress',{inputId:'mouseAngle',state:angle});
}