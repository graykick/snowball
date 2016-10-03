var
    express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    Vector = require('./lib/vector.js'),
    Player = require('./lib/player.js'),
    Ball = require('./lib/ball.js'),

    PORT = 3002;

var startBool = false;
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.use('/public', express.static(__dirname + '/public'));

server.listen(port = Number(process.env.PORT || PORT), function () {
    console.log("Server " + PORT + " listening");
});

var SOCKET_LIST = {};
var PLAYER_LIST = {};
var ballArr = new Array();

start();

io.sockets.on('connection', function (socket) {
    SOCKET_LIST[socket.id] = socket;

    var player = new Player(new Vector(10, 50), 32); // 플레이어 객체 생성
    PLAYER_LIST[socket.id] = player;
    if (!startBool) {
        start();
    }

    socket.on('disconnect', function () {
        delete SOCKET_LIST[socket.id];
        delete PLAYER_LIST[socket.id];
    });

    socket.on('nickname', function (nickname) {
        player.nickname = nickname;
    });

    socket.on('sendMsgToServer', function (data) {
        for (var i in SOCKET_LIST) {
            SOCKET_LIST[i].emit('addToChat', data + '<br />' + player.nickname);
        }
    });

    socket.on('evalServer', function (data) {
        if (!DEBUG)
            return;
        var res = eval(data);
        socket.emit('evalAnswer', res);
    });

    socket.on('keyPress', function (data) {
        if (data.inputId === 'left')
            player.press[65] = data.state;
        else if (data.inputId === 'right')
            player.press[68] = data.state;
        else if (data.inputId === 'up')
            player.press[87] = data.state;
    });

    socket.on('throwBall', function (data) {
        var newBall = player.throwBall(data.mouseX, data.mouseY);
        // for(var loop = 0; loop < player.balls.length; loop++){
        //   ballArr.push(player.balls[loop]);
        // }
        ballArr.push(newBall);
    });
});

function start() {
    startBool = true;
    setInterval(function () {
        var pack = [];
        var ball = [];
        for (var i in PLAYER_LIST) {
            var player = PLAYER_LIST[i];
            player.run();
            pack.push({
                locationX: player.location.x,
                locationY: player.location.y,
                ImageIndex: player.nowImageIndex, // 해골 방향 index
            });
        }
        for (var loop = 0; loop < ballArr.length; loop++) {
            ballArr[loop].run();
            if (!(ballArr[loop].live)) {
                console.log("dead");
                ballArr.splice(loop, 1);
                continue;
            }
            ball.push({
                locationX: ballArr[loop].location.x,
                locationY: ballArr[loop].location.y
            })
        }
        for (var i in SOCKET_LIST) {
            var socket = SOCKET_LIST[i];
            socket.emit('newPosition', pack, ball);
        }
    }, 1000 / 80);
}
