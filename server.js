var
    http = require('http'),
    fs = require('fs'),
    path = require('path'),

    express = require('express'),
    app = express(),
    server = http.createServer(app),
    io = require('socket.io').listen(server),
    players = [],

    PORT = 3002;

app.use('/public', express.static(__dirname + '/public'));

app.get('/', function (req, res) {
    fs.readFile('index.html', 'utf-8', function (error, content) {
        res.writeHead(200, {"Content-Type": "text/html"});
        res.end(content);
    });
});

io.on('connection', function(socket){
    console.log("Client " + socket.id + " connected");
	socket.emit('socketID', { id: socket.id });
	socket.emit('getPlayers', players);
	socket.broadcast.emit('newPlayer', { id: socket.id });
    socket.on('nickname', function (nickname) {
        socket.nickname = nickname;
    });
    socket.on('message', function (message) {
        console.log(socket.nickname + ' --- ' + socket.id + ' to server : ' + message);
    });    
	socket.on('disconnect', function(){
        console.log("Client " + socket.id + " disconnected");
		socket.broadcast.emit('playerDisconnected', { id: socket.id });
		for(var i = 0; i < players.length; i++){
			if(players[i].id == socket.id){
				players.splice(i, 1);
			}
		}
	});
	players.push(new player(socket.id, 0, 0));
});

// io.sockets.on('connection', function (socket) {

server.listen(port = Number(process.env.PORT || PORT), function() {
    console.log("Server "+ PORT +" listening");
});

function player(id, x, y) {
    this.id = id;
    this.x = x;
    this.y = y;
}
