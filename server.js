/*
/*
var
    express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),

    PORT = 3002;

app.get('/',function(req, res) {
	res.sendFile(__dirname + '/index.html');
});

app.use('/public', express.static(__dirname + '/public'));

server.listen(port = Number(process.env.PORT || PORT), function() {
	console.log("Server "+PORT+" listening");
});

var SOCKET_LIST = {};

var Entity = function(){
	var self = {
		x:250,
		y:250,
		spdX:0,
		spdY:0,
		id:"",
	}
	self.update = function(){
		self.updatePosition();
	}
	self.updatePosition = function(){
		self.x += self.spdX;
		self.y += self.spdY;
	}
	self.getDistance = function(pt){
		return Math.sqrt(Math.pow(self.x-pt.x,2) + Math.pow(self.y-pt.y,2));
	}
	return self;
}

function movePlayer(player) {
	var x =0,y =0;
	for(var i=0; i<player.cells.length; i++)
	{
		var target = {
			x: player.x - player.cells[i].x + player.target.x,
			y: player.y - player.cells[i].y + player.target.y
		};
		var dist = Math.sqrt(Math.pow(target.y, 2) + Math.pow(target.x, 2));
		var deg = Math.atan2(target.y, target.x);
		var slowDown = 1;
		if(player.cells[i].speed <= 6.25) {
			slowDown = util.log(player.cells[i].mass, c.slowBase) - initMassLog + 1;
		}

		var deltaY = player.cells[i].speed * Math.sin(deg)/ slowDown;
		var deltaX = player.cells[i].speed * Math.cos(deg)/ slowDown;

		if(player.cells[i].speed > 6.25) {
			player.cells[i].speed -= 0.5;
		}
		if (dist < (50 + player.cells[i].radius)) {
			deltaY *= dist / (50 + player.cells[i].radius);
			deltaX *= dist / (50 + player.cells[i].radius);
		}
		if (!isNaN(deltaY)) {
			player.cells[i].y += deltaY;
		}
		if (!isNaN(deltaX)) {
			player.cells[i].x += deltaX;
		}
		// Find best solution.
		for(var j=0; j<player.cells.length; j++) {
			if(j != i && player.cells[i] !== undefined) {
				var distance = Math.sqrt(Math.pow(player.cells[j].y-player.cells[i].y,2) + Math.pow(player.cells[j].x-player.cells[i].x,2));
				var radiusTotal = (player.cells[i].radius + player.cells[j].radius);
				if(distance < radiusTotal) {
					if(player.lastSplit > new Date().getTime() - 1000 * c.mergeTimer) {
						if(player.cells[i].x < player.cells[j].x) {
							player.cells[i].x--;
						} else if(player.cells[i].x > player.cells[j].x) {
							player.cells[i].x++;
						}
						if(player.cells[i].y < player.cells[j].y) {
							player.cells[i].y--;
						} else if((player.cells[i].y > player.cells[j].y)) {
							player.cells[i].y++;
						}
					}
					else if(distance < radiusTotal / 1.75) {
						player.cells[i].mass += player.cells[j].mass;
						player.cells[i].radius = util.massToRadius(player.cells[i].mass);
						player.cells.splice(j, 1);
					}
				}
			}
		}
		if(player.cells.length > i) {
			var borderCalc = player.cells[i].radius / 3;
			if (player.cells[i].x > c.gameWidth - borderCalc) {
				player.cells[i].x = c.gameWidth - borderCalc;
			}
			if (player.cells[i].y > c.gameHeight - borderCalc) {
				player.cells[i].y = c.gameHeight - borderCalc;
			}
			if (player.cells[i].x < borderCalc) {
				player.cells[i].x = borderCalc;
			}
			if (player.cells[i].y < borderCalc) {
				player.cells[i].y = borderCalc;
			}
			x += player.cells[i].x;
			y += player.cells[i].y;
		}
	}
	player.x = x/player.cells.length;
	player.y = y/player.cells.length;
}

io.sockets.on('connection', function (socket) {
    console.log("Client " + socket.id + " connected");

	var type = socket.handshake.query.type;
	var position = 'farthest';
	var cells = [];

	if(type === 'player') {
		cells = [{
			x: position.x,
			y: position.y,
		}];
	}

	var currentPlayer = {
		id: socket.id,
		x: position.x,
		y: position.y,
		w: 10,
		h: 10,
		cells: cells,
		hue: Math.round(Math.random() * 360),
		type: type,
		lastHeartbeat: new Date().getTime(),
		target: {
			x: 0,
			y: 0
		}
	};

	socket.on('gotit', function (player) {
		console.log('[INFO] Player ' + player.name + ' connecting!');

		if (util.findIndex(users, player.id) > -1) {
			console.log('[INFO] Player ID is already connected, kicking.');
			socket.disconnect();
		} else if (!util.validNick(player.name)) {
			socket.emit('kick', 'Invalid username.');
			socket.disconnect();
		} else {
			console.log('[INFO] Player ' + player.name + ' connected!');
			sockets[player.id] = socket;

			var position = c.newPlayerInitialPosition == 'farthest' ? util.uniformPosition(users, radius) : util.randomPosition(radius);

			player.x = position.x;
			player.y = position.y;
			player.target.x = 0;
			player.target.y = 0;
			if(type === 'player') {
				player.cells = [{
					x: position.x,
					y: position.y
				}];
			}
			else {
				player.cells = [];
			}
			player.hue = Math.round(Math.random() * 360);
			currentPlayer = player;
			currentPlayer.lastHeartbeat = new Date().getTime();
			users.push(currentPlayer);

			io.emit('playerJoin', { name: currentPlayer.name });

			socket.emit('gameSetup', {
				gameWidth: c.gameWidth,
				gameHeight: c.gameHeight
			});
			console.log('Total players: ' + users.length);
		}

	});

	socket.on('pingcheck', function () {
		socket.emit('pongcheck');
	});

	socket.on('windowResized', function (data) {
		currentPlayer.screenWidth = data.screenWidth;
		currentPlayer.screenHeight = data.screenHeight;
	});

	socket.emit('message', 'Login success !');
    socket.broadcast.emit('message', 'Another socket login success! ');

    socket.on('nickname', function (nickname) {
        socket.nickname = nickname;
    });

    socket.on('message', function (message) {
        console.log(socket.nickname + ' --- ' + socket.id + ' to server : ' + message);
    });

    socket.on("disconnect", function() {
//		console.log("Client " + socket.id + " disconnected");
//		if (util.findIndex(users, currentPlayer.id) > -1)
//			users.splice(util.findIndex(users, currentPlayer.id), 1);
//		console.log('[INFO] User ' + currentPlayer.name + ' disconnected!');

		socket.broadcast.emit('playerDisconnect', { name: currentPlayer.name });
	});
});*!/
var express = require('express');
var app = express();
var serv = require('http').Server(app);
var io = require('socket.io').listen(serv);

app.get('/',function(req, res) {
	res.sendFile(__dirname + '/index.html');
});

app.use('/public', express.static(__dirname + '/public'));

serv.listen(3002);
console.log("Server 3002 started.");

var SOCKET_LIST = {};

var Entity = function(){
	var self = {
		x:250,
		y:250,
		spdX:0,
		spdY:0,
		id:"",
	}
	self.update = function(){
		self.updatePosition();
	}
	self.updatePosition = function(){
		self.x += self.spdX;
		self.y += self.spdY;
	}
	return self;
}

var Player = function(id){
	var self = Entity();
	self.id = id;
	self.number = "" + Math.floor(10 * Math.random());
	self.pressingRight = false;
	self.pressingLeft = false;
	self.pressingUp = false;
//	self.pressingDown = false;
//	self.pressingAttack = false;
	self.mouseAngle = 0;
	self.maxSpd = 10;

	var super_update = self.update;
	self.update = function(){
		self.updateSpd();
		super_update();
	}
	self.updateSpd = function(){
		if(self.pressingRight)
			self.spdX = self.maxSpd;
		else if(self.pressingLeft)
			self.spdX = -self.maxSpd;
		else
			self.spdX = 0;

		if(self.pressingUp)
			self.spdY = -self.maxSpd;
		else if(self.pressingDown)
			self.spdY = self.maxSpd;
		else
			self.spdY = 0;
	}
	Player.list[id] = self;

	initPack.player.push({
		id:self.id,
		x:self.x,
		y:self.y,
		number:self.number,
	});
	return self;
}
Player.list = {};
Player.onConnect = function(socket){ // 플레이어가 들어왔을 때 실행
	var player = Player(socket.id);
	socket.on('keyPress',function(data){
		if(data.inputId === 'left')
			player.pressingLeft = data.state;
		else if(data.inputId === 'right')
			player.pressingRight = data.state;
		else if(data.inputId === 'up')
			player.pressingUp = data.state;
		else if(data.inputId === 'down')
			player.pressingDown = data.state;
		else if(data.inputId === 'attack')
			player.pressingAttack = data.state;
		else if(data.inputId === 'mouseAngle')
			player.mouseAngle = data.state;
	});
}
Player.onDisconnect = function(socket){
	delete Player.list[socket.id];
	removePack.player.push(socket.id);
}
Player.update = function(){
	var pack = [];
	for(var i in Player.list){
		var player = Player.list[i];
		player.update();
		pack.push({
			id:player.id,
			x:player.x,
			y:player.y,
		});
	}
	return pack;
}

var DEBUG = true;

io.sockets.on('connection', function(socket){
	socket.id = Math.random();
	SOCKET_LIST[socket.id] = socket;

	Player.onConnect(socket);

	socket.on('disconnect',function(){
		delete SOCKET_LIST[socket.id];
		Player.onDisconnect(socket);
	});

	socket.on('nickname', function (nickname) {
		socket.nickname = nickname;
	});

	socket.on('message', function (message) {
		console.log(socket.nickname + ' --- ' + socket.id + ' to server : ' + message);
	});

	socket.on('evalServer',function(data){
		if(!DEBUG)
			return;
		var res = eval(data);
		socket.emit('evalAnswer',res);
	});
});

var initPack = {player:[]};
var removePack = {player:[]};


setInterval(function(){
	var pack = {
		player:Player.update(),
	}

	for(var i in SOCKET_LIST){
		var socket = SOCKET_LIST[i];
		socket.emit('init',initPack);
		socket.emit('update',pack);
		socket.emit('remove',removePack);
	}
	initPack.player = [];
	removePack.player = [];

},1000/25);*/

var express = require('express');
var app = express();
var serv = require('http').Server(app);
var io = require('socket.io').listen(serv);

app.get('/',function(req, res) {
	res.sendFile(__dirname + '/index.html');
});

app.use('/public', express.static(__dirname + '/public'));

serv.listen(3002);
console.log("Server 3002 started.");

var SOCKET_LIST = {};

var Entity = function(){
	var self = {
		x:250,
		y:250,
		spdX:0,
		spdY:0,
		id:"",
	}
	self.update = function(){
		self.updatePosition();
	}
	self.updatePosition = function(){
		self.x += self.spdX;
		self.y += self.spdY;
	}
	self.getDistance = function(pt){
		return Math.sqrt(Math.pow(self.x-pt.x,2) + Math.pow(self.y-pt.y,2));
	}
	return self;
}

var Player = function(id){
	var self = Entity();
	self.id = id;
	self.number = "" + Math.floor(10 * Math.random());
	self.pressingRight = false;
	self.pressingLeft = false;
	self.pressingUp = false;
	self.pressingDown = false;
	self.pressingAttack = false;
	self.mouseAngle = 0;
	self.maxSpd = 10;
	self.hp = 10;
	self.hpMax = 10;
	self.score = 0;

	var super_update = self.update;
	self.update = function(){
		self.updateSpd();
		super_update();

		if(self.pressingAttack){
			self.shootBullet(self.mouseAngle);
		}
	}

	self.updateSpd = function(){
		if(self.pressingRight)
			self.spdX = self.maxSpd;
		else if(self.pressingLeft)
			self.spdX = -self.maxSpd;
		else
			self.spdX = 0;

		if(self.pressingUp)
			self.spdY = -self.maxSpd;
		else if(self.pressingDown)
			self.spdY = self.maxSpd;
		else
			self.spdY = 0;
	}

	self.getInitPack = function(){
		return {
			id:self.id,
			x:self.x,
			y:self.y,
			number:self.number,
			hp:self.hp,
			hpMax:self.hpMax,
			score:self.score,
		};
	}
	self.getUpdatePack = function(){
		return {
			id:self.id,
			x:self.x,
			y:self.y,
			hp:self.hp,
			score:self.score,
		}
	}

	Player.list[id] = self;

	initPack.player.push(self.getInitPack());
	return self;
}
Player.list = {};
Player.onConnect = function(socket){
	var player = Player(socket.id);
	socket.on('keyPress',function(data){
		if(data.inputId === 'left')
			player.pressingLeft = data.state;
		else if(data.inputId === 'right')
			player.pressingRight = data.state;
		else if(data.inputId === 'up')
			player.pressingUp = data.state;
		else if(data.inputId === 'down')
			player.pressingDown = data.state;
		else if(data.inputId === 'attack')
			player.pressingAttack = data.state;
		else if(data.inputId === 'mouseAngle')
			player.mouseAngle = data.state;
	});

	socket.emit('init',{
		player:Player.getAllInitPack(),
		bullet:Bullet.getAllInitPack(),
	})
}
Player.getAllInitPack = function(){
	var players = [];
	for(var i in Player.list)
		players.push(Player.list[i].getInitPack());
	return players;
}

Player.onDisconnect = function(socket){
	delete Player.list[socket.id];
	removePack.player.push(socket.id);
}
Player.update = function(){
	var pack = [];
	for(var i in Player.list){
		var player = Player.list[i];
		player.update();
		pack.push(player.getUpdatePack());
	}
	return pack;
}

var DEBUG = true;

var isValidPassword = function(data,cb){
	db.account.find({username:data.username,password:data.password},function(err,res){
		if(res.length > 0)
			cb(true);
		else
			cb(false);
	});
}
var isUsernameTaken = function(data,cb){
	db.account.find({username:data.username},function(err,res){
		if(res.length > 0)
			cb(true);
		else
			cb(false);
	});
}
var addUser = function(data,cb){
	db.account.insert({username:data.username,password:data.password},function(err){
		cb();
	});
}

//var io = require('socket.io');
io.sockets.on('connection', function(socket){
	socket.id = Math.random();
	SOCKET_LIST[socket.id] = socket;

	Player.onConnect(socket);

	socket.on('disconnect',function(){
		delete SOCKET_LIST[socket.id];
		Player.onDisconnect(socket);
	});
	socket.on('sendMsgToServer',function(data){
		var playerName = ("" + socket.id).slice(2,7);
		for(var i in SOCKET_LIST){
			SOCKET_LIST[i].emit('addToChat',playerName + ': ' + data);
		}
	});

	socket.on('evalServer',function(data){
		if(!DEBUG)
			return;
		var res = eval(data);
		socket.emit('evalAnswer',res);
	});



});

var initPack = {player:[]};
var removePack = {player:[]};


setInterval(function(){
	var pack = {
		player:Player.update(),
	}

	for(var i in SOCKET_LIST){
		var socket = SOCKET_LIST[i];
		socket.emit('init',initPack);
		socket.emit('update',pack);
		socket.emit('remove',removePack);
	}
	initPack.player = [];
	removePack.player = [];
},1000/25);