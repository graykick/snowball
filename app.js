var http = require('http');
var fs = require('fs');
var express = require('express');
var app = express();
var server          = http.createServer(app);




var io = require('socket.io').listen(server);

app.get('/', function (req, res) {
      fs.readFile('index.html', 'utf-8', function(error, content) {
        res.writeHead(200, {"Content-Type": "text/html"});
        res.end(content);
    });
});

app.get('/maps', function (req, res) {
      fs.readFile('map.png', function(error, content) {
        res.writeHead(200, {"Content-Type": "text/html"});
        res.end(content);
    });
});

app.get('/skels', function (req, res) {
      fs.readFile('skeleton.png', function(error, content) {
        res.writeHead(200, {"Content-Type": "text/html"});
        res.end(content);
    });
});

io.sockets.on('connection', function (socket) {
    console.log('connected...' + socket.id);

    socket.emit('message', 'you are logged in !');
    socket.broadcast.emit('message', 'another client just logged in! ');

    socket.on('nickname', function(nickname) {
        socket.nickname = nickname;
    });

    socket.on('message', function (message) {
        console.log(socket.nickname + ' -- ' + socket.id +'; tells me he said to me : ' + message);
    });
});


server.listen(3000, function(){
    console.log("sever at http://127.0.0.1:3000")
});