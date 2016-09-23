var Img = {};
Img.player = new Image();
Img.player.src = '/public/image/skeleton.png';
var skeletonSheet = new spriteSheet(Img.player, 9,2,64,64);

Img.map = new Image();
Img.map.src = '/public/image/map.png';

var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');
canvas.width = 1340;
canvas.height = 640;

var socket = io();

socket.on('newPosition',function(data){
    ctx.clearRect(0,0,500,500); // 캔버스를 깨끗이
    ctx.drawImage(Img.map, 0, 0, 1340, 640, 0, 0, canvas.width, canvas.height);
    for (var i=0; i<data.length; i++){
        ctx.drawImage(skeletonSheet.getSheet(data[i].ImageIndex), data[i].locationX-32, data[i].locationY-32);
    }
});

document.onkeydown = function(event){
    if(event.keyCode === 68) {	//d
        console.log("sibddal");
        socket.emit('keyPress', {inputId: 'right', state: true});
    }
    else if(event.keyCode === 65) //a
        socket.emit('keyPress',{inputId:'left',state:true});
    else if(event.keyCode === 87) // w
        socket.emit('keyPress',{inputId:'up',state:true});

}
document.onkeyup = function(event){
    if(event.keyCode === 68)	//d
        socket.emit('keyPress',{inputId:'right',state:false});
    else if(event.keyCode === 65) //a
        socket.emit('keyPress',{inputId:'left',state:false});
    else if(event.keyCode === 87) // w
        socket.emit('keyPress',{inputId:'up',state:false});
}
