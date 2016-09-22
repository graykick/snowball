var
    express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),

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

var Player = function (id){
	var self = {
		x:250,
		y:250,
		id:id,
		number:""+Math.floor(10*Math.random()) //왱
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
	})
});

setInterval(function() {
	var pack = [];
	for (var i in PLAYER_LIST) {
		var player = PLAYER_LIST[i];
		player.x++;
		player.y++;
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