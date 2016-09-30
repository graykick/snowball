var
    express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),

    Vector = require('./lib/vector.js'),
    Player = require('./lib/player.js'),
    Ball = require('./lib/ball.js'),

    PORT = 3002;

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.use('/public', express.static(__dirname + '/public'));

server.listen(port = Number(process.env.PORT || PORT), function () {
    console.log("Server " + PORT + " listening");
});

var SOCKET_LIST = {};
var PLAYER_LIST = {};
var BALL_LIST = {};

Player.onConnect = function (socket) {
    var player = new Player(new Vector(10, 50), 32); // 플레이어 객체 생성
    var ball = new Ball(5, 45, 50, new Vector(100, 100));

    PLAYER_LIST[socket.id] = player;
    initPack.player.push({
        id:self.id,
        x:self.x,
        y:self.y,
        number:self.number,
    });

    BALL_LIST[socket.id] = ball;
    initPack.ball.push({
        id:self.id,
        x:self.x,
        y:self.y,
    });

    socket.on('keyPress', function (data) {
        if (data.inputId === 'left')
            player.press[65] = data.state;
        else if (data.inputId === 'right')
            player.press[68] = data.state;
        else if (data.inputId === 'up')
            player.press[87] = data.state;
        else if(data.inputId === 'attack')
            player.pressingAttack = data.state;
        else if(data.inputId === 'mouseAngle')
            player.mouseAngle = data.state;
    });
}
Player.onDisconnect = function (socket) {
    delete PLAYER_LIST[socket.id];
    removePack.player.push(socket.id);
}
Player.update = function () {
    var pack = [];
    for (var i in PLAYER_LIST) {
        var player = PLAYER_LIST[i];
        player.run();
        pack.push({
            locationX: player.location.x,
            locationY: player.location.y,
            ImageIndex: player.nowImageIndex // 해골 방향 index
        });
    }
    return pack;
}

Ball.update = function () {
    var pack = [];
    for (var i in BALL_LIST) {
        var ball = BALL_LIST[i];
        ball.run();

        if(ball.live == false) {
            delete BALL_LIST[i];
            removePack.ball.push(socket.id);
        } else
            pack.push({
                locationX: ball.location.x,
                locationY: ball.location.y,
                mass: ball.mass,
            });
        console.log(ball.live+"   in server state");
    }
    return pack;
}

io.sockets.on('connection', function (socket) {
    SOCKET_LIST[socket.id] = socket;

    Player.onConnect(socket);
    start();

    socket.on('disconnect', function () {
        delete SOCKET_LIST[socket.id];
        Player.onDisconnect(socket);
    });
});

var initPack = {player:[],ball:[]};
var removePack = {player:[],ball:[]};

function  start() {
    setInterval(function(){
        var pack = {
            player:Player.update(),
            ball:Ball.update()
        }

        for(var i in SOCKET_LIST){
            var socket = SOCKET_LIST[i];
            socket.emit('init',initPack);
            socket.emit('update',pack);
            socket.emit('remove',removePack);
        }
        initPack.player = [];
        initPack.bullet = [];
        removePack.player = [];
        removePack.bullet = [];

    },1000/25);
}