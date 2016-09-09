(function() {
    if (window["WebSocket"]) {
        $(document).ready(function() {
            var animate, canvas, connect, context, id, sendDirection, server;
            server = null;
            canvas = $("#myCanvas");
            context = canvas.get(0).getContext("2d");
            id = null;
            sendDirection = function(direction) {
                if (server) {
                    return server.send(JSON.stringify({
                        'direction': direction
                    }));
                }
            };
            connect = function() {
                server = new io.Socket("localhost", {
                    'port': 3000
                });
                server.connect();
                return server.on("message", function(event) {
                    var message;
                    message = JSON.parse(event);
                    switch (message.type) {
                        case 'id':
                            return id = message.value;
                        case 'snakes':
                            return animate(message.value);
                    }
                });
            };
            connect();
            return $(document).keydown(function(event) {
                var key;
                key = event.keyCode ? event.keyCode : event.which;
                switch (key) {
                    case 37:
                        return sendDirection("left");
                    case 38:
                        return sendDirection("up");
                    case 39:
                        return sendDirection("right");
                    case 40:
                        return sendDirection("down");
                }
            });
        });
    } else {
        alert("Your browser does not support websockets.");
    }
}).call(this);