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

io.sockets.on('connection', function(socket){
	socket.id = Math.random();
	socket.x = 0;
	socket.y = 0;
	socket.number = ""+Math.floor(10*Math.random()); //왱
	SOCKET_LIST[socket.id] = socket;

	socket.on('disconnect', function(){
		delete SOCKET_LIST[socket.id];
	})
});

setInterval(function() {
	var pack = [];
	for (var i in SOCKET_LIST) {
		var socket = SOCKET_LIST[i];
		socket.x++;
		socket.y++;
		pack.push({
			x: socket.x,
			y: socket.y,
			number:socket.number
		});
	}
	for (var i in SOCKET_LIST) {
		var socket = SOCKET_LIST[i];
		socket.emit('newPosition', pack);
	}
}, 1000/25);