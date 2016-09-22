var
    express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    Vector = require('./vector');
    Player = require('./player');

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

var player1 = new Player(new Vector(10,10), 10);

var Player = function (id){
	var self = {
		x:250,
		y:250,
		id:id,
		number:""+Math.floor(10*Math.random()), //왱
		// 65 left, 87 top, 68 right
		pressingLeft:false,
		pressingRight:false,
		pressingUp:false,
		maxSpd:10 // 속도 제한
	}
	self.updatePosition = function(){
		if(self.pressingLeft)
			self.x -= self.maxSpd;
		if(self.pressingRight)
			self.x += self.maxSpd;
		if(self.pressingUp)
			self.y -= self.maxSpd;
	}
	return self;
}

io.sockets.on('connection', function(socket){
	socket.id = Math.random();
	SOCKET_LIST[socket.id] = socket;

	var player = Player(socket.id);
	PLAYER_LIST[socket.id] = player;

	socket.on('disconnect', function(){
		delete SOCKET_LIST[socket.id];
		delete PLAYER_LIST[socket.id];
	});

	socket.on('keyPress', function(data){
		if(data.inputId === 'left')
			player.pressingLeft = data.state; // index.html true or false
		else if(data.inputId === 'right')
			player.pressingRight = data.state;
		else if(data.inputId === 'up')
			player.pressingUp = data.state;
	});
});

setInterval(function() {
	var pack = [];
	for (var i in PLAYER_LIST) {
		var player = PLAYER_LIST[i];
		player.updatePosition();
		pack.push({
			x: player.x,
			y: player.y,
			number:player.number
		});
	}
	for (var i in SOCKET_LIST) {
		var socket = SOCKET_LIST[i];
		socket.emit('newPosition', pack);
	}
}, 1000/25);
