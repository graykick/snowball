var
    gameport        = process.env.PORT || 3000,

    io              = require('socket.io'),
    express         = require('express'),
    UUID            = require('node-uuid'),

    verbose         = false,
    http            = require('http'),
    app             = express(),
    server          = http.createServer(app);

var sio = io.listen(server);

sio.configure(function (){
    sio.set('log level', 0);

    sio.set('authorization', function (handshakeData, callback) {
        callback(null, true); // error first callback style
    });
});

// game server code로 진입.
// 게임서버는 클라이언트가 찾고 있는 게임, 생성한 게임, 떠난 게임,
// 들어와있는 게임, 끝난 게임 때 연결을 끊을 수 있다.
game_server = require('./game.server.js');

// 클라이언트와 연결될 때 이 함수 실행.
// 클라이언트가 게임을 하고 있는지, 플레이어의 아이디 확인.
sio.sockets.on('connection', function(client) {
    // UUID 생성.
    // 5b2ca132-64bd-4513-99da-90e838ca47d1
    // socket/connection에 저장
    client.userid = UUID();

    // 플레이어에게 연결된 것을 확인. 아이디 줌.
    client.emit('onconnected', {id: client.userid});

    // 게임할 사람 찾음.
    // 게임이 없다면 기다림.
    gmae_server.findGame(client);

    // 누군가 연결됬는지 로그 확인.
    console.log('\t socket.io:: player ' + client.userid + ' connected');

    // 클라이언트에게 보낼 메시지 다루기.
    // 여기서 메시지를 보내고, game_server에서 다룸.
    client.on('message', function(m) {
        game_server.onmessage(client, m);
    }); // client.on message

    // 클라이언트 연결이 끊어질 때, 서버에게 말함
    client.on('disconnect', function() {
        // 누군가와 연결 끊어졌을 때의 로그
        console.log('\t socket.io:: client disconnected ' + client.userid + ' ' + client.game_id);

        // 클라이언트가 게임에 있다면, game_server.findGame을 지정
        // 게임 상태를 업데이트 해달라고 서버에게 요청
        if(client.game && client.game.id) {
            // 플레이어가 게임에서 나갔을 때
            game_server.endGame(client.game.id, client.user.id);
        } // client.game_id
    }); // client.on disconnect
}); //sio.sockets.on connection
