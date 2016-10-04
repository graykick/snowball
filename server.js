var
    express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    Vector = require('./lib/vector.js'),
    Player = require('./lib/player.js'),
    Ball = require('./lib/ball.js'),
    Object = require('./lib/object.js');

    PORT = 3002;

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.use('/public', express.static(__dirname + '/public'));

server.listen(port = Number(process.env.PORT || PORT), function () {
    console.log("Server " + PORT + " listening");
});

var startBool = false;
var SOCKET_LIST = {};
var PLAYER_LIST = {};
var ballArr = new Array();

start();

Player.onConnect = function (socket) {
    var player = new Player(new Vector(10, 50), 32); // 플레이어 객체 생성
    player.id = socket;
    player.socketId = socket.id;
    PLAYER_LIST[socket.id] = player;

    socket.on('nickname', function (nickname) {
        player.nickname = nickname;
    });
    socket.on('throwBall', function (data) {
        var newBall = player.throwBall(data.mouseX, data.mouseY);
        if (data.mouseX > player.location.x) {
            player.applyForth(new Vector(-1, 0));
        } else {
            player.applyForth(new Vector(1, 0));
        }
        ballArr.push(newBall);
    });
    socket.on('keyPress', function (data) {
        if (data.inputId === 'left')
            player.press[65] = data.state;
        else if (data.inputId === 'right')
            player.press[68] = data.state;
        else if (data.inputId === 'up')
            player.press[87] = data.state;
    });
    socket.on('sendMsgToServer', function (data) {
        this.emit('sendToChat', data + '<br />' + player.nickname);
        this.broadcast.emit('receiveToChat', data + '<br />' + player.nickname); //나를제외하고 파란색으로 보냄
    });
}
Player.onDisconnect = function (socket) {
    delete SOCKET_LIST[socket.id];
    delete PLAYER_LIST[socket.id];
}
Ball.update = function () {
    var pack = [];
    for (var i in ballArr) {
        var ball = ballArr[i];
        ball.update();
        if (ball.toRemove) {
            delete ballArr[i];
            removePack.ball.push(ball.ownerSocketId);
        } else
            pack.push(ball.getUpdatePack());
    }
    return pack;
}
Ball.getAllInitPack = function () {
    var balls = [];
    for (var i in ballArr)
        balls.push(ballArr[i].getInitPack());
    return balls;
}

io.sockets.on('connection', function (socket) {
    SOCKET_LIST[socket.id] = socket;
    Player.onConnect(socket);
    if (!startBool) {
        start();
    }

    socket.on('disconnect', function () {
        delete SOCKET_LIST[socket.id];
        Player.onDisconnect(socket);
    });
    socket.on('evalServer', function (data) {
        if (!DEBUG)
            return;
        var res = eval(data);
        socket.emit('evalAnswer', res);
    });
});

var initPack = {player: [], ball: []};
var removePack = {player: [], ball: []};

function start() {
    startBool = true;
    setInterval(function () {
        var pack = {
            player: Player.update(),
            ball: Ball.update(),
        }

        for (var i in SOCKET_LIST) {
            var socket = SOCKET_LIST[i];
            socket.emit('init', initPack);
            socket.emit('update', pack);
            socket.emit('remove', removePack);
        }
        initPack.player = [];
        initPack.ball = [];
        removePack.player = [];
        removePack.ball = [];
    }, 1000 / 25);
}

/*        var pack = [];
        var ball = [];
        for (var i in PLAYER_LIST) {
            var player = PLAYER_LIST[i];
            if (player.hp <= 0) {
                SOCKET_LIST[player.socketId].emit('dead');
                delete PLAYER_LIST[player.socketId];
            }
            player.run(ballArr);
            pack.push({
                locationX: player.location.x,
                locationY: player.location.y,
                vLocationX: player.vLocation.x,
                vLocationY: player.vLocation.y,
                ImageIndex: player.nowImageIndex,
                hp: player.hp, // 해골 방향 index
                score: player.score
            });
        }
        main : for (var loop = 0; loop < ballArr.length; loop++) {
            for (var i in PLAYER_LIST) {
                var player = PLAYER_LIST[i];
                if ((ballArr[loop].ownerId != player.id) && Vector.subStatic(player.location, ballArr[loop].location).mag() < player.mass + ballArr[loop].mass) {
                    var radius = player.mass + ballArr[loop].mass;
                    console.log("boom");
                    player.hp -= 10;
                    PLAYER_LIST[ballArr[loop].ownerSocketId].score += 10;
                    if (ballArr[loop].location.x > player.location.x) {
                        player.applyForth(new Vector(-1, 0));
                    } else {
                        player.applyForth(new Vector(1, 0));
                    }

                    ballArr.splice(loop, 1);
                    continue main;
                }
            }

            ballArr[loop].run();
            if (!(ballArr[loop].live)) {
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
    }, 1000 / 80);*/
}