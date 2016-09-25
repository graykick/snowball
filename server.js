var
    express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),

	Vector = require('./lib/vector.js'),
    Player = require('./lib/player.js'),

    PORT = 3002;

app.get('/',function(req, res){
	res.sendFile(__dirname + '/index.html');
});

app.use('/public', express.static(__dirname + '/public'));

server.listen(port = Number(process.env.PORT || PORT), function(){
	console.log("Server "+PORT+" listening");
});

var SOCKET_LIST = {};
var PLAYER_LIST = {};

io.sockets.on('connection', function(socket){
	SOCKET_LIST[socket.id] = socket;

	var player = new Player(new Vector(10, 50), 32); // 플레이어 객체 생성
	PLAYER_LIST[socket.id] = player;
	start();

	socket.on('disconnect', function(){
		delete SOCKET_LIST[socket.id];
		delete PLAYER_LIST[socket.id];
	});

	socket.on('keyPress', function(data){
		if(data.inputId === 'left')
			player.press[65] = data.state;
		else if(data.inputId === 'right')
			player.press[68] = data.state;
		else if(data.inputId === 'up')
			player.press[87] = data.state;
	});
});

function  start() {
	setInterval(function () {
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
		for (var i in SOCKET_LIST) {
			var socket = SOCKET_LIST[i];
			socket.emit('newPosition', pack);
		}
	}, 1000 / 25);
}