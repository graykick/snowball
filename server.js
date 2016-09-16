var
    http = require('http'),
    fs = require('fs'),

    express = require('express'),
    app = express(),
    server = http.createServer(app),
    io = require('socket.io').listen(server),

    PORT = 3002;

app.use('/public', express.static(__dirname + '/public'));

app.get('/', function (req, res) {
    fs.readFile('index.html', 'utf-8', function (error, content) {
        res.writeHead(200, {"Content-Type": "text/html"});
        res.end(content);
    });
});


io.sockets.on('connection', function (socket) {
    console.log("Client " + socket.id + " connected");

    socket.emit('message', 'Login success !');
    socket.broadcast.emit('message', 'Another socket login success! ');

    socket.on('nickname', function (nickname) {
        socket.nickname = nickname;
    });

    socket.on('message', function (message) {
        console.log(socket.nickname + ' --- ' + socket.id + ' to server : ' + message);
    });

    return socket.on("disconnect", function() {
        return console.log("Client " + socket.id + " disconnected");
    });
});


server.listen(port = Number(process.env.PORT || PORT), function() {
    console.log("Server "+PORT+" listening");
});